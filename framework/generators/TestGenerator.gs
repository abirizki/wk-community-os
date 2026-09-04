/**
 * Generates a unit test skeleton.
 */
class TestGenerator extends BaseGenerator {
  constructor() {
    super('test', 'test');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Test skeleton for ' + input.name + ' */\nfunction test' + input.name + '() {\n  return true;\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
