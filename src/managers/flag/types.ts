import { SdkUserContext } from '~api/data-contracts';

export interface FeatureFlags {}

/**
 * Add a fallback in the event the user has not run the CLI type generator
 */
export type FlagKey = [keyof FeatureFlags] extends [never]
  ? string
  : keyof FeatureFlags;

export interface IFlagManager {
  flag: <T>(context: SdkUserContext, flagKey: FlagKey, defaultValue?: T) => T;
}
