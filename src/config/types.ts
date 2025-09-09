import { FeatureFlagEnvironmentDetailDto } from '~api/types';

import { ILogger, LogLevel } from '~logger/types';

export type FsFlagSet = Record<string, FeatureFlagEnvironmentDetailDto>;

export type CustomAttributeValue = any;
export type CustomAttributes = Record<string, CustomAttributeValue>;

export type FsUserContext = {
  key: string;
  attributes?: CustomAttributes;
};

export const SyncType = {
  Sse: 'sse',
  Ws: 'ws',
  Poll: 'poll',
  Off: 'off',
} as const;

export const Platform = {
  Node: 'node',
} as const;

type PollingSync = {
  type: typeof SyncType.Poll;
  pollRateInSec: number;
};

type NonPollingSync = {
  type?: Exclude<
    (typeof SyncType)[keyof typeof SyncType],
    typeof SyncType.Poll
  >;
  pollRateInSec?: never;
};

export interface FsConfig {
  readonly sdkKey: string;
  readonly sync?: PollingSync | NonPollingSync;
  readonly tracking?: {
    impressions?: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
    events?: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
  };
  readonly urls?: {
    ws?: string;
    sse?: string;
    flags?: string;
    events?: string;
  };
  logger?: Partial<ILogger>;
  readonly logLevel?: LogLevel;
  readonly metadata?: Record<string, any>;
}
