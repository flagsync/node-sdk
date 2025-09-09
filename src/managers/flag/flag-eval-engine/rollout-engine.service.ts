import * as crypto from 'crypto';

import { FsSettings } from '~config/types.internal';

import { FeatureFlagEnvironmentDetailDto, SdkUserContext } from '~api/types';

import { ILogger } from '~logger/types';

export class RolloutEngineService {
  private readonly log: ILogger;

  constructor(settings: FsSettings) {
    this.log = settings.log;
  }

  /**
   * Determines the "variantId" for a user based on a percentage rollout strategy.
   * Combine the context key and a seed value, hash it, then uses this hash to assign the
   * user variant bucket.
   *
   * Hashing ensures deterministic assignment of users across the variants.
   *
   * Note: If a user choose to reallocate the percentage rollout in the UI dashboard,
   * a new seed is generated, and users may be reassigned to a new variant.
   * @param context
   * @param detail
   * @private
   */
  getBucketVariantId(
    context: SdkUserContext,
    detail: FeatureFlagEnvironmentDetailDto,
  ) {
    const { key } = context;
    const { percentageRollout, seed, disabledSingleVariantId } = detail.state;

    const data = key + seed;
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    const intHash = parseInt(hash.substring(0, 12), 16);

    // Scale to 0-99
    const scaledHash = intHash % 100;

    /**
     * Iterates through the "percentageRollout", adding up the percentages.
     * When the scaled hash value is less than the cumulative percentage,
     * the corresponding variant is selected.
     *
     * This distributes users evenly among variants. Basically, it drops the user
     * in a bucket that corresponds to the variant's weight.
     *
     * For example, if a variant has a 20% weight in "percentageRollout", about 20%
     * of all users should be assigned to this variant.
     *
     * Example:
     *       [
     *         { variantId: 1, percentage: 60 }, // Hash 0-59
     *         { variantId: 2, percentage: 5 },  // Hash 60-64
     *         { variantId: 3, percentage: 10 }, // Hash 65-74
     *         { variantId: 4, percentage: 2 },  // Hash 75-76
     *         { variantId: 5, percentage: 23 }, // Hash 77-99
     *       ];
     */
    let cumulativePercentage = 0;
    for (const entry of percentageRollout) {
      cumulativePercentage += entry.percentage;
      if (scaledHash < cumulativePercentage) {
        this.log.debug(
          `Context key "${key}" is in bucket ${entry.variantId} for flag "${detail.featureFlag.key}"`,
        );
        return entry.variantId;
      }
    }

    this.log.error(
      `Context key "${key}" could not be placed in a bucket for flag "${detail.featureFlag.key}"`,
    );

    return disabledSingleVariantId;
  }
}
