/**
 * @class KeyManager
 * @description Manages the lifecycle of encryption keys.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class KeyManager {
  /**
   * @param {ConfigurationService} configurationService
   */
  constructor(configurationService) {
    /** @private */
    this.configurationService = configurationService;
  }

  /**
   * Retrieves an encryption key from a secure source.
   * In a real system, this would integrate with a secrets manager (e.g., Google Secret Manager).
   * For this implementation, it retrieves from the secure Configuration Center.
   * @param {string} keyId - The identifier for the key.
   * @returns {string} The encryption key.
   */
  getKey(keyId) {
    WK.security().checkPermission('securitycenter.key.get');
    const key = this.configurationService.get(`secrets.keys.${keyId}`);
    if (!key) {
      WK.logger().error(`Encryption key with ID '${keyId}' not found in configuration.`, 'KeyManager.getKey');
      throw new Error('Encryption key not found.');
    }
    return key;
  }
}