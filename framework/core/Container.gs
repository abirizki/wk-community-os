/**
 * Lightweight dependency container for WK Framework.
 */
class Container {
  constructor() {
    this.bindings = {};
    this.instances = {};
  }

  bind(key, resolver) {
    this.bindings[key] = resolver;
    this.instances[key] = null;
    return this;
  }

  singleton(key, resolver) {
    this.bindings[key] = resolver;
    this.instances[key] = null;
    return this;
  }

  make(key, ...args) {
    if (this.hasInstance(key)) {
      return this.instances[key];
    }

    if (this.bindings[key]) {
      const resolved = this.bindings[key](...args);
      this.instances[key] = resolved;
      return resolved;
    }

    throw new Error('Container binding not found: ' + key);
  }

  instance(key, value) {
    this.instances[key] = value;
    this.bindings[key] = function() {
      return value;
    };
    return this;
  }

  forget(key) {
    delete this.bindings[key];
    delete this.instances[key];
    return this;
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.bindings, key) || Object.prototype.hasOwnProperty.call(this.instances, key);
  }

  hasInstance(key) {
    return Object.prototype.hasOwnProperty.call(this.instances, key) && this.instances[key] !== null;
  }
}
