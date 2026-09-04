/**
 * Core engine that coordinates generator registration, template loading, and output emission.
 */
class GeneratorEngine {
  constructor() {
    this.registry = new GeneratorRegistry();
    this.templateManager = new TemplateManager();
    this.generators = [];
  }

  registerGenerator(generator) {
    this.registry.register(generator.name, generator);
    this.generators.push(generator);
    return this;
  }

  generate(name, input) {
    const generator = this.registry.get(name);
    if (!generator) {
      throw new Error('Generator not found: ' + name);
    }

    return generator.generate(input);
  }

  list() {
    return this.registry.list();
  }
}
