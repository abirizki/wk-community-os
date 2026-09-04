/**
 * Generates a migration skeleton.
 */
class MigrationGenerator extends BaseGenerator {
  constructor() {
    super('migration', 'migration');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Migration skeleton for ' + input.name + ' */\nclass ' + input.name + 'Migration {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
