import { SdkUserContext } from '~api/data-contracts';

export interface FeatureFlags {}

export interface IFlagManager {
  // Overload for typed flag keys (when using CLI-generated types)
  flag<Key extends keyof FeatureFlags>(
    context: SdkUserContext,
    flagKey: Key,
    defaultValue?: FeatureFlags[Key],
  ): FeatureFlags[Key];

  // Overload for generic return types (when not using CLI-generated types)
  flag<T>(context: SdkUserContext, flagKey: string, defaultValue?: T): T;
}
