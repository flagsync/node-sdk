import { HttpClient, RequestParams } from '~api/clients/http-client';

import {
  SdkEnvironmentFlagRulesGetResponse,
  SdkInitServerRequest,
} from '../types';

export class SdkClient extends HttpClient {
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
    this.request<void>({
      path: `/sdk/init-server`,
      method: 'POST',
      body: data,
      ...params,
    });
  /**
   * No description
   *
   * @name SdkControllerGetFlagRules
   * @request GET:/sdk/rules
   */
  sdkControllerGetFlagRules = (params: RequestParams = {}) =>
    this.request<SdkEnvironmentFlagRulesGetResponse>({
      path: `/sdk/rules`,
      method: 'GET',
      ...params,
    });
}
