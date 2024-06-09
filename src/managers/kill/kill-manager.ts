import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { IKillManager } from '~managers/kill/types';
import { ISyncManager } from '~managers/sync/types';
import { ITrackManager } from '~managers/track/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const format = formatMsg.bind(null, 'kill-manager');

export function killManager(
  settings: FsSettings,
  eventManager: IEventManager,
  syncManager: ISyncManager,
  trackManager: ITrackManager,
): IKillManager {
  const { log } = settings;

  let killing = false;

  async function destroy(): Promise<void> {
    if (!killing) {
      killing = true;
      log.info(format(MESSAGE.KILL_KILLING));
      for (const eventKey in FsEvent) {
        eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
      }
      syncManager.kill();
      eventManager.kill();
      await trackManager.kill();
    } else {
      log.info(format(MESSAGE.KILL_ALREADY_KILLING));
    }
  }

  process.on('exit', destroy); // Process termination event
  process.on('SIGINT', destroy); // Signal handling (SIGINT)
  process.on('SIGTERM', destroy); // Signal handling (SIGTERM)

  return {
    destroy,
  };
}
