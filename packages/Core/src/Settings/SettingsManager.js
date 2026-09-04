/**
 * Provides application-level settings and defaults.
 * @class
 */
class SettingsManager {
  /**
   * Creates a settings manager.
   * @param {ConfigurationManager} configuration - Configuration source.
   * @param {LoggerService} loggerService - Optional logger.
   */
  constructor(configuration, loggerService) {
    this.configuration = configuration;
    this.logger = loggerService || new LoggerService();
    this.values = {};
  }

  /**
   * Sets a setting.
   * @param {string} key - Setting key.
   * @param {*} value - Setting value.
   */
  set(key, value) {
    this.values[key] = value;
    this.logger.info(`Setting changed: ${key}`, { key, value });
  }

  /**
   * Gets a setting.
   * @param {string} key - Setting key.
   * @param {*} defaultValue - Default value.
   * @returns {*} The resolved value.
   */
  get(key, defaultValue) {
    return Object.prototype.hasOwnProperty.call(this.values, key) ? this.values[key] : defaultValue;
  }

  /**
   * Returns all settings.
   * @returns {Object} Settings values.
   */
  getAll() {
    return Object.assign({}, this.values);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SettingsManager
  };
}
