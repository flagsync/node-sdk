import { SdkServerTrackEvent } from '~api/types';

import { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class EventLogStrategy
  implements ITrackCacheLogStrategy<SdkServerTrackEvent>
{
  getLogItem(item: SdkServerTrackEvent): [string, string] {
    return [item.eventKey, JSON.stringify(item)];
  }
}
