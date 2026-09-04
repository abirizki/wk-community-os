/**
 * Evaluates simple platform rules.
 * @class
 */
class RuleEngineService {
  /**
   * Creates a rule engine service.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(loggerService) {
    this.logger = loggerService || new LoggerService();
    this.rules = [];
  }

  /**
   * Registers a rule.
   * @param {Object} rule - Rule definition.
   */
  register(rule) {
    this.rules.push(rule);
    this.logger.info('Rule registered', { rule });
  }

  /**
   * Evaluates all registered rules.
   * @param {Object} context - Context object.
   * @returns {Array} Evaluation results.
   */
  evaluate(context) {
    return this.rules.map((rule) => ({
      rule: rule.name,
      passed: Boolean(rule.condition(context))
    }));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RuleEngineService
  };
}
