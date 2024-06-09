import { FsSettings } from '~config/types.internal';

import { IEventManager } from '~managers/event/types';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import { ITrackManager } from '~managers/track/types';

export function trackManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): ITrackManager {
  const impressionsManager = impressionsManagerFactory(settings, eventManager);
  const eventsManager = eventsManagerFactory(settings, eventManager);

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
