import { FsSettings } from '~config/types.internal';

import { TrackClient } from '~api/clients/track-client';

import { IEventManager } from '~managers/event/types';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import { ITrackManager } from '~managers/track/types';

export function trackManagerFactory(
  settings: FsSettings,
  track: TrackClient,
  eventManager: IEventManager,
): ITrackManager {
  const impressionsManager = impressionsManagerFactory(
    settings,
    track,
    eventManager,
  );
  const eventsManager = eventsManagerFactory(settings, track, eventManager);

  async function kill(): Promise<void> {
    await impressionsManager.flushQueueAndStop();
    await eventsManager.flushQueueAndStop();
  }

  return {
    kill,
    eventsManager,
    impressionsManager,
  };
}
