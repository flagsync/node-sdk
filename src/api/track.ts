/* eslint-disable */

/* tslint:disable */

/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
import {
  ContentType,
  HttpClient,
  RequestParams,
} from '~api/clients/http-client';

import {
  SdkServerTrackEventRequest,
  SdkServerTrackImpressionsRequest,
} from './data-contracts';

export class Track<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
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
    this.request<void, void>({
      path: `/track/events/server`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
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
    this.request<void, void>({
      path: `/track/impressions/server`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
