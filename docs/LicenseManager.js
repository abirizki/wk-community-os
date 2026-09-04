/**
 * @class LicenseManager
 * @description Manages tenant license compliance (e.g., user limits, expiration).
 */
class LicenseManager {
  /**
   * @param {SubscriptionManager} subscriptionManager
   */
  constructor(subscriptionManager) {
    /** @private */
    this.subscriptionManager = subscriptionManager;
    /** @private */
    this.planLimits = this._loadPlanLimits();
  }

  /**
   * Loads the license limits for each subscription plan.
   * @private
   * @returns {object}
   */
  _loadPlanLimits() {
    return {
      'FREE': { maxUsers: 100, maxStorageMB: 500 },
      'STANDARD': { maxUsers: 1000, maxStorageMB: 5000 },
      'PREMIUM': { maxUsers: 10000, maxStorageMB: 50000 },
      'ENTERPRISE': { maxUsers: -1, maxStorageMB: -1 } // -1 for unlimited
    };
  }

  /**
   * Checks if a tenant is allowed to add another user based on their plan's user limit.
   * @param {string} tenantId - The ID of the tenant.
   * @returns {boolean} True if the tenant is within their user limit.
   */
  canAddUser(tenantId) {
    const subscription = this.subscriptionManager.getSubscriptionForTenant(tenantId);
    if (!subscription) return false;

    const limits = this.planLimits[subscription.planId];
    if (!limits || limits.maxUsers === -1) {
      return true; // Plan not found or unlimited users.
    }

    // This requires a way to count users per tenant.
    const systemService = WK.service('system');
    const currentUserCount = systemService.countUsers({ tenantId: tenantId });

    return currentUserCount < limits.maxUsers;
  }

  /**
   * Checks if the tenant's license is valid (i.e., subscription is active).
   * @param {string} tenantId - The ID of the tenant.
   * @returns {boolean}
   */
  isLicenseValid(tenantId) {
    return this.subscriptionManager.isSubscriptionActive(tenantId);
  }
}