import { SdkUserContext } from '~api/data-contracts';

export interface FeatureFlags {}

export type IsFeatureFlagsEmpty<T> = keyof T extends never ? true : false;
declare const NoExplicitReturn: unique symbol;
export type NoExplicitReturnType = typeof NoExplicitReturn;

export type FlagReturnType<TReturn, TKey extends string, TFeatureFlags> =
  IsFeatureFlagsEmpty<TFeatureFlags> extends true
    ? TReturn extends NoExplicitReturnType
      ? unknown
      : TReturn
    : TKey extends keyof TFeatureFlags
      ? TFeatureFlags[TKey]
      : never;

export interface IFlagManager {
  flag<T>(context: SdkUserContext, flagKey: string, defaultValue?: T): T;
}
