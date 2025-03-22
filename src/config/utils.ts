import deepmerge from 'deepmerge';

import { DEFAULT_CONFIG } from '~config/constants';
import { FsConfig } from '~config/types';
import { FsSettings } from '~config/types.internal';
import { ConfigValidator } from '~config/validator';

import { loggerFactory } from '~logger/logger-factory';

export function buildSettingsFromConfig(config: FsConfig): FsSettings {
  const settings = deepmerge<FsSettings, FsConfig>(DEFAULT_CONFIG, config);
  settings.log = loggerFactory(settings, config.logger);

  const metadata = config.metadata ?? {};

  (settings as FsSettings).metadata = {
    sdkName: '__SDK_NAME__',
    sdkVersion: '__SDK_VERSION__',
    ...metadata,
  };

  settings.sdkContext = {
    sdkName: settings.metadata.sdkName,
    sdkVersion: settings.metadata.sdkVersion,
  };

  settings.platform = 'node';

  ConfigValidator.validate(settings);

  return settings;
}
