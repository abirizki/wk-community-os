/**
 * @class HealthCheckService
 * @description Runs health checks on various subsystems.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class HealthCheckService {
  /**
   * @param {Kernel} kernel
   */
  constructor(kernel) {
    /** @private */
    this.kernel = kernel;
  }

  /**
   * Checks the status of all registered packages.
   * @returns {object} An object with package statuses.
   */
  checkAllPackages() {
    const packages = this.kernel.getPackageManager().getAllPackages();
    const status = {};
    for (const pkg of packages) {
      status[pkg.id] = pkg.status || 'OPERATIONAL'; // Assuming a status property
    }
    return status;
  }

  /**
   * Checks the status of all registered domains.
   * @returns {object} An object with domain statuses.
   */
  checkAllDomains() {
    const domains = this.kernel.getDomainRegistry().getAllDomains();
    const status = {};
    for (const domain of domains) {
      status[domain.id] = domain.status || 'OPERATIONAL';
    }
    return status;
  }
}