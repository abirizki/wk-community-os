/**
 * Generates a dashboard skeleton.
 */
class DashboardGenerator extends BaseGenerator {
  constructor() {
    super('dashboard', 'dashboard');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Dashboard skeleton for ' + input.name + ' */\nclass ' + input.name + 'Dashboard {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
