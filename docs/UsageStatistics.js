/**
 * @class UsageStatistics
 * @description Gathers and reports usage metrics for each tenant.
 */
class UsageStatistics {
  constructor() {
    // This service would need access to multiple repositories.
    // These would be injected by the service locator.
  }

  /**
   * Generates a usage report for a specific tenant for a given month.
   * @param {string} tenantId - The ID of the tenant.
   * @param {number} year - The year of the report.
   * @param {number} month - The month of the report (1-12).
   * @returns {object} A usage report object.
   */
  getMonthlyUsage(tenantId, year, month) {
    WK.security().checkPermission('saas.usage.view');
    WK.logger().info(`Generating monthly usage report for tenant ${tenantId} for ${year}-${month}`);

    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0).toISOString();

    // These calls assume that all repositories are now scoped to the tenantId
    // which is set in the session. The framework needs to be updated to pass this.
    const letterRepo = WK.repository('letter');
    const complaintRepo = WK.repository('complaint');

    const lettersCreated = letterRepo.count({ tenantId: tenantId, createdAt: { $gte: startDate, $lt: endDate } });
    const complaintsFiled = complaintRepo.count({ tenantId: tenantId, createdAt: { $gte: startDate, $lt: endDate } });

    return {
      tenantId: tenantId,
      period: `${year}-${month}`,
      lettersCreated: lettersCreated,
      complaintsFiled: complaintsFiled,
      // ... other metrics like storage used, active users, etc.
    };
  }
}