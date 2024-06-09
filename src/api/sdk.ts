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
  SdkEnvironmentFlagRulesGetRequest,
  SdkEnvironmentFlagRulesGetResponse,
  SdkInitServerRequest,
} from './data-contracts';

export class Sdk<
  SecurityDataType = unknown,
> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @name SdkControllerInitServerContext
   * @request POST:/sdk/init-server
   */
  sdkControllerInitServerContext = (
    data: SdkInitServerRequest,
    params: RequestParams = {},
  ) =>
    this.request<void, void>({
      path: `/sdk/init-server`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      ...params,
    });
  /**
   * No description
   *
   * @name SdkControllerGetFlagRules
   * @request POST:/sdk/rules
   */
  sdkControllerGetFlagRules = (
    data: SdkEnvironmentFlagRulesGetRequest,
    params: RequestParams = {},
  ) =>
    this.request<SdkEnvironmentFlagRulesGetResponse, void>({
      path: `/sdk/rules`,
      method: 'POST',
      body: data,
      type: ContentType.Json,
      format: 'json',
      ...params,
    });
}
