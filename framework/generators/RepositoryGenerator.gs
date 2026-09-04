/**
 * Generates a CRUD repository skeleton.
 */
class RepositoryGenerator extends BaseGenerator {
  constructor() {
    super('repository', 'repository');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '/** Repository CRUD skeleton for ' + input.name + ' */\nclass ' + input.name + 'Repository {\n  constructor() {}\n}\n'
    };
    this.outputs.push(output);
    return output;
  }
}
