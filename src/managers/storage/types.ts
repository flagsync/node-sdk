import { FsFlagSet } from '~config/types';

export interface IStoreManager {
  set: (flagSet: FsFlagSet) => void;
  replace: (flagSet: FsFlagSet) => void;
  get: () => FsFlagSet;
}
