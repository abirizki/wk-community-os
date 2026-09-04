/**
 * Generates a rule skeleton.
 */
class RuleGenerator extends BaseGenerator {
  constructor() {
    super('rule', 'rule');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Rule skeleton for ' + input.name + ' */\nclass ' + input.name + 'Rule {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
