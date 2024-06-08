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

export interface SdkUserContext {
  key: string;
  attributes?: object;
}

export interface SdkContext {
  sdkName: string;
  sdkVersion: string;
}

export interface SdkEnvironmentFlagsGetRequest {
  context: SdkUserContext;
  sdkContext: SdkContext;
}

export interface SdkEnvironmentFlagsGetResponse {
  flags: object;
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagRulesGetRequest {
  context: SdkUserContext;
  sdkContext: SdkContext;
}

export interface VariantDto {
  variantId: number;
  dataTypeCode: 'BOOL' | 'STR' | 'NUM' | 'JSON';
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  jsonValue: object;
  numberValue: number;
  stringValue: string;
  booleanValue: boolean;
}

export interface FeatureFlagDto {
  featureFlagId: number;
  name: string;
  key: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  variants: VariantDto[];
}

export interface PercentageRolloutEntryDto {
  variantId: number;
  percentage: number;
}

export interface TargetingRuleClauseAttributeCustomDto {
  attributeId: number;
  name: string;
}

export interface TargetingRuleClauseValueDto {
  targetingRuleClauseValueId: number;
  value: string;
}

export interface TargetingRuleClauseDto {
  targetingRuleClauseId: number;
  order: number;
  operator:
    | 'IOO'
    | 'INOO'
    | 'EW'
    | 'DNEW'
    | 'SW'
    | 'DNSW'
    | 'MR'
    | 'DNMR'
    | 'LT'
    | 'LTE'
    | 'GT'
    | 'GTE'
    | 'SVLT'
    | 'SVLTE'
    | 'SVGT'
    | 'SVGTE';
  attribute: 'EMAIL' | 'KEY' | 'IP' | 'COUNTRY' | 'CUSTOM';
  customAttribute: TargetingRuleClauseAttributeCustomDto;
  values: TargetingRuleClauseValueDto[];
  createdAt: string;
  updatedAt: string;
}

export interface VariantEnvironmentTargetingRuleDto {
  variantEnvironmentTargetingRuleId: number;
  variantId: number;
  name: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  clauses: TargetingRuleClauseDto[];
}

export interface FeatureFlagStateDto {
  featureFlagEnvironmentStateId: number;
  environmentId: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  enabledSingleVariantId: number;
  disabledSingleVariantId: number;
  seed: string;
  percentageRollout: PercentageRolloutEntryDto[];
  targetingRules: VariantEnvironmentTargetingRuleDto[];
}

export interface FeatureFlagEnvironmentDetailDto {
  organizationId: number;
  workspaceId: number;
  environmentId: number;
  featureFlag: FeatureFlagDto;
  state: FeatureFlagStateDto;
}

export interface SdkEnvironmentFlagRulesGetResponse {
  placeholder: FeatureFlagEnvironmentDetailDto[];
  flags: Record<string, FeatureFlagEnvironmentDetailDto>;
  context: SdkUserContext;
}

export interface SdkEnvironmentFlagGetRequest {
  context: SdkUserContext;
  sdkContext: SdkContext;
}

export interface SdkEnvironmentFlagGetResponse {
  flag: object;
  context: SdkUserContext;
}

export interface SdkTrackEvent {
  eventKey: string;
  value?: number | null;
  properties?: object | null;
  timestamp: string;
}

export interface SdkTrackEventRequest {
  context: SdkUserContext;
  events: SdkTrackEvent[];
  sdkContext: SdkContext;
}

export interface SdkTrackImpression {
  flagKey: string;
  flagValue: object;
  timestamp: string;
}

export interface SdkTrackImpressionsRequest {
  impressions: SdkTrackImpression[];
  context: SdkUserContext;
  sdkContext: SdkContext;
}
