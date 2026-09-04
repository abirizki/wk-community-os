/**
 * Stores platform configuration values using a simple key-value registry.
 * @class
 */
class ConfigurationManager {
  /**
   * Creates a new configuration manager.
   * @param {Object} initialConfig - Initial configuration values.
   * @param {LoggerService} loggerService - Optional logger.
   */
  constructor(initialConfig, loggerService) {
    this.logger = loggerService || new LoggerService();
    this.values = {};
    this.apply(initialConfig || {});
  }

  /**
   * Applies a configuration map.
   * @param {Object} config - Configuration values.
   */
  apply(config) {
    Object.keys(config || {}).forEach((key) => {
      this.values[key] = config[key];
    });
  }

  /**
   * Sets a configuration value.
   * @param {string} key - Configuration key.
   * @param {*} value - Configuration value.
   */
  set(key, value) {
    this.values[key] = value;
    this.logger.info(`Configuration updated: ${key}`, { key, value });
  }

  /**
   * Gets a configuration value.
   * @param {string} key - Configuration key.
   * @param {*} defaultValue - Default value.
   * @returns {*} The resolved value.
   */
  get(key, defaultValue) {
    return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : defaultValue;
  }

  /**
   * Returns the full configuration object.
   * @returns {Object} Configuration values.
   */
  getAll() {
    return Object.assign({}, this.values);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ConfigurationManager
  };
}
