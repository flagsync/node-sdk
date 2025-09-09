export interface SdkUserContext {
  key: string;
  attributes?: object;
}

export interface SdkSdkContext {
  sdkName: string;
  sdkVersion: string;
}

export interface SdkInitServerRequest {
  sdkContext: SdkSdkContext;
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
}

export interface SdkServerTrackEvent {
  eventKey: string;
  value?: number | null;
  properties?: object | null;
  timestamp: string;
  context: SdkUserContext;
}

export interface SdkServerTrackEventRequest {
  events: SdkServerTrackEvent[];
  sdkContext: SdkSdkContext;
}

export interface SdkClientTrackImpression {
  flagKey: string;
  flagValue: object;
  timestamp: string;
}

export interface SdkServerTrackImpression {
  flagKey: string;
  flagValue: object;
  timestamp: string;
  context: SdkUserContext;
}

export interface SdkServerTrackImpressionsRequest {
  impressions: SdkServerTrackImpression[];
  sdkContext: SdkSdkContext;
}
