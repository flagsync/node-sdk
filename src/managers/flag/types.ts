import { SdkUserContext } from '~api/data-contracts';

// export declare interface FeatureFlags {}

export type FlagValue = string | number | boolean | object;
export interface FeatureFlags {}

export type TypedFeatures = keyof FeatureFlags extends never
  ? Record<string, never>
  : { [K in keyof FeatureFlags]: FeatureFlags[K] };

export type FlagKey = keyof TypedFeatures;

export interface IFlagManager {
  // Overload for typed flag keys (when using CLI-generated types)
  flag<Key extends keyof TypedFeatures>(
    context: SdkUserContext,
    flagKey: Key,
    defaultValue?: TypedFeatures[Key],
  ): TypedFeatures[Key];

  // Overload for generic return types (when not using CLI-generated types)
  flag<T>(context: SdkUserContext, flagKey: string, defaultValue?: T): T;
}
