/**
 * Manages the runtime environment context.
 */
class Environment {
  constructor() {
    this.name = 'development';
    this.isProduction = false;
  }

  load() {
    return {
      name: this.name,
      isProduction: this.isProduction
    };
  }
}
