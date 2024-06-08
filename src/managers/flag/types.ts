import { SdkUserContext } from '~api/data-contracts';

export interface IFlagManager {
  flag: <T>(context: SdkUserContext, flagKey: string, defaultValue?: T) => T;
}
