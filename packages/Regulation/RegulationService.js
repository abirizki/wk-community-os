/**
 * @file RegulationService.js
 * @description Core business service orchestrating the drafting, enactment, superseding, and revocation of codified regulations.
 */

// Import Entity models if available
let Regulation, RegulationArticle;
try {
  ({ Regulation, RegulationArticle } = require('./RegulationEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class RegulationService {
  /**
   * @param {RegulationRepository} regulationRepository
   * @param {RegulationValidator} regulationValidator
   * @param {RegulationPermission} regulationPermission
   * @param {RegulationRule} regulationRule
   * @param {object} [eventBus=null]
   * @param {object} [analyticsService=null]
   */
  constructor(
    regulationRepository,
    regulationValidator,
    regulationPermission,
    regulationRule,
    eventBus = null,
    analyticsService = null
  ) {
    /** @private */
    this.repository = regulationRepository;
    /** @private */
    this.validator = regulationValidator;
    /** @private */
    this.permission = regulationPermission;
    /** @private */
    this.rule = regulationRule;
    /** @private */
    this.eventBus = eventBus || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null);
    /** @private */
    this.analyticsService = analyticsService || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null);
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('RegulationService') : console;
  }

  // =========================================================================
  // REGULATION LIFECYCLE OPERATIONS
  // =========================================================================

  /**
   * Drafts a new regulation from decision minutes or public ordinance proposal.
   * @param {object} payload - Regulation payload.
   * @returns {Regulation}
   */
  draftRegulation(payload) {
    this.permission.checkCreateRegulation();
    if (this.logger && typeof this.logger.info === 'function') {
      this.logger.info(`Drafting regulation: '${payload.title}' (${payload.regulationNumber})`);
    }

    this.validator.validateRegulationCreate(payload);

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : null;
    const entityData = {
      ...payload,
      status: 'DRAFT',
      createdBy: currentUser ? currentUser.id : null,
      updatedBy: currentUser ? currentUser.id : null,
    };

    const regulationEntity = Regulation ? new Regulation(entityData) : entityData;
    const createdRegulation = this.repository.createRegulation(regulationEntity);

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('RegulationCreated', {
        source: 'RegulationService',
        payload: createdRegulation,
      });
    }

    return createdRegulation;
  }

  /**
   * Retrieves a single regulation by ID.
   * @param {string} id - Regulation ID.
   * @returns {Regulation}
   */
  getRegulation(id) {
    this.permission.checkReadOwnScope();
    const regulation = this.repository.findRegulationById(id);
    if (!regulation) {
      throw new Error(`Regulation with ID '${id}' not found.`);
    }
    return regulation;
  }

  /**
   * Searches for regulations matching query filters.
   * @param {object} [query={}] - Filters.
   * @param {object} [options={}] - Options.
   * @returns {Regulation[]}
   */
  searchRegulations(query = {}, options = {}) {
    this.permission.checkReadOwnScope();
    return this.repository.searchRegulations(query, options);
  }

  /**
   * Submits a draft regulation for review.
   * @param {string} regulationId - Regulation ID.
   * @returns {Regulation}
   */
  submitForReview(regulationId) {
    this.permission.checkCreateRegulation();
    const regulation = this.repository.findRegulationById(regulationId);
    if (!regulation) {
      throw new Error(`Regulation '${regulationId}' not found.`);
    }

    this.rule.checkStatusTransition(regulation.status, 'UNDER_REVIEW');

    return this.repository.updateRegulation(regulationId, {
      status: 'UNDER_REVIEW',
    });
  }

  /**
   * Formally enacts and promulgates a regulation.
   * @param {string} regulationId - Regulation ID.
   * @param {string} signatoryCitizenId - ID of official enacting the regulation.
   * @returns {Regulation}
   */
  enactRegulation(regulationId, signatoryCitizenId) {
    this.permission.checkEnactRegulation();
    const regulation = this.repository.findRegulationById(regulationId);
    if (!regulation) {
      throw new Error(`Regulation with ID '${regulationId}' not found.`);
    }

    this.rule.checkStatusTransition(regulation.status, 'ENACTED');

    const updated = this.repository.updateRegulation(regulationId, {
      status: 'ENACTED',
      enactedDate: new Date().toISOString(),
      signatoryCitizenId: signatoryCitizenId,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('RegulationEnacted', {
        source: 'RegulationService',
        payload: updated,
      });
    }

    if (this.analyticsService && typeof this.analyticsService.track === 'function') {
      this.analyticsService.track('regulation_enacted', {
        regulationId: updated.id,
        category: updated.category,
        scopeId: updated.scopeId,
      });
    }

    return updated;
  }

  /**
   * Supersedes an active regulation with a newer statute.
   * @param {string} oldRegulationId - Old Regulation ID.
   * @param {object} newPayload - New regulation creation payload.
   * @returns {object} { oldRegulation, newRegulation }
   */
  supersedeRegulation(oldRegulationId, newPayload) {
    this.permission.checkSupersedeRegulation();
    const oldRegulation = this.repository.findRegulationById(oldRegulationId);
    if (!oldRegulation) {
      throw new Error(`Old regulation '${oldRegulationId}' not found.`);
    }

    if (oldRegulation.status !== 'ENACTED') {
      throw new Error(`Cannot supersede regulation in status '${oldRegulation.status}'. Only ENACTED regulations can be superseded.`);
    }

    this.rule.checkStatusTransition(oldRegulation.status, 'SUPERSEDED');

    // Create the new superseding regulation
    const newRegulation = this.draftRegulation(newPayload);

    // Update old regulation status and pointer
    const updatedOld = this.repository.updateRegulation(oldRegulationId, {
      status: 'SUPERSEDED',
      supersededByRegulationId: newRegulation.id,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('RegulationSuperseded', {
        source: 'RegulationService',
        payload: { oldRegulation: updatedOld, newRegulation: newRegulation },
      });
    }

    return { oldRegulation: updatedOld, newRegulation };
  }

  /**
   * Revokes and repeals an active regulation.
   * @param {string} regulationId - Regulation ID.
   * @param {string} reason - Justification for revocation.
   * @returns {Regulation}
   */
  revokeRegulation(regulationId, reason) {
    this.permission.checkRevokeRegulation();
    const regulation = this.repository.findRegulationById(regulationId);
    if (!regulation) {
      throw new Error(`Regulation with ID '${regulationId}' not found.`);
    }

    this.rule.checkStatusTransition(regulation.status, 'REVOKED');

    const updated = this.repository.updateRegulation(regulationId, {
      status: 'REVOKED',
      description: regulation.description ? `${regulation.description}\n\n[DICABUT / ALASAN]: ${reason}` : `[DICABUT]: ${reason}`,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('RegulationRevoked', {
        source: 'RegulationService',
        payload: updated,
      });
    }

    return updated;
  }

  // =========================================================================
  // ARTICLE & BYLAW OPERATIONS
  // =========================================================================

  /**
   * Adds an article to a regulation.
   * @param {object} payload - { regulationId, title, content, chapter, articleNumber, sanctionDescription, displayOrder }.
   * @returns {RegulationArticle}
   */
  addArticle(payload) {
    this.permission.checkCreateRegulation();
    this.validator.validateArticleAdd(payload);

    const regulation = this.repository.findRegulationById(payload.regulationId);
    if (!regulation) {
      throw new Error(`Regulation '${payload.regulationId}' not found.`);
    }

    if (regulation.status === 'REVOKED' || regulation.status === 'SUPERSEDED') {
      throw new Error(`Cannot add articles to a ${regulation.status} regulation.`);
    }

    const articleEntity = RegulationArticle ? new RegulationArticle(payload) : payload;
    return this.repository.addArticle(articleEntity);
  }

  /**
   * Retrieves complete regulation bundle including all codified articles.
   * @param {string} regulationId - Regulation ID.
   * @returns {object}
   */
  getRegulationDetails(regulationId) {
    const regulation = this.getRegulation(regulationId);
    const articles = this.repository.findArticlesByRegulationId(regulationId);

    return {
      regulation,
      articles,
    };
  }
}

module.exports = RegulationService;

