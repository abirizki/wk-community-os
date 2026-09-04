/**
 * @class FeatureFlagService
 * @description Determines if a feature is enabled for a given tenant based on their subscription plan.
 */
class FeatureFlagService {
  /**
   * @param {SubscriptionManager} subscriptionManager
   */
  constructor(subscriptionManager) {
    /** @private */
    this.subscriptionManager = subscriptionManager;
    /** @private */
    this.planFeatures = this._loadPlanFeatures();
  }

  /**
   * Loads the feature entitlements for each subscription plan.
   * This would typically come from a configuration file.
   * @private
   * @returns {object}
   */
  _loadPlanFeatures() {
    return {
      'FREE': ['CITIZEN_MANAGEMENT', 'HOUSEHOLD_MANAGEMENT'],
      'STANDARD': ['CITIZEN_MANAGEMENT', 'HOUSEHOLD_MANAGEMENT', 'LETTER_SERVICE', 'COMPLAINT_SERVICE'],
      'PREMIUM': ['CITIZEN_MANAGEMENT', 'HOUSEHOLD_MANAGEMENT', 'LETTER_SERVICE', 'COMPLAINT_SERVICE', 'ANALYTICS', 'GOVERNANCE'],
      'ENTERPRISE': ['*'] // All features
    };
  }

  /**
   * Checks if a specific feature is enabled for a tenant.
   * @param {string} featureName - The name of the feature to check (e.g., 'COMPLAINT_SERVICE').
   * @param {string} [tenantId] - The ID of the tenant. If not provided, uses the current session's tenant.
   * @returns {boolean} True if the feature is enabled.
   */
  isEnabled(featureName, tenantId) {
    const currentTenantId = tenantId || WK.service('saas.tenantManager').getCurrentTenantId();
    if (!currentTenantId) {
      return false; // No tenant context, no features enabled.
    }

    const subscription = this.subscriptionManager.getSubscriptionForTenant(currentTenantId);
    if (!subscription) {
      return false; // No active subscription.
    }

    const features = this.planFeatures[subscription.planId];
    if (!features) {
      return false; // Plan not found or has no features.
    }

    // Check for wildcard (all features) or specific feature inclusion.
    return features.includes('*') || features.includes(featureName);
  }
}