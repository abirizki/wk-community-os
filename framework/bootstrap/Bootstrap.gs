/**
 * Bootstrapper for WK Framework initialization.
 */
class Bootstrap {
  constructor() {
    this.framework = new Framework();
  }

  run() {
    return this.framework.boot();
  }
}
