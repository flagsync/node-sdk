import { SdkUserContext } from '~api/data-contracts';

export interface FeatureFlags {}
export type FlagKey = keyof FeatureFlags;

export interface IFlagManager {
  flag: <T>(context: SdkUserContext, flagKey: FlagKey, defaultValue?: T) => T;
}
