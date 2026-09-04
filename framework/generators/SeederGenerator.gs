/**
 * Generates a seeder skeleton.
 */
class SeederGenerator extends BaseGenerator {
  constructor() {
    super('seeder', 'seeder');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Seeder skeleton for ' + input.name + ' */\nclass ' + input.name + 'Seeder {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
