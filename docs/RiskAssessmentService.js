/**
 * @class RiskAssessmentService
 * @description Provides services for identifying, assessing, and tracking operational and security risks.
 */
class RiskAssessmentService {
  /**
   * @param {object} dbAdapter - The database adapter for the risk register.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('risk_register');
    WK.logger().info('RiskAssessmentService initialized for table: risk_register');
  }

  /**
   * Retrieves all risks from the risk register.
   * @returns {object[]} An array of risk objects.
   */
  getRiskRegister() {
    WK.security().checkPermission('governance.risk.view');
    return this.db.findAll({}, { sortBy: 'impact', order: 'desc' });
  }

  /**
   * Adds a new risk to the register.
   * @param {object} riskData - The data for the new risk.
   * @param {string} riskData.description - Description of the risk.
   * @param {number} riskData.likelihood - Likelihood score (1-5).
   * @param {number} riskData.impact - Impact score (1-5).
   * @param {string} riskData.owner - The person or role responsible for the risk.
   * @param {string} riskData.mitigationStrategy - The plan to mitigate the risk.
   * @returns {object} The created risk object.
   */
  addRisk(riskData) {
    WK.security().checkPermission('governance.risk.create');
    const riskScore = (riskData.likelihood || 1) * (riskData.impact || 1);
    let riskLevel = 'Low';
    if (riskScore >= 15) riskLevel = 'Critical';
    else if (riskScore >= 9) riskLevel = 'High';
    else if (riskScore >= 4) riskLevel = 'Medium';

    const newRisk = {
      id: WK.helper().generateUuid(),
      ...riskData,
      riskScore: riskScore,
      riskLevel: riskLevel,
      status: 'Open',
      createdAt: new Date().toISOString()
    };

    return this.db.create(newRisk);
  }

  /**
   * Updates an existing risk in the register.
   * @param {string} riskId - The ID of the risk to update.
   * @param {object} updateData - The data to update.
   * @returns {object} The updated risk object.
   */
  updateRisk(riskId, updateData) {
    WK.security().checkPermission('governance.risk.update');
    return this.db.update(riskId, updateData);
  }
}