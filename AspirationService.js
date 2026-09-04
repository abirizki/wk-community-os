/**
 * @class AspirationService
 * @description The main service for orchestrating the lifecycle of citizen aspirations.
 */
class AspirationService {
  /**
   * @param {AspirationRepository} aspirationRepository
   * @param {AspirationValidator} aspirationValidator
   * @param {AspirationRule} aspirationRule
   * @param {WorkflowService} workflowService
   * @param {CitizenRepository} citizenRepository
   * @param {FamilyRepository} familyRepository
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(
    aspirationRepository,
    aspirationValidator,
    aspirationRule,
    workflowService,
    citizenRepository, // Injected for rule checks, not direct use
    familyRepository,  // Injected for rule checks, not direct use
    eventBus,
    analyticsService
  ) {
    /** @private */
    this.repository = aspirationRepository;
    /** @private */
    this.validator = aspirationValidator;
    /** @private */
    this.rule = aspirationRule;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.citizenRepository = citizenRepository; // Used by rule
    /** @private */
    this.familyRepository = familyRepository;   // Used by rule
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('AspirationService');
    /** @private */
    this.workflowDefinitionId = 'ASPIRATION_RESOLUTION_V1'; // Centralized definition ID
  }

  /**
   * Creates a new aspiration and starts its associated workflow.
   * @param {object} payload - The data for the new aspiration.
   * @returns {Aspiration} The newly created aspiration record.
   */
  createAspiration(payload) {
    WK.security().checkPermission('aspiration.record.create');
    this.logger.info(`Attempting to create aspiration for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const aspirationEntity = new Aspiration(entityData);
    const createdAspiration = this.repository.create(aspirationEntity);

    // Start the workflow for this aspiration
    const workflow = this.workflowService.startWorkflow({
      definitionId: this.workflowDefinitionId,
      contextType: 'Aspiration',
      contextId: createdAspiration.id,
    });

    // Link the aspiration to the workflow instance and sync initial status
    const finalAspiration = this.repository.update(createdAspiration.id, {
      workflowId: workflow.id,
      status: workflow.currentState, // Sync status with workflow's initial state
    });

    this.eventBus.publish('AspirationCreated', {
      source: 'AspirationService',
      payload: finalAspiration,
    });

    this.analyticsService.track('aspiration_created', {
      aspirationId: finalAspiration.id,
      category: finalAspiration.category,
    });

    this.logger.info(`Successfully created aspiration ${finalAspiration.id} with workflow ${finalAspiration.workflowId}`);
    return finalAspiration;
  }

  /**
   * Retrieves a single aspiration by its ID.
   * @param {string} id - The ID of the aspiration.
   * @returns {Aspiration}
   */
  getAspiration(id) {
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Aspiration with ID ${id} not found.`);
    }

    const security = WK.security();
    if (!security.hasPermission('aspiration.record.read.all')) {
      security.checkPermission('aspiration.record.read.own');
      if (record.citizenId !== WK.user().citizenId) {
        throw new Error('Access denied. You can only view your own aspirations.');
      }
    }

    return record;
  }

  /**
   * Searches for aspirations.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Aspiration[]}
   */
  searchAspirations(query, options) {
    WK.security().checkPermission('aspiration.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Updates an aspiration's non-status fields.
   * @param {string} id - The ID of the aspiration.
   * @param {object} payload - The data to update.
   * @returns {Aspiration} The updated aspiration record.
   */
  updateAspiration(id, payload) {
    const aspiration = this.getAspiration(id);
    const security = WK.security();

    // Allow owner to update if not yet assigned/processed, otherwise require full update permission
    if (['SUBMITTED', 'IN_REVIEW'].includes(aspiration.status) && aspiration.citizenId === WK.user().citizenId) {
      security.checkPermission('aspiration.record.update.own');
    } else {
      security.checkPermission('aspiration.record.update.all');
    }

    this.validator.validateForUpdate(payload);

    const updatedRecord = this.repository.update(id, { ...payload, updatedAt: new Date().toISOString(), updatedBy: WK.user().id });

    this.eventBus.publish('AspirationUpdated', {
      source: 'AspirationService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Assigns an aspiration to a user or role for review/implementation.
   * This action is orchestrated through the workflow.
   * @param {string} aspirationId - The ID of the aspiration.
   * @param {string} assigneeId - The ID of the user or role.
   * @param {string} assigneeType - The type of assignee ('USER' or 'ROLE').
   * @returns {Aspiration} The updated aspiration record.
   */
  assignAspiration(aspirationId, assigneeId, assigneeType) {
    WK.security().checkPermission('aspiration.record.assign');
    this.logger.info(`Assigning aspiration ${aspirationId} to ${assigneeType}:${assigneeId}`);

    const aspiration = this.getAspiration(aspirationId);
    if (!aspiration.workflowId) {
      throw new Error(`Aspiration ${aspirationId} is not associated with a workflow.`);
    }

    // Orchestrate both workflow and aspiration entity updates
    this.workflowService.assign(aspiration.workflowId, assigneeId, assigneeType);
    const updatedAspiration = this.repository.update(aspirationId, {
      assignedToId: assigneeId,
      assignedToType: assigneeType,
      status: 'ASSIGNED', // Denormalize status
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('AspirationAssigned', {
      source: 'AspirationService',
      payload: updatedAspiration,
    });

    return updatedAspiration;
  }

  /**
   * Processes an aspiration, typically adding resolution notes or moving it forward.
   * This triggers a 'PROCESS' action in the associated workflow.
   * @param {string} aspirationId - The ID of the aspiration.
   * @param {string} notes - Notes on the processing.
   * @returns {Aspiration} The updated aspiration record.
   */
  processAspiration(aspirationId, notes) {
    WK.security().checkPermission('aspiration.record.process');
    this.logger.info(`Processing aspiration ${aspirationId}`);

    const aspiration = this.getAspiration(aspirationId);
    const workflow = this.workflowService.transition(aspiration.workflowId, 'PROCESS', { notes });

    const updatedAspiration = this.repository.update(aspirationId, {
      status: workflow.currentState, // Sync status from workflow
      resolutionNotes: notes, // Update resolution notes as part of processing
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('AspirationProcessed', {
      source: 'AspirationService',
      payload: updatedAspiration,
    });

    return updatedAspiration;
  }

  /**
   * Records a vote (upvote or downvote) for an aspiration.
   * @param {string} aspirationId - The ID of the aspiration.
   * @param {string} voteType - 'UPVOTE' or 'DOWNVOTE'.
   * @returns {Aspiration} The updated aspiration record.
   */
  voteAspiration(aspirationId, voteType) {
    WK.security().checkPermission('aspiration.record.vote');
    this.logger.info(`Citizen ${WK.user().id} attempting to ${voteType} aspiration ${aspirationId}`);

    const aspiration = this.getAspiration(aspirationId);
    this.rule.checkCanBeVoted(aspiration);

    let updatePayload = {};
    if (voteType === 'UPVOTE') {
      updatePayload.upvotes = aspiration.upvotes + 1;
    } else if (voteType === 'DOWNVOTE') {
      updatePayload.downvotes = aspiration.downvotes + 1;
    } else {
      throw new Error('Invalid vote type. Must be UPVOTE or DOWNVOTE.');
    }

    const updatedAspiration = this.repository.update(aspirationId, {
      ...updatePayload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id, // The voter
    });

    this.eventBus.publish('AspirationVoted', {
      source: 'AspirationService',
      payload: { aspirationId: updatedAspiration.id, voteType, citizenId: WK.user().citizenId },
    });

    return updatedAspiration;
  }

  /**
   * Marks an aspiration as implemented.
   * This triggers an 'IMPLEMENT' action in the associated workflow.
   * @param {string} aspirationId - The ID of the aspiration.
   * @param {string} resolutionNotes - Notes on the implementation.
   * @returns {Aspiration} The updated aspiration record.
   */
  implementAspiration(aspirationId, resolutionNotes) {
    WK.security().checkPermission('aspiration.record.implement');
    this.logger.info(`Implementing aspiration ${aspirationId}`);

    if (!resolutionNotes) {
      throw new Error('Resolution notes are required to mark an aspiration as implemented.');
    }

    const aspiration = this.getAspiration(aspirationId);
    const workflow = this.workflowService.transition(aspiration.workflowId, 'IMPLEMENT', { notes: resolutionNotes });

    const updatedAspiration = this.repository.update(aspirationId, {
      status: workflow.currentState, // Sync status from workflow
      resolutionNotes,
      resolutionDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('AspirationImplemented', {
      source: 'AspirationService',
      payload: updatedAspiration,
    });

    this.analyticsService.track('aspiration_implemented', {
      aspirationId: aspirationId,
      category: updatedAspiration.category,
    });

    return updatedAspiration;
  }

  /**
   * Archives an aspiration.
   * This triggers an 'ARCHIVE' action in the associated workflow.
   * @param {string} aspirationId - The ID of the aspiration.
   * @returns {Aspiration} The updated aspiration record.
   */
  archiveAspiration(aspirationId) {
    WK.security().checkPermission('aspiration.record.archive');
    this.logger.info(`Archiving aspiration ${aspirationId}`);

    const aspiration = this.getAspiration(aspirationId);
    const workflow = this.workflowService.transition(aspiration.workflowId, 'ARCHIVE');

    const updatedAspiration = this.repository.update(aspirationId, {
      status: workflow.currentState, // Sync status from workflow
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('AspirationArchived', {
      source: 'AspirationService',
      payload: updatedAspiration,
    });

    return updatedAspiration;
  }
}