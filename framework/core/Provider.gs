/**
 * Base service provider contract for WK Framework.
 */
class Provider {
  constructor(container, framework) {
    this.container = container;
    this.framework = framework;
  }

  register() {
    return true;
  }

  boot() {
    return true;
  }

  shutdown() {
    return true;
  }
}
