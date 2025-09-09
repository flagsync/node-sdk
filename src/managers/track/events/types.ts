import { SdkServerTrackEvent, SdkUserContext } from '~api/types';

export interface IEventsManager {
  start: () => void;
  pop: () => SdkServerTrackEvent[];
  isEmpty: () => boolean;
  flushQueueAndStop: () => Promise<void>;
  stopSubmitter: () => void;
  track: (
    context: SdkUserContext,
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) => void;
}
