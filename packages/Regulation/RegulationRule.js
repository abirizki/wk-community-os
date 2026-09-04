/**
 * @file RegulationRule.js
 * @description Encapsulates business logic, legal immutability, and lifecycle transitions for the Regulation module.
 */

// Import or fallback to RegulationConstants
let RegulationConstants;
try {
  ({ RegulationConstants } = require('./RegulationEntity.js'));
} catch (e) {
  RegulationConstants = {
    CATEGORIES: ['TATA_TERTIB', 'KETERTIBAN_KEAMANAN', 'PENGELOLAAN_SAMPAH_LINGKUNGAN', 'PEMANFAATAN_FASUM', 'ADMINISTRASI_WARGA', 'LAINNYA'],
    SCOPE_TYPES: ['RT', 'RW', 'KELURAHAN'],
    STATUSES: ['DRAFT', 'UNDER_REVIEW', 'ENACTED', 'SUPERSEDED', 'REVOKED'],
  };
}

class RegulationRule {
  /**
   * @param {RegulationRepository} regulationRepository
   * @param {object} [decisionRepository=null]
   */
  constructor(regulationRepository, decisionRepository = null) {
    /** @private */
    this.repository = regulationRepository;
    /** @private */
    this.decisionRepository = decisionRepository;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('RegulationRule') : console;

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['UNDER_REVIEW', 'ENACTED', 'REVOKED'],
      'UNDER_REVIEW': ['ENACTED', 'DRAFT', 'REVOKED'],
      'ENACTED': ['SUPERSEDED', 'REVOKED'],
      'SUPERSEDED': [],
      'REVOKED': [],
    };
  }

  /**
   * Validates if the category is permitted.
   * @param {string} category - Regulation category.
   * @throws {Error} If category is invalid.
   */
  checkValidCategory(category) {
    const validCategories = RegulationConstants.CATEGORIES || [];
    if (!category || !validCategories.includes(category)) {
      throw new Error(`Invalid regulation category '${category}'. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  /**
   * Validates if the scope type is permitted.
   * @param {string} scope - Scope type ('RT', 'RW', 'KELURAHAN').
   * @throws {Error} If scope is invalid.
   */
  checkValidScopeType(scope) {
    const validScopes = RegulationConstants.SCOPE_TYPES || [];
    if (!scope || !validScopes.includes(scope)) {
      throw new Error(`Invalid scope type '${scope}'. Must be one of: ${validScopes.join(', ')}`);
    }
  }

  /**
   * Validates if the underlying Decision reference is valid and ratified.
   * @param {string} decisionId - Decision ID.
   * @throws {Error} If decision reference is invalid or not ratified.
   */
  checkDecisionReference(decisionId) {
    if (!decisionId) return;

    if (this.decisionRepository && typeof this.decisionRepository.findDecisionById === 'function') {
      const decision = this.decisionRepository.findDecisionById(decisionId);
      if (!decision) {
        throw new Error(`Referenced Decision with ID '${decisionId}' does not exist.`);
      }
      if (decision.status !== 'RATIFIED') {
        throw new Error(`Referenced Decision with ID '${decisionId}' has status '${decision.status}'. Only RATIFIED decisions can serve as legal foundation.`);
      }
    }
  }

  /**
   * Validates if the regulation status transition is permitted.
   * @param {string} currentStatus - Current status.
   * @param {string} nextStatus - Target status.
   * @throws {Error} If transition is illegal.
   */
  checkStatusTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
      return;
    }
    const allowed = this.allowedStatusTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid regulation status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }

  /**
   * Enforces immutability on enacted, superseded, or revoked regulations.
   * @param {object} regulation - Regulation entity or record.
   * @throws {Error} If regulation is enacted/locked.
   */
  checkImmutability(regulation) {
    if (!regulation) {
      throw new Error('Regulation does not exist.');
    }
    if (regulation.status === 'ENACTED') {
      throw new Error('This regulation has been enacted and promulgated (immutable). Modifying articles requires issuing an amended or superseding regulation.');
    }
    if (regulation.status === 'SUPERSEDED') {
      throw new Error('This regulation has been superseded and cannot be modified.');
    }
    if (regulation.status === 'REVOKED') {
      throw new Error('This regulation has been revoked and cannot be modified.');
    }
  }
}

module.exports = RegulationRule;

