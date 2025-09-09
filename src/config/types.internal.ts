import { Platform, SyncType } from '~config/types';

import { SdkSdkContext } from '~api/types';

import { ILogger, LogLevel } from '~logger/types';

export interface FsSettings {
  readonly sdkKey: string;
  readonly sync: {
    type: (typeof SyncType)[keyof typeof SyncType];
    pollRateInSec: number;
  };
  readonly tracking: {
    impressions: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
    events: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
  };
  readonly urls: {
    ws: string;
    sse: string;
    flags: string;
    events: string;
  };
  readonly logLevel?: LogLevel;
  log: ILogger;
  customLogger: Partial<ILogger>;
  platform: (typeof Platform)[keyof typeof Platform];
  metadata: Record<string, any>;
  sdkContext: SdkSdkContext;
}
