/**
 * @class EnvironmentManager
 * @description Detects and manages the current application environment.
 */
class EnvironmentManager {
  constructor() {
    /** @private */
    this.validEnvironments = ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION', 'PILOT'];
    /** @private */
    this.currentEnvironment = this._detectEnvironment();
    WK.logger().info(`EnvironmentManager: Current environment detected as '${this.currentEnvironment}'.`);
  }

  /**
   * Detects the current environment by reading a script property.
   * Defaults to 'DEVELOPMENT' if not set or invalid.
   * @private
   * @returns {string} The current environment name.
   */
  _detectEnvironment() {
    try {
      const env = PropertiesService.getScriptProperties().getProperty('WK_ENVIRONMENT');
      if (env && this.validEnvironments.includes(env.toUpperCase())) {
        return env.toUpperCase();
      }
      WK.logger().warn("WK_ENVIRONMENT script property not set or invalid. Defaulting to DEVELOPMENT.");
      return 'DEVELOPMENT';
    } catch (e) {
      WK.logger().error(`Could not read script properties: ${e.message}. Defaulting to DEVELOPMENT.`);
      return 'DEVELOPMENT';
    }
  }

  /**
   * Gets the current environment name.
   * @returns {string}
   */
  getCurrentEnvironment() {
    return this.currentEnvironment;
  }

  /**
   * Checks if the current environment is Production.
   * @returns {boolean}
   */
  isProduction() {
    return this.currentEnvironment === 'PRODUCTION';
  }
}