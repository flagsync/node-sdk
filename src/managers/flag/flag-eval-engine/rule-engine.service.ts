import { FsUserContext } from '~config/types';
import { FsSettings } from '~config/types.internal';

import {
  SdkUserContext,
  TargetingRuleClauseDto,
  TargetingRuleClauseValueDto,
  VariantEnvironmentTargetingRuleDto,
} from '~api/types';

import {
  TargetingRuleClauseAttributeCode,
  TargetingRuleClauseOperatorCode,
} from '~managers/flag/flag-eval-engine/types';

import { ILogger } from '~logger/types';

export class RuleEngineService {
  private readonly settings: FsSettings;
  private readonly log: ILogger;

  constructor(settings: FsSettings) {
    this.settings = settings;
    this.log = settings.log;
  }

  public isContextTargetedByRule(
    rule: VariantEnvironmentTargetingRuleDto,
    context: SdkUserContext,
  ): boolean {
    return rule.clauses.every((clause) => {
      const matched = this.isClauseSatisfied(clause, context);
      if (matched) {
        this.logDebugMatch(clause, context);
      }
      return matched;
    });
  }

  private logDebugMatch(
    clause: TargetingRuleClauseDto,
    context: SdkUserContext,
  ) {
    this.log.debug('************* Matched Clause *************');
    this.log.debug(` Attribute: ${clause.attribute}`);
    this.log.debug(`  Operator: ${clause.operator}`);
    this.log.debug(`    Custom: ${clause.operator}`);
    if (clause.customAttribute) {
      this.log.debug(`    Custom: ${clause.customAttribute.name}`);
    }
    this.log.debug(
      `    Values: ${clause.values.map((v) => v.value).join(', ')}`,
    );
    this.log.debug('**************** Context *****************');
    this.log.debug(`   Ctx Key: ${context.key}`);
    this.log.debug(`Ctx Custom: ${JSON.stringify(context.attributes ?? {})}`);
  }

  private isClauseSatisfied(
    clause: TargetingRuleClauseDto,
    context: SdkUserContext,
  ): boolean {
    let ctxValue: string | undefined | null;

    try {
      ctxValue = this.getContextValueByAttribute(context, clause);
    } catch (error) {
      this.log.error(error);
      return false;
    }

    if (ctxValue === undefined || ctxValue === null) {
      return false;
    }

    const { operator, values } = clause;

    // Logic for each operator type
    switch (operator) {
      case TargetingRuleClauseOperatorCode.IS_ONE_OF:
        return values.some((value) => this.isEqual(value, ctxValue));
      case TargetingRuleClauseOperatorCode.IS_NOT_ONE_OF:
        return !values.some((value) => this.isEqual(value, ctxValue));
      case TargetingRuleClauseOperatorCode.STARTS_WITH:
        return values.some((value) => this.startsWith(value, ctxValue));
      case TargetingRuleClauseOperatorCode.DOES_NOT_START_WITH:
        return !values.some((value) => this.startsWith(value, ctxValue));
      case TargetingRuleClauseOperatorCode.ENDS_WITH:
        return values.some((value) => this.endsWith(value, ctxValue));
      case TargetingRuleClauseOperatorCode.DOES_NOT_END_WITH:
        return !values.some((value) => this.endsWith(value, ctxValue));
      case TargetingRuleClauseOperatorCode.MATCHES_REGEX:
        return values.some((value) => this.matchesRegExp(value, ctxValue));
      case TargetingRuleClauseOperatorCode.DOES_NOT_MATCH_REGEX:
        return !values.some((value) => this.matchesRegExp(value, ctxValue));
      case TargetingRuleClauseOperatorCode.GREATER_THAN:
        return values.some((value) => this.isGreaterThan(value, ctxValue));
      case TargetingRuleClauseOperatorCode.GREATER_THAN_OR_EQUAL:
        return values.some((value) => this.isGreaterThanEqual(value, ctxValue));
      case TargetingRuleClauseOperatorCode.LESS_THAN:
        return values.some((value) => this.isLessThan(value, ctxValue));
      case TargetingRuleClauseOperatorCode.LESS_THAN_OR_EQUAL:
        return values.some((value) => this.isLessThanEqual(value, ctxValue));
      case TargetingRuleClauseOperatorCode.SEMVER_GREATER_THAN:
        return values.some((value) =>
          this.isSemVerGreaterThan(value, ctxValue),
        );
      case TargetingRuleClauseOperatorCode.SEMVER_GREATER_THAN_OR_EQUAL:
        return values.some((value) =>
          this.isSemVerGreaterThanEqual(value, ctxValue),
        );
      case TargetingRuleClauseOperatorCode.SEMVER_LESS_THAN:
        return values.some((value) => this.isSemVerLessThan(value, ctxValue));
      case TargetingRuleClauseOperatorCode.SEMVER_LESS_THAN_OR_EQUAL:
        return values.some((value) =>
          this.isSemVerLessThanEqual(value, ctxValue),
        );
      default: {
        this.log.warn(
          `Unsupported targeting rule clause operator "${clause.operator}"`,
        );
      }
    }

    return false;
  }

  /**
   * Given the targeting rule attribute, return the applicable value
   * from the context. It's possible that the context does not have this
   * value, in which case, the rule can be short-circuited.
   * @param context
   * @param clause
   * @private
   */
  private getContextValueByAttribute(
    context: FsUserContext,
    clause: TargetingRuleClauseDto,
  ): string | undefined | null {
    const { attribute, customAttribute } = clause;

    switch (attribute) {
      case TargetingRuleClauseAttributeCode.EMAIL:
        return context.attributes?.email;
      case TargetingRuleClauseAttributeCode.KEY:
        return context.key;
      case TargetingRuleClauseAttributeCode.CUSTOM:
        return (context.attributes ?? {})[customAttribute?.name];
      default: {
        this.log.warn(
          `Unsupported targeting rule clause attribute "${attribute}"`,
        );
      }
    }

    return undefined;
  }

  private isEqual(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    return ruleValue.value === contextValue;
  }

  private startsWith(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    return contextValue.startsWith(ruleValue.value);
  }

  private endsWith(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    return contextValue.endsWith(ruleValue.value);
  }

  private matchesRegExp(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    const regex = new RegExp(ruleValue.value);
    return regex.test(contextValue);
  }

  private isGreaterThan(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    const results = this.getNumberValues(ruleValue, contextValue);
    return !results ? false : results.contextNumber > results.ruleNumber;
  }

  private isLessThan(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    const results = this.getNumberValues(ruleValue, contextValue);
    return !results ? false : results.contextNumber < results.ruleNumber;
  }

  private isGreaterThanEqual(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    const results = this.getNumberValues(ruleValue, contextValue);
    return !results ? false : results.contextNumber >= results.ruleNumber;
  }

  private isLessThanEqual(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    const results = this.getNumberValues(ruleValue, contextValue);
    return !results ? false : results.contextNumber <= results.ruleNumber;
  }

  private isSemVerGreaterThan(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    try {
      const [major1 = 0, minor1 = 0, patch1 = 0] =
        this.parseSemVer(contextValue);
      const [major2 = 0, minor2 = 0, patch2 = 0] = this.parseSemVer(
        ruleValue.value,
      );
      if (major1 !== major2) {
        return major1 > major2;
      }
      if (minor1 !== minor2) {
        return minor1 > minor2;
      }

      return patch1 > patch2;
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }

  private isSemVerLessThan(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): boolean {
    try {
      const [major1 = 0, minor1 = 0, patch1 = 0] =
        this.parseSemVer(contextValue);
      const [major2 = 0, minor2 = 0, patch2 = 0] = this.parseSemVer(
        ruleValue.value,
      );

      if (major1 !== major2) {
        return major1 < major2;
      }
      if (minor1 !== minor2) {
        return minor1 < minor2;
      }

      return patch1 < patch2;
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }

  private isSemVerGreaterThanEqual(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ) {
    try {
      const [major1 = 0, minor1 = 0, patch1 = 0] =
        this.parseSemVer(contextValue);
      const [major2 = 0, minor2 = 0, patch2 = 0] = this.parseSemVer(
        ruleValue.value,
      );

      if (major1 !== major2) {
        return major1 >= major2;
      }
      if (minor1 !== minor2) {
        return minor1 >= minor2;
      }

      return patch1 >= patch2;
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }

  private isSemVerLessThanEqual(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ) {
    try {
      const [major1 = 0, minor1 = 0, patch1 = 0] =
        this.parseSemVer(contextValue);
      const [major2 = 0, minor2 = 0, patch2 = 0] = this.parseSemVer(
        ruleValue.value,
      );

      if (major1 !== major2) {
        return major1 <= major2;
      }
      if (minor1 !== minor2) {
        return minor1 <= minor2;
      }

      return patch1 <= patch2;
    } catch (error) {
      this.log.error(error);
      return false;
    }
  }

  private getNumberValues(
    ruleValue: TargetingRuleClauseValueDto,
    contextValue: string,
  ): { ruleNumber: number; contextNumber: number } | undefined {
    const ruleNumber = parseFloat(ruleValue.value);
    const contextNumber = parseFloat(contextValue);

    if (isNaN(ruleNumber) || isNaN(contextNumber)) {
      return undefined;
    }

    return { ruleNumber, contextNumber };
  }

  private parseSemVer(version: string) {
    const parts = version.split('.').map((num) => parseInt(num, 10));
    if (parts.some(isNaN)) {
      throw new Error(`[parseSemVer]: Invalid version format: ${version}`);
    }
    return parts;
  }
}
