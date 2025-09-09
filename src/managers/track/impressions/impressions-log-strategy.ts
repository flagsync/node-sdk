import { SdkServerTrackImpression } from '~api/types';

import { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class ImpressionLogStrategy
  implements ITrackCacheLogStrategy<SdkServerTrackImpression>
{
  getLogItem(item: SdkServerTrackImpression): [string, string] {
    return [item.flagKey, JSON.stringify(item.flagValue)];
  }
}
