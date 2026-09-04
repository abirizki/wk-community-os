/**
 * Loads and stores global configuration for the framework.
 */
class ConfigManager {
  constructor() {
    this.config = {};
  }

  load() {
    const defaults = {
      appVersion: '0.0.0',
      frameworkVersion: '1.0.0',
      build: 'dev'
    };

    this.config = Object.assign({}, defaults, this.config);
    return this.config;
  }

  set(key, value) {
    this.config[key] = value;
    return this;
  }

  get(key, fallback) {
    return this.config[key] !== undefined ? this.config[key] : fallback;
  }
}
