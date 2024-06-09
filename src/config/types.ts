import { FeatureFlagEnvironmentDetailDto } from '~api/data-contracts';

import { ILogger, LogLevel } from '~logger/types';

export type FsFlagSet = Record<string, FeatureFlagEnvironmentDetailDto>;

export type CustomAttributeValue = any;
export type CustomAttributes = Record<string, CustomAttributeValue>;

export type FsUserContext = {
  key: string;
  attributes?: CustomAttributes;
};

export const SyncType = {
  Stream: 'stream',
  Poll: 'poll',
  Off: 'off',
} as const;

export const Platform = {
  Node: 'node',
} as const;

export interface FsConfig {
  readonly sdkKey: string;
  readonly sync?: {
    type?: (typeof SyncType)[keyof typeof SyncType];
    pollRate?: number;
  };
  readonly tracking?: {
    impressions?: {
      maxQueueSize: number;
      pushRate: number;
    };
    events?: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls?: {
    sdk?: string;
  };
  logger?: Partial<ILogger>;
  readonly logLevel?: LogLevel;
  readonly metadata?: Record<string, any>;
}
