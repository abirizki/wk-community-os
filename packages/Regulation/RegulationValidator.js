/**
 * @file RegulationValidator.js
 * @description Provides payload validation for codified regulations and articles.
 */

class RegulationValidator {
  /**
   * @param {RegulationRule} [regulationRule=null]
   */
  constructor(regulationRule = null) {
    /** @private */
    this.rule = regulationRule;
  }

  /**
   * Validates the payload for drafting a new regulation.
   * @param {object} payload - Regulation creation payload.
   * @throws {Error} If validation fails.
   */
  validateRegulationCreate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Regulation payload is required and must be an object.');
    }
    if (!payload.regulationNumber || typeof payload.regulationNumber !== 'string' || payload.regulationNumber.trim() === '') {
      throw new Error('Regulation number (regulationNumber) is required.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Regulation title is required.');
    }
    if (!payload.category || typeof payload.category !== 'string') {
      throw new Error('Regulation category is required.');
    }
    if (!payload.scopeType || typeof payload.scopeType !== 'string') {
      throw new Error('Regulation scopeType (RT/RW/KELURAHAN) is required.');
    }
    if (!payload.scopeId || typeof payload.scopeId !== 'string' || payload.scopeId.trim() === '') {
      throw new Error('Regulation scopeId is required.');
    }
    if (!payload.effectiveDate) {
      throw new Error('Regulation effectiveDate is required.');
    }

    if (this.rule) {
      if (typeof this.rule.checkValidCategory === 'function') {
        this.rule.checkValidCategory(payload.category);
      }
      if (typeof this.rule.checkValidScopeType === 'function') {
        this.rule.checkValidScopeType(payload.scopeType);
      }
      if (payload.decisionId && typeof this.rule.checkDecisionReference === 'function') {
        this.rule.checkDecisionReference(payload.decisionId);
      }
    }
  }

  /**
   * Validates the payload for updating an existing regulation.
   * @param {object} payload - Update payload.
   * @param {object} [currentRegulation=null] - Existing regulation instance.
   * @throws {Error} If validation fails.
   */
  validateRegulationUpdate(payload, currentRegulation = null) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Update payload is required.');
    }

    if (currentRegulation && this.rule && typeof this.rule.checkImmutability === 'function') {
      this.rule.checkImmutability(currentRegulation);
    }

    const immutableFields = ['scopeId', 'scopeType', 'createdAt'];
    for (const field of immutableFields) {
      if (payload[field] !== undefined) {
        throw new Error(`Field '${field}' cannot be modified during a regulation update.`);
      }
    }

    if (payload.category && this.rule && typeof this.rule.checkValidCategory === 'function') {
      this.rule.checkValidCategory(payload.category);
    }
  }

  /**
   * Validates the payload for adding an article to a regulation.
   * @param {object} payload - { regulationId, title, content, chapter, articleNumber, sanctionDescription }.
   * @throws {Error} If validation fails.
   */
  validateArticleAdd(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Article payload is required.');
    }
    if (!payload.regulationId || typeof payload.regulationId !== 'string') {
      throw new Error('Regulation ID is required to add an article.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Article title is required.');
    }
    if (!payload.content || typeof payload.content !== 'string' || payload.content.trim() === '') {
      throw new Error('Article content / text is required.');
    }
  }
}

module.exports = RegulationValidator;

