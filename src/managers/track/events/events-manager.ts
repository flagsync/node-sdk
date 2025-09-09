import { FsSettings } from '~config/types.internal';

import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { TrackClient } from '~api/clients/track-client';

import { FsEvent, IEventManager } from '~managers/event/types';
import { EventsCache } from '~managers/track/events/events-cache';
import { IEventsManager } from '~managers/track/events/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const START_DELAY_MS = 3000;

const formatter = formatMsg.bind(null, 'events-manager');

export function eventsManager(
  settings: FsSettings,
  track: TrackClient,
  eventManager: IEventManager,
): IEventsManager {
  const {
    log,
    sdkContext,
    tracking: {
      events: { pushRateInSec },
    },
  } = settings;

  const cache = new EventsCache(settings, flushQueue);

  let timeout: number | NodeJS.Timeout;
  const interval = pushRateInSec * 1000;

  async function batchSend(): Promise<void> {
    if (cache.isEmpty()) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(batchSend, interval);
      return;
    }

    const sendQueue = cache.pop();

    try {
      await track.sdkTrackControllerPostServerBatchEvents({
        events: sendQueue,
        sdkContext,
      });
      log.debug(
        `${formatter(MESSAGE.TRACK_BATCH_SENT)} (${sendQueue.length} events)`,
      );
    } catch (e) {
      const error = await ServiceErrorFactory.create(e);
      log.error(
        formatter(MESSAGE.TRACK_SEND_FAIL),
        error.path,
        error.errorCode,
        error.message,
      );
      eventManager.emit(FsEvent.ERROR, {
        type: 'api',
        error: error,
      });
    } finally {
      timeout = setTimeout(batchSend, interval);
    }
  }

  async function flushQueue() {
    log.debug(formatter(MESSAGE.TRACK_FLUSHING));
    await batchSend();
  }

  function start() {
    log.debug(`${formatter(MESSAGE.TRACK_STARTING)} (${START_DELAY_MS}ms)`);
    timeout = setTimeout(batchSend, START_DELAY_MS);
  }

  async function flushQueueAndStop(): Promise<void> {
    try {
      await flushQueue();
    } finally {
      stopSubmitter();
    }
  }

  function stopSubmitter() {
    if (timeout) {
      log.debug(formatter(MESSAGE.TRACK_STOPPING));
      clearTimeout(timeout);
    }
  }

  return {
    start,
    stopSubmitter,
    flushQueueAndStop,
    pop: () => cache.pop(),
    isEmpty: () => cache.isEmpty(),
    track: cache.track.bind(cache),
  };
}
