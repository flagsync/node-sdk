import { FsClient } from '~sdk/client/fs-client';

import { FsConfig } from '~config/types';

import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

export { FsServiceError };
export { ServiceErrorFactory };
export * from '~config/types';
export type { LogLevel } from '~logger/types';
export type { FsUserContext } from '~config/types';
export type {
  FsEventTypePayload,
  EventCallback,
  FsEventType,
} from '~managers/event/types';

export { NoExplicitReturn } from '~managers/flag/types';

export type {
  FeatureFlags,
  NoExplicitReturnType,
  IsFeatureFlagsEmpty,
  FlagReturnType,
} from '~managers/flag/types';

export { FsEvent } from '~managers/event/types';

export type FsErrorSource = 'api' | 'sdk';
export type FsErrorEvent = {
  type: FsErrorSource;
  error: Error | FsServiceError;
};

export type { FsClient };

export function FlagSyncFactory(config: FsConfig): {
  client: () => FsClient;
} {
  const client = new FsClient(config);
  return {
    client: () => client,
  };
}
