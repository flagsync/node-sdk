import { FsSettings } from '~config/types.internal';

import { SdkServerTrackImpression } from '~api/types';

import { TrackCache } from '~managers/track/caches/track-cache';
import { ITrackCache } from '~managers/track/caches/types';
import { ImpressionLogStrategy } from '~managers/track/impressions/impressions-log-strategy';

export interface IImpressionCache
  extends ITrackCache<SdkServerTrackImpression> {
  track(event: SdkServerTrackImpression): void;
}

export class ImpressionsCache
  extends TrackCache<SdkServerTrackImpression>
  implements IImpressionCache
{
  constructor(settings: FsSettings, onFullQueue: () => void) {
    super({
      log: settings.log,
      maxQueueSize: settings.tracking.impressions.maxQueueSize,
      logPrefix: 'impressions-cache',
      logStrategy: new ImpressionLogStrategy(),
      onFullQueue: onFullQueue,
    });
  }

  track(impression: SdkServerTrackImpression): void {
    this.push(impression);
  }
}
