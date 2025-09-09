import { FsSettings } from '~config/types.internal';

import { SdkClient } from '~api/clients/sdk-client';
import { TrackClient } from '~api/clients/track-client';

export type ApiClientFactory = {
  sdk: SdkClient;
  track: TrackClient;
};

let client: ApiClientFactory;

export function apiClientFactory(params: FsSettings) {
  if (client) {
    return client;
  }

  client = {
    sdk: new SdkClient({
      baseURL: params.urls.flags,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    }),
    track: new TrackClient({
      baseURL: params.urls.events,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-ridgeline-key': params.sdkKey,
      },
    }),
  };

  return client;
}
