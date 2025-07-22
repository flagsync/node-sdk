import { UNREADY_FLAG_VALUE } from '~config/constants';
import { FsUserContext } from '~config/types';

import { EvalEngineService } from '~managers/flag/flag-eval-engine/eval-engine.service';
import { IFlagManager, TypedFeatures } from '~managers/flag/types';
import { IStoreManager } from '~managers/storage/types';
import { ITrackManager } from '~managers/track/types';

export function flagManager(
  evalEngine: EvalEngineService,
  storageManager: IStoreManager,
  trackManager: ITrackManager,
): IFlagManager {
  // Overload for typed flag keys (when using CLI-generated types)
  function flag<Key extends keyof TypedFeatures>(
    context: FsUserContext,
    flagKey: Key,
    defaultValue?: TypedFeatures[Key],
  ): TypedFeatures[Key];

  // Overload for generic return types (when not using CLI-generated types)
  function flag<T>(
    context: FsUserContext,
    flagKey: string,
    defaultValue?: T,
  ): T;

  // Implementation
  function flag<T = any>(
    context: FsUserContext,
    flagKey: string,
    defaultValue?: T,
  ): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return UNREADY_FLAG_VALUE as T;
    }

    const flags = storageManager.get();
    const flag = flags[flagKey];

    if (!flag) {
      return (defaultValue ?? UNREADY_FLAG_VALUE) as T;
    }

    const value = evalEngine.getValueToServe(flag, context);
    const flagValue = value ?? defaultValue ?? UNREADY_FLAG_VALUE;

    trackManager.impressionsManager.track({
      flagKey,
      flagValue: flagValue as object,
      context,
    });

    return flagValue as T;
  }

  return {
    flag,
  };
}
