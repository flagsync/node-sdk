import { FsSettings } from '~config/types.internal';

import {
  FeatureFlagEnvironmentDetailDto,
  SdkUserContext,
} from '~api/data-contracts';

import { RolloutEngineService } from '~managers/flag/flag-eval-engine/rollout-engine.service';
import { RuleEngineService } from '~managers/flag/flag-eval-engine/rule-engine.service';
import { DataTypeCode } from '~managers/flag/flag-eval-engine/types';

import { MESSAGE } from '~logger/messages';
import { ILogger } from '~logger/types';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'eval-engine-service');

export class EvalEngineService {
  private log: ILogger;

  constructor(
    settings: FsSettings,
    private readonly ruleEngine: RuleEngineService,
    private readonly rolloutEngine: RolloutEngineService,
  ) {
    this.log = settings.log;
  }

  getValueToServe(
    detail: FeatureFlagEnvironmentDetailDto,
    context: SdkUserContext,
  ) {
    const variantId = detail.state.isEnabled
      ? this.deriveEnabledVariantId(detail, context)
      : detail.state.disabledSingleVariantId;

    const variant = detail.featureFlag.variants.find(
      (v) => v.variantId === variantId,
    );

    /**
     * This should never happen since Skyline has robust validation, but put in a
     * defensive check nonetheless.
     */
    if (!variant) {
      this.log.warn(
        `Unable to find variantId "${variantId}" in flag "${detail.featureFlag.key}"`,
      );
      return;
    }

    switch (variant.dataTypeCode) {
      case DataTypeCode.Number:
        return variant.numberValue;
      case DataTypeCode.Boolean:
        return variant.booleanValue;
      case DataTypeCode.String:
        return variant.stringValue;
      case DataTypeCode.JSON:
        return variant.jsonValue;
      default: {
        this.log.warn(
          `${formatter(MESSAGE.UNSUPPORTED_VARIANT_DATA_TYPE)} ("${variant.dataTypeCode}")`,
        );
      }
    }
  }

  /**
   * Determines the enabled "variantId" for a user based on the feature flag config.
   * First, delegate to the percentage rollout strategy if configured.
   *
   * Otherwise, return the "enabledSingleVariantId", which represents a variant that is
   * globally enabled for all users.
   * @param detail
   * @param context
   * @private
   */
  private deriveEnabledVariantId(
    detail: FeatureFlagEnvironmentDetailDto,
    context: SdkUserContext,
  ) {
    const { enabledSingleVariantId, percentageRollout, targetingRules } =
      detail.state;

    if (targetingRules.length > 0) {
      const result = this.deriveVariantIdFromTargetingRules(context, detail);
      if (result.isTarget) {
        return result.variantId;
      }
    }

    if (percentageRollout.length > 0) {
      return this.rolloutEngine.getBucketVariantId(context, detail);
    }

    return enabledSingleVariantId;
  }

  /**
   * Determines the "variantId" for a user based on a targeting rules strategy.
   * @param context
   * @param detail
   * @private
   */
  private deriveVariantIdFromTargetingRules(
    context: SdkUserContext,
    detail: FeatureFlagEnvironmentDetailDto,
  ) {
    const {
      state: { targetingRules, enabledSingleVariantId },
    } = detail;

    for (const rule of targetingRules) {
      if (this.ruleEngine.isContextTargetedByRule(rule, context)) {
        return {
          isTarget: true,
          variantId: rule.variantId,
        };
      }
    }

    return {
      isTarget: false,
      variantId: enabledSingleVariantId,
    };
  }
}
