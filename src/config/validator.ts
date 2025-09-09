import { FsSettings } from '~config/types.internal';

import { FsServiceError, ServiceErrorCode } from '~api/error/service-error';

interface ValidationRule {
  validate: (settings: FsSettings) => boolean;
  message: string;
}

export class ConfigValidator {
  private static rules: ValidationRule[] = [
    {
      validate: (settings) => !!settings.sdkKey,
      message: 'sdkKey is required',
    },
    {
      validate: (settings) => settings.tracking.impressions.pushRateInSec >= 30,
      message: 'tracking.impressions.pushRateInSec must be >= 30',
    },
    {
      validate: (settings) => settings.tracking.impressions.maxQueueSize >= 50,
      message: 'tracking.impressions.maxQueueSize must be >= 50',
    },
    {
      validate: (settings) => settings.tracking.events.pushRateInSec >= 30,
      message: 'tracking.events.pushRateInSec must be >= 30',
    },
    {
      validate: (settings) => settings.tracking.events.maxQueueSize >= 50,
      message: 'tracking.events.maxQueueSize must be >= 50',
    },
    {
      validate: (settings) => settings.sync.pollRateInSec >= 30,
      message: 'sync.pollRateInSec must be >= 30',
    },
    {
      validate: (settings) =>
        !!(settings.metadata.sdkName && settings.metadata.sdkVersion),
      message:
        'Unable to determine SDK name or version. Please contact support.',
    },
  ];

  public static validate(settings: FsSettings): void {
    for (const rule of this.rules) {
      if (!rule.validate(settings)) {
        throw new FsServiceError({
          errorCode: ServiceErrorCode.InvalidConfiguration,
          message: rule.message,
        });
      }
    }
  }

  public static addRule(rule: ValidationRule): void {
    this.rules.push(rule);
  }
}
