/**
 * @class SecurityPolicyManager
 * @description Manages the lifecycle and enforcement of all security policies.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SecurityPolicyManager {
  /**
   * @param {ConfigurationService} configurationService - From ConfigurationCenter
   */
  constructor(configurationService) {
    /** @private */
    this.configurationService = configurationService;
    /** @private @type {Map<string, any>} */
    this.policies = new Map();
  }

  /**
   * Loads all security policies from the Configuration Center at boot time.
   */
  loadPolicies() {
    WK.logger().info('Loading security policies...');
    const securityConfigs = this.configurationService.get('security');
    if (securityConfigs) {
      for (const key in securityConfigs) {
        this.policies.set(key, securityConfigs[key]);
        WK.logger().debug(`Loaded policy: ${key}`);
      }
    }
    WK.logger().info('Security policies loaded.');
  }

  /**
   * Retrieves a specific security policy value.
   * @param {string} policyKey - The key of the policy (e.g., 'session.timeout_minutes').
   * @returns {any} The value of the policy, or undefined if not found.
   */
  getPolicy(policyKey) {
    return this.policies.get(policyKey);
  }
}