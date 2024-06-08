import { FsSettings } from '~config/types.internal';

import { EvalEngineService } from '~managers/flag/flag-eval-engine/eval-engine.service';
import { RolloutEngineService } from '~managers/flag/flag-eval-engine/rollout-engine.service';
import { RuleEngineService } from '~managers/flag/flag-eval-engine/rule-engine.service';
import { flagManager } from '~managers/flag/flag-manager';
import { IStoreManager } from '~managers/storage/types';
import { ITrackManager } from '~managers/track/types';

export function flagManagerFactory(
  settings: FsSettings,
  storageManager: IStoreManager,
  trackManager: ITrackManager,
) {
  const rolloutEngine = new RolloutEngineService(settings);
  const ruleEngine = new RuleEngineService(settings);
  const evalEngine = new EvalEngineService(settings, ruleEngine, rolloutEngine);

  return flagManager(evalEngine, storageManager, trackManager);
}
