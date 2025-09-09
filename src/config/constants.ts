import { FsSettings } from '~config/types.internal';

export const UNREADY_FLAG_VALUE: string = 'control';

const SDK_URLS = {
  api: 'https://sdk.flagsync.com',
  worker: 'https://sdk.flagsync.com/worker',
};

export const DEFAULT_CONFIG = {
  sdkKey: undefined,
  bootstrap: {},
  sync: {
    type: 'ws',
    pollRateInSec: 60,
  },
  tracking: {
    impressions: {
      maxQueueSize: 50,
      pushRateInSec: 60,
    },
    events: {
      maxQueueSize: 50,
      pushRateInSec: 60,
    },
  },
  urls: {
    ws: SDK_URLS.worker,
    flags: SDK_URLS.worker,
    sse: SDK_URLS.api,
    events: SDK_URLS.api,
  },
  debug: false,
} as unknown as FsSettings;
