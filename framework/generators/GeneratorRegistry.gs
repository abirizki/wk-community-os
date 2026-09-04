/**
 * Registry for generator discovery and lookup.
 */
class GeneratorRegistry {
  constructor() {
    this.items = {};
  }

  register(name, generator) {
    this.items[name] = generator;
    return this;
  }

  unregister(name) {
    delete this.items[name];
    return this;
  }

  has(name) {
    return Object.prototype.hasOwnProperty.call(this.items, name);
  }

  get(name) {
    return this.items[name];
  }

  list() {
    return Object.keys(this.items);
  }
}
