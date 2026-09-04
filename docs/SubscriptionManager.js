/**
 * @class SubscriptionManager
 * @description Manages tenant subscriptions and plans.
 */
class SubscriptionManager {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('subscriptions');
    WK.logger().info('SubscriptionManager initialized for table: subscriptions');
  }

  /**
   * Assigns a subscription plan to a tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} planId - The ID of the plan (e.g., 'FREE', 'STANDARD', 'PREMIUM').
   * @param {string} startDate - ISO 8601 start date.
   * @param {string} endDate - ISO 8601 end date.
   * @returns {object} The created subscription record.
   */
  createSubscription(tenantId, planId, startDate, endDate) {
    WK.security().checkPermission('saas.subscription.create');
    const subscription = {
      id: WK.helper().generateUuid(),
      tenantId: tenantId,
      planId: planId,
      status: 'ACTIVE', // 'ACTIVE', 'PAST_DUE', 'CANCELED'
      startDate: startDate,
      endDate: endDate,
      createdAt: new Date().toISOString()
    };
    return this.db.create(subscription);
  }

  /**
   * Retrieves the current subscription for a tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @returns {object|null} The active subscription record or null.
   */
  getSubscriptionForTenant(tenantId) {
    if (!tenantId) return null;
    return this.db.findOne({ tenantId: tenantId, status: 'ACTIVE' });
  }

  /**
   * Checks if a tenant's subscription is currently active.
   * @param {string} tenantId - The ID of the tenant.
   * @returns {boolean} True if the subscription is active and not expired.
   */
  isSubscriptionActive(tenantId) {
    const sub = this.getSubscriptionForTenant(tenantId);
    if (!sub) {
      return false;
    }
    const now = new Date();
    const endDate = new Date(sub.endDate);
    return sub.status === 'ACTIVE' && now <= endDate;
  }

  // In a real system, this would be run by a scheduler
  checkAllSubscriptionsForExpiration() {
    // Logic to find expired subscriptions and change their status to 'EXPIRED' or 'PAST_DUE'
  }
}