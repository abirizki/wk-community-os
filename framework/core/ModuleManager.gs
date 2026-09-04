/**
 * Simple module registry for framework bootstrapping.
 */
class ModuleManager {
  constructor() {
    this.modules = {};
  }

  register(name, module) {
    this.modules[name] = module;
    return this;
  }

  load(name) {
    if (!this.modules[name]) {
      throw new Error('Module not found: ' + name);
    }
    return this.modules[name];
  }

  enable(name) {
    const module = this.load(name);
    module.enabled = true;
    return module;
  }

  disable(name) {
    const module = this.load(name);
    module.enabled = false;
    return module;
  }

  unload(name) {
    delete this.modules[name];
    return true;
  }

  list() {
    return Object.keys(this.modules);
  }
}
