import WebSocket from 'ws';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsIntervalEvent, IEventManager } from '~managers/event/types';
import { ISyncManager } from '~managers/sync/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'ws-manager');

export const wsManager = (
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager => {
  const { urls, log, sdkContext } = settings;

  let ws: WebSocket;
  let reconnectTimeout: NodeJS.Timeout | null = null;
  let killed = false;
  const RECONNECT_DELAY = 5000;

  function connect() {
    if (killed) {
      return;
    }
    const wsUrl = `${urls.ws.replace('https', 'wss')}/sdk/connect`;

    ws = new WebSocket(wsUrl, {
      headers: {
        'x-ridgeline-key': settings.sdkKey,
        'x-ridgeline-sdk-ctx': JSON.stringify(sdkContext),
      },
    });

    /**
     * Fired when the WebSocket connection is opened.
     */
    ws.onopen = () => {
      log.debug(formatter(MESSAGE.STREAM_CONNECTED));
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
        reconnectTimeout = null;
      }
    };

    /**
     * Fired when a message is received.
     * @param event
     */
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data.toString());
        log.debug(formatter(MESSAGE.STREAM_MESSAGE_RECEIVED));
        if (data.type === 'flagUpdate') {
          // Sunrise always pushes the entire ruleset, so replace the store
          // rather than merge — this is how deletes propagate.
          const ruleset = data.flags as FsFlagSet;
          eventManager.internal.emit(
            FsIntervalEvent.UPDATE_RECEIVED_FULL,
            ruleset,
          );
        }
      } catch (error) {
        log.error(formatter(MESSAGE.STREAM_MALFORMED_EVENT), error?.toString());
      }
    };

    /**
     * Fired when the WebSocket connection is closed.
     */
    ws.onclose = (event) => {
      log.debug(
        formatter(MESSAGE.STREAM_CONN_CLOSE),
        `Code: ${event.code}, Reason: ${event.reason}`,
      );
      if (!killed && event.code !== 1000) {
        log.debug(formatter(MESSAGE.STREAM_RECONNECT));
        reconnectTimeout = setTimeout(connect, RECONNECT_DELAY);
      }
    };

    /**
     * Fired when an error occurs.
     */
    ws.onerror = (error) => {
      log.error(
        formatter(MESSAGE.STREAM_UNKNOWN_EVENT_STATE),
        error?.toString(),
      );
    };
  }

  function start() {
    connect();
  }

  /**
   * A kill must tear down whatever state the connection cycle is in: a
   * pending reconnect timer or a CONNECTING socket would otherwise keep the
   * event loop alive (and reconnect after shutdown), hanging SIGINT.
   */
  function kill() {
    killed = true;
    if (reconnectTimeout) {
      clearTimeout(reconnectTimeout);
      reconnectTimeout = null;
    }
    if (ws && ws.readyState === ws.CONNECTING) {
      // close() mid-handshake surfaces an abort error; terminate() doesn't.
      log.debug(formatter(MESSAGE.STREAM_CONN_CLOSING));
      ws.terminate();
    } else if (ws && ws.readyState === ws.OPEN) {
      log.debug(formatter(MESSAGE.STREAM_CONN_CLOSING));
      // Use code 1000 for normal closure
      ws.close(1000, 'SDK shutting down.');
    }
  }

  return {
    start,
    kill,
  };
};
