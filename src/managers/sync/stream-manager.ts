import { EventSource } from 'eventsource';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { apiClientFactory } from '~api/api-client-factory';

import { FsIntervalEvent, IEventManager } from '~managers/event/types';
import { ISyncManager } from '~managers/sync/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'stream-manager');

/**
 * Next.js patches the global fetch with caching layers (the Data Cache, and
 * in `next dev` an HMR cache) that clone the response and buffer its entire
 * body. An SSE body never ends, so buffering it leaks memory and logs
 * "Failed to set fetch cache <url> TypeError: terminated" once the connection
 * drops. `eventsource` already sends `cache: 'no-store'`, but the dev-time
 * HMR cache buffers even `no-store` requests, so prefer the original,
 * un-patched fetch that Next.js exposes on the patched function.
 */
function getBaseFetch(): typeof fetch {
  const patched = globalThis.fetch as typeof fetch & {
    _nextOriginalFetch?: typeof fetch;
  };
  return patched._nextOriginalFetch ?? patched;
}

/**
 * The server emits a heartbeat every 25s to keep intermediaries (Cloudflare)
 * from closing the connection as idle. If nothing at all arrives for several
 * heartbeat periods, the connection is presumed half-dead and restarted.
 */
const STALE_CONNECTION_TIMEOUT_MS = 80_000;

export const streamManager = (
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager => {
  const { urls, log, sdkContext } = settings;
  const { sdk } = apiClientFactory(settings);

  let es: EventSource | undefined;
  let watchdog: NodeJS.Timeout | undefined;
  let killed = false;
  let hasConnected = false;

  /**
   * Servers that support full-set sync send the entire ruleset as named
   * "flags" events. Once one is seen, legacy partial "message" events are
   * ignored to avoid applying the same change twice.
   */
  let serverSupportsFullSync = false;

  /**
   * Restart the connection if no event, heartbeat, or open arrives within
   * the stale window. Catches half-dead sockets that emit no error, which
   * `EventSource` would otherwise never recover from.
   */
  function resetWatchdog() {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      log.warn(formatter(MESSAGE.STREAM_STALE));
      es?.close();
      start();
    }, STALE_CONNECTION_TIMEOUT_MS);
    watchdog.unref?.();
  }

  /**
   * Updates emitted while the connection was down are lost — there is no
   * replay on reconnect — so fetch the full ruleset to converge the store.
   */
  async function resyncOnReconnect() {
    try {
      const res = await sdk.sdkControllerGetFlagRules();
      eventManager.internal.emit(
        FsIntervalEvent.UPDATE_RECEIVED_FULL,
        res?.flags ?? {},
      );
      log.debug(formatter(MESSAGE.STREAM_RESYNC_SUCCESS));
    } catch (error) {
      log.error(formatter(MESSAGE.STREAM_RESYNC_FAILED), error?.toString());
    }
  }

  function start() {
    if (killed) {
      return;
    }

    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     * Handlers close over `source` rather than the reassignable `es`, so a
     * lingering handler from a restarted connection can't act on the new one.
     */
    const source = new EventSource(`${urls.sse}/sse/sdk-updates/server`, {
      withCredentials: true,
      fetch: (input, init) =>
        getBaseFetch()(input, {
          ...init,
          headers: {
            ...init.headers,
            'x-ridgeline-key': settings.sdkKey,
            'x-ridgeline-sdk-ctx': JSON.stringify(sdkContext),
          },
        }),
    });
    es = source;

    resetWatchdog();

    source.onopen = () => {
      log.debug(formatter(MESSAGE.STREAM_CONNECTED));
      resetWatchdog();
      if (hasConnected) {
        resyncOnReconnect();
      }
      hasConnected = true;
    };

    /**
     * Full-set sync: the server sends the entire ruleset, which replaces
     * the store. This is how flag creates and deletes take effect.
     * @param event
     */
    source.addEventListener('flags', (event) => {
      resetWatchdog();
      try {
        const flagSet = JSON.parse(event.data) as FsFlagSet;
        log.debug(formatter(MESSAGE.STREAM_FULL_SET_RECEIVED));
        serverSupportsFullSync = true;
        eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED_FULL,
          flagSet,
        );
      } catch (error) {
        log.error(formatter(MESSAGE.STREAM_MALFORMED_EVENT), error?.toString());
      }
    });

    /**
     * Heartbeats carry no data; they keep intermediaries from closing the
     * connection as idle and feed the staleness watchdog.
     */
    source.addEventListener('heartbeat', () => {
      resetWatchdog();
    });

    /**
     * Legacy partial update: only the changed flag, merged into the store.
     * Servers that send full-set "flags" events also send these for older
     * SDKs; ignore them once full-set support has been observed.
     * @param event
     */
    source.onmessage = (event) => {
      resetWatchdog();
      if (serverSupportsFullSync) {
        return;
      }
      try {
        const flagRule = JSON.parse(event.data) as FsFlagSet;
        log.debug(formatter(MESSAGE.STREAM_MESSAGE_RECEIVED));
        eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, flagRule);
      } catch (error) {
        log.error(formatter(MESSAGE.STREAM_MALFORMED_EVENT), error?.toString());
      }
    };

    source.onerror = (event: Event) => {
      switch (source.readyState) {
        case source.CONNECTING:
          log.debug(formatter(MESSAGE.STREAM_RECONNECT));
          break;
        case source.OPEN:
          log.debug(formatter(MESSAGE.STREAM_CONN_OPEN));
          break;
        case source.CLOSED:
          log.debug(formatter(MESSAGE.STREAM_CONN_CLOSE));
          break;
        default:
          log.debug(
            `${formatter(MESSAGE.STREAM_UNKNOWN_EVENT_STATE)}: "${source.readyState}"`,
            event.toString(),
          );
      }
    };
  }

  function kill() {
    killed = true;
    clearTimeout(watchdog);
    if (es) {
      log.debug(formatter(MESSAGE.STREAM_CONN_CLOSING));
      es.close();
    }
  }

  return {
    start,
    kill,
  };
};
