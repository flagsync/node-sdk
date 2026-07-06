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
   * The sync managers emit internal events when updates are received.
   * UPDATE_RECEIVED carries a partial set (legacy SSE updates) and is merged;
   * UPDATE_RECEIVED_FULL carries the entire flag set (poll, WebSocket, and
   * full-sync SSE) and replaces the store, so deleted flags drop out.
   */
  eventManager.internal.on(
    FsIntervalEvent.UPDATE_RECEIVED,
    (flagSet: FsFlagSet) => {
      manager.set(flagSet);
      eventManager.emit(FsEvent.SDK_UPDATE);
    },
  );

  eventManager.internal.on(
    FsIntervalEvent.UPDATE_RECEIVED_FULL,
    (flagSet: FsFlagSet) => {
      manager.replace(flagSet);
      eventManager.emit(FsEvent.SDK_UPDATE);
    },
  );

  return manager;
}
