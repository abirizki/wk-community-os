/**
 * @file DecisionService.js
 * @description Core business service orchestrating the drafting, ratification, superseding, and revocation of community decisions.
 */

// Import Entity models if available
let Decision, DecisionImpact;
try {
  ({ Decision, DecisionImpact } = require('./DecisionEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class DecisionService {
  /**
   * @param {DecisionRepository} decisionRepository
   * @param {DecisionValidator} decisionValidator
   * @param {DecisionPermission} decisionPermission
   * @param {DecisionRule} decisionRule
   * @param {object} [eventBus=null]
   * @param {object} [analyticsService=null]
   */
  constructor(
    decisionRepository,
    decisionValidator,
    decisionPermission,
    decisionRule,
    eventBus = null,
    analyticsService = null
  ) {
    /** @private */
    this.repository = decisionRepository;
    /** @private */
    this.validator = decisionValidator;
    /** @private */
    this.permission = decisionPermission;
    /** @private */
    this.rule = decisionRule;
    /** @private */
    this.eventBus = eventBus || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null);
    /** @private */
    this.analyticsService = analyticsService || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null);
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('DecisionService') : console;
  }

  // =========================================================================
  // DECISION LIFECYCLE OPERATIONS
  // =========================================================================

  /**
   * Drafts a new community decision from meeting minutes.
   * @param {object} payload - Decision payload.
   * @returns {Decision}
   */
  createDecision(payload) {
    this.permission.checkCreateDecision();
    if (this.logger && typeof this.logger.info === 'function') {
      this.logger.info(`Drafting decision: '${payload.title}' (Meeting: ${payload.meetingId})`);
    }

    this.validator.validateDecisionCreate(payload);

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : null;
    const entityData = {
      ...payload,
      status: 'DRAFT',
      createdBy: currentUser ? currentUser.id : null,
      updatedBy: currentUser ? currentUser.id : null,
    };

    const decisionEntity = Decision ? new Decision(entityData) : entityData;
    const createdDecision = this.repository.createDecision(decisionEntity);

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('DecisionCreated', {
        source: 'DecisionService',
        payload: createdDecision,
      });
    }

    return createdDecision;
  }

  /**
   * Retrieves a single decision by ID.
   * @param {string} id - Decision ID.
   * @returns {Decision}
   */
  getDecision(id) {
    this.permission.checkReadOwnScope();
    const decision = this.repository.findDecisionById(id);
    if (!decision) {
      throw new Error(`Decision with ID '${id}' not found.`);
    }
    return decision;
  }

  /**
   * Searches for decisions matching query filters.
   * @param {object} [query={}] - Filters.
   * @param {object} [options={}] - Options.
   * @returns {Decision[]}
   */
  searchDecisions(query = {}, options = {}) {
    this.permission.checkReadOwnScope();
    return this.repository.searchDecisions(query, options);
  }

  /**
   * Ratifies and signs an active draft decision, making it legally binding.
   * @param {string} decisionId - Decision ID.
   * @param {string} signatoryCitizenId - Official signatory ID (e.g., Ketua RT/RW).
   * @returns {Decision}
   */
  ratifyDecision(decisionId, signatoryCitizenId) {
    this.permission.checkRatifyDecision();
    const decision = this.repository.findDecisionById(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found.`);
    }

    this.rule.checkStatusTransition(decision.status, 'RATIFIED');

    const updated = this.repository.updateDecision(decisionId, {
      status: 'RATIFIED',
      signatoryCitizenId: signatoryCitizenId,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('DecisionRatified', {
        source: 'DecisionService',
        payload: updated,
      });
    }

    if (this.analyticsService && typeof this.analyticsService.track === 'function') {
      this.analyticsService.track('decision_ratified', {
        decisionId: updated.id,
        category: updated.category,
        scopeId: updated.scopeId,
      });
    }

    return updated;
  }

  /**
   * Replaces an active decree with an updated formal decision.
   * @param {string} oldDecisionId - Old Decision ID to supersede.
   * @param {object} newPayload - New Decision creation payload.
   * @returns {object} { oldDecision, newDecision }
   */
  supersedeDecision(oldDecisionId, newPayload) {
    this.permission.checkSupersedeDecision();
    const oldDecision = this.repository.findDecisionById(oldDecisionId);
    if (!oldDecision) {
      throw new Error(`Old decision '${oldDecisionId}' not found.`);
    }

    if (oldDecision.status !== 'RATIFIED') {
      throw new Error(`Cannot supersede decision in status '${oldDecision.status}'. Only RATIFIED decisions can be superseded.`);
    }

    this.rule.checkStatusTransition(oldDecision.status, 'SUPERSEDED');

    // Create the new superseding decision
    const newDecision = this.createDecision(newPayload);

    // Update old decision status and pointer
    const updatedOld = this.repository.updateDecision(oldDecisionId, {
      status: 'SUPERSEDED',
      supersededByDecisionId: newDecision.id,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('DecisionSuperseded', {
        source: 'DecisionService',
        payload: { oldDecision: updatedOld, newDecision: newDecision },
      });
    }

    return { oldDecision: updatedOld, newDecision };
  }

  /**
   * Formally revokes or annuls an active decision.
   * @param {string} decisionId - Decision ID.
   * @param {string} reason - Revocation justification.
   * @returns {Decision}
   */
  revokeDecision(decisionId, reason) {
    this.permission.checkRevokeDecision();
    const decision = this.repository.findDecisionById(decisionId);
    if (!decision) {
      throw new Error(`Decision with ID '${decisionId}' not found.`);
    }

    this.rule.checkStatusTransition(decision.status, 'REVOKED');

    const updated = this.repository.updateDecision(decisionId, {
      status: 'REVOKED',
      content: `${decision.content}\n\n[DICABUT DENGAN ALASAN]: ${reason}`,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('DecisionRevoked', {
        source: 'DecisionService',
        payload: updated,
      });
    }

    return updated;
  }

  // =========================================================================
  // POLICY IMPACT OPERATIONS
  // =========================================================================

  /**
   * Adds a target impact declaration to a decision.
   * @param {object} payload - { decisionId, targetType, targetScopeId, description }.
   * @returns {DecisionImpact}
   */
  addImpact(payload) {
    this.permission.checkCreateDecision();
    this.validator.validateImpactAdd(payload);

    const decision = this.repository.findDecisionById(payload.decisionId);
    if (!decision) {
      throw new Error(`Decision '${payload.decisionId}' not found.`);
    }

    if (decision.status === 'REVOKED' || decision.status === 'SUPERSEDED') {
      throw new Error(`Cannot add impact to a ${decision.status} decision.`);
    }

    const impactEntity = DecisionImpact ? new DecisionImpact(payload) : payload;
    return this.repository.addImpact(impactEntity);
  }

  /**
   * Retrieves complete decision details bundle including all impact declarations.
   * @param {string} decisionId - Decision ID.
   * @returns {object}
   */
  getDecisionDetails(decisionId) {
    const decision = this.getDecision(decisionId);
    const impacts = this.repository.findImpactsByDecisionId(decisionId);

    return {
      decision,
      impacts,
    };
  }
}

module.exports = DecisionService;

