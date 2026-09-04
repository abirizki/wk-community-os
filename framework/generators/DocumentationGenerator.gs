/**
 * Generates documentation skeleton.
 */
class DocumentationGenerator extends BaseGenerator {
  constructor() {
    super('documentation', 'documentation');
  }

  generate(input) {
    this.validate(input);
    const output = {
      name: input.name,
      content: '# ' + input.name + '\n\nDocumentation placeholder.\n'
    };
    this.outputs.push(output);
    return output;
  }
}
