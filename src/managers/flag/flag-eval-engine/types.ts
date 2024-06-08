export enum DataTypeCode {
  Boolean = 'BOOL',
  String = 'STR',
  Number = 'NUM',
  JSON = 'JSON',
}

export enum TargetingRuleClauseOperatorCode {
  IS_ONE_OF = 'IOO',
  IS_NOT_ONE_OF = 'INOO',
  ENDS_WITH = 'EW',
  DOES_NOT_END_WITH = 'DNEW',
  STARTS_WITH = 'SW',
  DOES_NOT_START_WITH = 'DNSW',
  MATCHES_REGEX = 'MR',
  DOES_NOT_MATCH_REGEX = 'DNMR',
  LESS_THAN = 'LT',
  LESS_THAN_OR_EQUAL = 'LTE',
  GREATER_THAN = 'GT',
  GREATER_THAN_OR_EQUAL = 'GTE',
  SEMVER_LESS_THAN = 'SVLT',
  SEMVER_LESS_THAN_OR_EQUAL = 'SVLTE',
  SEMVER_GREATER_THAN = 'SVGT',
  SEMVER_GREATER_THAN_OR_EQUAL = 'SVGTE',
}

export enum TargetingRuleClauseAttributeCode {
  EMAIL = 'EMAIL',
  KEY = 'KEY',
  IP_ADDRESS = 'IP',
  COUNTRY = 'COUNTRY',
  CUSTOM = 'CUSTOM',
}
