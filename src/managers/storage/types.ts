import { FeatureFlagEnvironmentDetailDto } from '~api/data-contracts';

export interface IStoreManager {
  set: (flagSet: Record<string, FeatureFlagEnvironmentDetailDto>) => void;
  get: () => Record<string, FeatureFlagEnvironmentDetailDto>;
}
