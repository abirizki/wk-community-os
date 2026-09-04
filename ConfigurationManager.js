/**
 * @class ConfigurationManager
 * @description Loads and manages layered configurations for different environments.
 */
class ConfigurationManager {
  /**
   * @param {EnvironmentManager} envManager
   */
  constructor(envManager) {
    /** @private */
    this.envManager = envManager;
    /** @private */
    this.config = this._loadConfiguration();
  }

  /**
   * Loads configuration by merging a default config with an environment-specific one.
   * @private
   * @returns {object} The fully merged configuration object.
   */
  _loadConfiguration() {
    const environment = this.envManager.getCurrentEnvironment().toLowerCase();
    WK.logger().info(`ConfigurationManager: Loading configuration for '${environment}' environment.`);

    let defaultConfig = {};
    let envConfig = {};

    try {
      // In Apps Script, configs might be stored as files in the project or as script properties.
      // Here we simulate loading from files named `config.default.json` and `config.{env}.json`.
      // This would require a helper to read project files.
      const defaultConfigContent = WK.helper().getProjectFileContent('config.default.json');
      if (defaultConfigContent) {
        defaultConfig = JSON.parse(defaultConfigContent);
      }
    } catch (e) {
      WK.logger().warn(`Could not load default configuration: ${e.message}`);
    }

    try {
      const envConfigContent = WK.helper().getProjectFileContent(`config.${environment}.json`);
      if (envConfigContent) {
        envConfig = JSON.parse(envConfigContent);
      }
    } catch (e) {
      WK.logger().warn(`Could not load environment-specific configuration for '${environment}': ${e.message}`);
    }

    // Deep merge environment config over default config
    const finalConfig = { ...defaultConfig, ...envConfig };
    WK.logger().info('Configuration loaded successfully.');
    return finalConfig;
  }

  /**
   * Gets a configuration value by key.
   * @param {string} key - The configuration key (e.g., 'database.name').
   * @returns {any} The configuration value or null if not found.
   */
  get(key) {
    return key.split('.').reduce((o, i) => (o ? o[i] : null), this.config);
  }
}