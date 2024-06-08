import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FeatureFlagEnvironmentDetailDto } from '~api/data-contracts';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

import { IStoreManager } from './types';

const formatter = formatMsg.bind(null, 'memory-manager');

export function memoryManager(params: FsSettings): IStoreManager {
  const { log } = params;

  let flagSet: Record<string, FeatureFlagEnvironmentDetailDto> = {};

  function set(incoming: Record<string, FeatureFlagEnvironmentDetailDto>) {
    log.debug(formatter(MESSAGE.STORAGE_SET_FLAG_RULES));
    flagSet = {
      ...flagSet,
      ...incoming,
    };
  }

  function get(): FsFlagSet {
    log.debug(formatter(MESSAGE.STORAGE_GET_FLAG_RULES));
    return {
      ...flagSet,
    };
  }

  return {
    set,
    get,
  };
}
