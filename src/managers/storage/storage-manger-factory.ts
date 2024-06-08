import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsEvent, FsIntervalEvent, IEventManager } from '~managers/event/types';
import { memoryManager } from '~managers/storage/memory-manager';

import { IStoreManager } from './types';

export function storageManagerFactory(
  params: FsSettings,
  eventManager: IEventManager,
): IStoreManager {
  const manager = memoryManager(params);

  /**
   * The sync managers emit an internal event when an update is received, either
   * by stream or poll. Streaming updates only include the changed flags, while
   * poll updates include the entire flag set. The storage manager spreads
   * the update, partial or full.
   */
  eventManager.internal.on(
    FsIntervalEvent.UPDATE_RECEIVED,
    (flagSet: FsFlagSet) => {
      manager.set(flagSet);
      eventManager.emit(FsEvent.SDK_UPDATE);
    },
  );

  return manager;
}
