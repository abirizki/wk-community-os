/**
 * Provides basic health checks for Core Platform services.
 * @class
 */
class HealthCheckService {
  /**
   * Creates a health check service.
   * @param {ConfigurationManager} configuration - Configuration manager.
   * @param {LoggerService} loggerService - Logger service.
   */
  constructor(configuration, loggerService) {
    this.configuration = configuration || new ConfigurationManager();
    this.logger = loggerService || new LoggerService();
  }

  /**
   * Runs a health check for a target name.
   * @param {string} target - Target name.
   * @returns {Object} Health status.
   */
  run(target) {
    const status = {
      target,
      healthy: true,
      timestamp: new Date().toISOString(),
      configurationKeys: Object.keys(this.configuration.getAll()).length
    };
    this.logger.info(`Health check completed: ${target}`, status);
    return status;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HealthCheckService
  };
}
