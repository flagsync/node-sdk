import { SdkUserContext } from '~api/data-contracts';

export interface FeatureFlags {}

export type TypedFeatureFlags = keyof FeatureFlags extends never
  ? Record<string, unknown>
  : { [K in keyof FeatureFlags]: FeatureFlags[K] };

export type FlagKey = keyof TypedFeatureFlags;

export interface IFlagManager {
  flag<Key extends FlagKey>(
    context: SdkUserContext,
    flagKey: Key,
    defaultValue?: TypedFeatureFlags[Key],
  ): TypedFeatureFlags[Key];
}
