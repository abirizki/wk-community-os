/**
 * Generates a service skeleton.
 */
class ServiceGenerator extends BaseGenerator {
  constructor() {
    super('service', 'service');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Service skeleton for ' + input.name + ' */\nclass ' + input.name + 'Service {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
