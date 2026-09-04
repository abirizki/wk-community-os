/**
 * @class HealthMonitor
 * @description Monitors the health of all system packages by integrating with the Deployment package's HealthCheckService.
 */
class HealthMonitor {
  /**
   * @param {HealthCheckService} healthCheckService - From the Deployment package.
   */
  constructor(healthCheckService) {
    /** @private */
    this.healthCheckService = healthCheckService;
  }

  /**
   * Gets the current health status of all registered system modules.
   * @returns {object} An object containing the overall status and a breakdown by module.
   * @example
   * // returns { overallStatus: 'OPERATIONAL', checks: [{ module: 'Citizen', status: 'OPERATIONAL', message: 'OK' }, ...] }
   */
  getSystemHealth() {
    WK.security().checkPermission('operations.health.view');
    WK.logger().info('Running system health check for Operations Center.');

    if (!this.healthCheckService || typeof this.healthCheckService.runAll !== 'function') {
      WK.logger().error('HealthCheckService from Deployment package is not available.');
      return { overallStatus: 'UNKNOWN', checks: [], message: 'HealthCheckService not found.' };
    }

    const healthReport = this.healthCheckService.runAll();
    return healthReport;
  }
}