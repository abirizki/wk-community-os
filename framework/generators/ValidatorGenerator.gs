/**
 * Generates a validator skeleton.
 */
class ValidatorGenerator extends BaseGenerator {
  constructor() {
    super('validator', 'validator');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Validator skeleton for ' + input.name + ' */\nclass ' + input.name + 'Validator {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
