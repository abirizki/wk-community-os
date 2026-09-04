/**
 * @class ConsentService
 * @description Manages user consent for data processing, terms of service, and privacy policies.
 */
class ConsentService {
  /**
   * @param {object} dbAdapter - The database adapter for consent records.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('user_consent');
    WK.logger().info('ConsentService initialized for table: user_consent');
  }

  /**
   * Records a user's consent.
   * @param {string} userId - The ID of the user giving consent.
   * @param {string} consentType - The type of consent (e.g., 'TERMS_OF_SERVICE', 'PRIVACY_POLICY').
   * @param {string} version - The version of the document they are consenting to.
   * @returns {object} The created consent record.
   */
  recordConsent(userId, consentType, version) {
    WK.logger().info(`Recording consent for user ${userId}, type: ${consentType}, version: ${version}`);
    const consentRecord = {
      id: WK.helper().generateUuid(),
      userId: userId,
      consentType: consentType,
      version: version,
      timestamp: new Date().toISOString(),
      ipAddress: WK.session().getIpAddress() || 'N/A'
    };
    return this.db.create(consentRecord);
  }

  /**
   * Checks if a user has given consent for a specific type and version.
   * @param {string} userId - The ID of the user.
   * @param {string} consentType - The type of consent to check.
   * @param {string} [version] - The specific version to check for. If omitted, checks for any version.
   * @returns {boolean} True if consent has been given.
   */
  hasConsent(userId, consentType, version) {
    const query = {
      userId: userId,
      consentType: consentType
    };
    if (version) {
      query.version = version;
    }
    const record = this.db.findOne(query);
    return !!record;
  }
}