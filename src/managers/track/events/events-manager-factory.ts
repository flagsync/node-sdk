import { FsSettings } from '~config/types.internal';

import { TrackClient } from '~api/clients/track-client';

import { FsEvent, IEventManager } from '~managers/event/types';
import { eventsManager } from '~managers/track/events/events-manager';
import { IEventsManager } from '~managers/track/events/types';

export function eventsManagerFactory(
  settings: FsSettings,
  track: TrackClient,
  eventManager: IEventManager,
): IEventsManager {
  const manager = eventsManager(settings, track, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
