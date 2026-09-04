/**
 * Generates a controller skeleton.
 */
class ControllerGenerator extends BaseGenerator {
  constructor() {
    super('controller', 'controller');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Controller skeleton for ' + input.name + ' */\nclass ' + input.name + 'Controller {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
