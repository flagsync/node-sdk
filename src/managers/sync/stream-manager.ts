import { EventSource } from 'eventsource';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

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

export const streamManager = (
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager => {
  const { urls, log, sdkContext } = settings;

  let es: EventSource;

  function start() {
    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     */
    es = new EventSource(`${urls.sse}/sse/sdk-updates/server`, {
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

    /**
     * For debug only
     */
    es.onopen = () => {
      log.debug(formatter(MESSAGE.STREAM_CONNECTED));
    };

    /**
     * When a message is received, parse the JSON and emit an event
     * to the event manager. This is only a partial update, that is,
     * the flag that changed.
     * @param event
     */
    es.onmessage = (event) => {
      try {
        const flagRule = JSON.parse(event.data) as FsFlagSet;
        log.debug(formatter(MESSAGE.STREAM_MESSAGE_RECEIVED));
        eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, flagRule);
      } catch (error) {
        log.error(formatter(MESSAGE.STREAM_MALFORMED_EVENT), error?.toString());
      }
    };

    es.onerror = (event: Event) => {
      switch (es.readyState) {
        case es.CONNECTING:
          log.debug(formatter(MESSAGE.STREAM_RECONNECT));
          break;
        case es.OPEN:
          log.debug(formatter(MESSAGE.STREAM_CONN_OPEN));
          break;
        case es.CLOSED:
          log.debug(formatter(MESSAGE.STREAM_CONN_CLOSE));
          break;
        default:
          log.debug(
            `${formatter(MESSAGE.STREAM_UNKNOWN_EVENT_STATE)}: "${es.readyState}"`,
            event.toString(),
          );
      }
    };
  }

  function kill() {
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
