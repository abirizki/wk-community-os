/**
 * Rule dispatcher placeholder for framework rules.
 */
class RuleDispatcher {
  constructor(framework) {
    this.framework = framework;
  }

  dispatch(ruleName, payload) {
    return { rule: ruleName, payload: payload || {} };
  }
}
