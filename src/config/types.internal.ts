import { Platform, SyncType } from '~config/types';

import { SdkSdkContext } from '~api/data-contracts';

import { ILogger, LogLevel } from '~logger/types';

export interface FsSettings {
  readonly sdkKey: string;
  readonly sync: {
    type: (typeof SyncType)[keyof typeof SyncType];
    pollRate: number;
  };
  readonly tracking: {
    impressions: {
      maxQueueSize: number;
      pushRate: number;
    };
    events: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls: {
    sdk: string;
  };
  readonly logLevel?: LogLevel;
  log: ILogger;
  customLogger: Partial<ILogger>;
  platform: (typeof Platform)[keyof typeof Platform];
  metadata: Record<string, any>;
  sdkContext: SdkSdkContext;
}
