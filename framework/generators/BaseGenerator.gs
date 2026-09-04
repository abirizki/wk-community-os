/**
 * Base class for all generators.
 */
class BaseGenerator {
  constructor(name, templateName) {
    this.name = name;
    this.templateName = templateName;
    this.outputs = [];
  }

  generate(input) {
    this.validate(input);
    const rendered = this.render(input);
    return this.save(rendered, input);
  }

  validate(input) {
    if (!input || !input.name) {
      throw new Error('Generator input must contain a name');
    }
    return true;
  }

  render(input) {
    return {
      name: input.name,
      template: this.templateName,
      timestamp: Helpers.timestamp()
    };
  }

  save(rendered, input) {
    const output = {
      generator: this.name,
      target: input.target || 'packages',
      content: rendered
    };
    this.outputs.push(output);
    return output;
  }

  rollback() {
    this.outputs = [];
    return true;
  }
}
