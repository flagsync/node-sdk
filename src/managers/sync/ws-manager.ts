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
  const RECONNECT_DELAY = 5000;

  function connect() {
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
          const ruleset = data.flags as FsFlagSet;
          eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, ruleset);
        }
      } catch (error) {
        console.log('ERROR ONMESSAGE', error);
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
      if (event.code !== 1000) {
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
    console.log('Starting ws manager');
    connect();
  }

  function kill() {
    if (ws && ws.readyState === ws.OPEN) {
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
