import { SdkServerTrackImpression } from '~api/types';

export type PartialTrackImpression = Pick<
  SdkServerTrackImpression,
  'flagKey' | 'flagValue' | 'context'
>;

export interface IImpressionsManager {
  start: () => void;
  flushQueueAndStop: () => Promise<void>;
  stopSubmitter: () => void;
  isEmpty: () => boolean;
  pop: () => SdkServerTrackImpression[];
  track: (impression: PartialTrackImpression) => void;
}
