import { HttpClient, RequestParams } from '~api/clients/http-client';

import {
  SdkServerTrackEventRequest,
  SdkServerTrackImpressionsRequest,
} from '../types';

export class TrackClient extends HttpClient {
  /**
   * No description
   *
   * @name SdkTrackControllerPostServerBatchEvents
   * @request POST:/track/events/server
   */
  sdkTrackControllerPostServerBatchEvents = (
    data: SdkServerTrackEventRequest,
    params: RequestParams = {},
  ) =>
    this.request<void>({
      path: `/track/events/server`,
      method: 'POST',
      body: data,
      ...params,
    });

  /**
   * No description
   *
   * @name SdkTrackControllerPostServerBatchImpressions
   * @request POST:/track/impressions/server
   */
  sdkTrackControllerPostServerBatchImpressions = (
    data: SdkServerTrackImpressionsRequest,
    params: RequestParams = {},
  ) =>
    this.request<void>({
      path: `/track/impressions/server`,
      method: 'POST',
      body: data,
      ...params,
    });
}
