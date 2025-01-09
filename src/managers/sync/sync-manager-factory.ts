import { SyncType } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { pollManager } from '~managers/sync/poll-manager';
import { streamManager } from '~managers/sync/stream-manager';
import { ISyncManager } from '~managers/sync/types';
import { formatMsg } from '~logger/utils';
import { MESSAGE } from '~logger/messages';

const noop = () => {};

const formatter = formatMsg.bind(null, 'sync-manager-factory');

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager {
  const { log, sync } = settings;

  let manager: ISyncManager;
  switch (sync.type) {
    case SyncType.Poll:
      manager = pollManager(settings, eventManager);
      break;
    case SyncType.Stream:
      manager = streamManager(settings, eventManager);
      break;
    default:
      manager = {
        start: noop,
        kill: noop,
      };
      break;
  }

  eventManager.on(FsEvent.SDK_READY, () => {
    log.debug(`${formatter(MESSAGE.SYNC_STARTED)} - type: ${sync.type}`);
    manager.start();
  });

  return manager;
}
