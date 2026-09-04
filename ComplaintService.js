/**
 * @class ComplaintService
 * @description The main service for orchestrating the lifecycle of citizen complaints.
 */
class ComplaintService {
  /**
   * @param {ComplaintRepository} complaintRepository
   * @param {ComplaintValidator} complaintValidator
   * @param {ComplaintRule} complaintRule
   * @param {WorkflowService} workflowService
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(
    complaintRepository,
    complaintValidator,
    complaintRule,
    workflowService,
    eventBus,
    analyticsService
  ) {
    /** @private */
    this.repository = complaintRepository;
    /** @private */
    this.validator = complaintValidator;
    /** @private */
    this.rule = complaintRule;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('ComplaintService');
    /** @private */
    this.workflowDefinitionId = 'COMPLAINT_RESOLUTION_V1'; // Centralized definition ID
  }

  /**
   * Creates a new complaint and starts its associated workflow.
   * @param {object} payload - The data for the new complaint.
   * @returns {Complaint} The newly created complaint record.
   */
  createComplaint(payload) {
    WK.security().checkPermission('complaint.record.create');
    this.logger.info(`Attempting to create complaint for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const complaintEntity = new Complaint(entityData);
    const createdComplaint = this.repository.create(complaintEntity);

    // Start the workflow for this complaint
    const workflow = this.workflowService.startWorkflow({
      definitionId: this.workflowDefinitionId,
      contextType: 'Complaint',
      contextId: createdComplaint.id,
    });

    // Link the complaint to the workflow instance
    const finalComplaint = this.repository.update(createdComplaint.id, {
      workflowId: workflow.id,
      status: workflow.currentState, // Sync status with workflow's initial state
    });

    this.eventBus.publish('ComplaintCreated', {
      source: 'ComplaintService',
      payload: finalComplaint,
    });

    this.analyticsService.track('complaint_created', {
      complaintId: finalComplaint.id,
      category: finalComplaint.category,
      priority: finalComplaint.priority,
    });

    this.logger.info(`Successfully created complaint ${finalComplaint.id} with workflow ${finalComplaint.workflowId}`);
    return finalComplaint;
  }

  /**
   * Retrieves a single complaint by its ID.
   * @param {string} id - The ID of the complaint.
   * @returns {Complaint}
   */
  getComplaint(id) {
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Complaint with ID ${id} not found.`);
    }

    const security = WK.security();
    if (!security.hasPermission('complaint.record.read.all')) {
      security.checkPermission('complaint.record.read.own');
      if (record.citizenId !== WK.user().citizenId) {
        throw new Error('Access denied. You can only view your own complaints.');
      }
    }

    return record;
  }

  /**
   * Searches for complaints.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Complaint[]}
   */
  searchComplaints(query, options) {
    WK.security().checkPermission('complaint.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Assigns a complaint to a user or role for processing.
   * This action is orchestrated through the workflow.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} assigneeId - The ID of the user or role.
   * @param {string} assigneeType - The type of assignee ('USER' or 'ROLE').
   * @returns {Complaint} The updated complaint record.
   */
  assignComplaint(complaintId, assigneeId, assigneeType) {
    WK.security().checkPermission('complaint.record.assign');
    this.logger.info(`Assigning complaint ${complaintId} to ${assigneeType}:${assigneeId}`);

    const complaint = this.getComplaint(complaintId);
    if (!complaint.workflowId) {
      throw new Error(`Complaint ${complaintId} is not associated with a workflow.`);
    }

    // Orchestrate both workflow and complaint entity updates
    this.workflowService.assign(complaint.workflowId, assigneeId, assigneeType);
    const updatedComplaint = this.repository.update(complaintId, {
      assignedToId: assigneeId,
      assignedToType: assigneeType,
      status: 'ASSIGNED', // Denormalize status
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('ComplaintAssigned', {
      source: 'ComplaintService',
      payload: updatedComplaint,
    });

    return updatedComplaint;
  }

  /**
   * Resolves a complaint by providing resolution notes.
   * This triggers the 'RESOLVE' action in the associated workflow.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} resolutionNotes - The notes detailing the resolution.
   * @returns {Complaint} The updated complaint record.
   */
  resolveComplaint(complaintId, resolutionNotes) {
    WK.security().checkPermission('complaint.record.resolve');
    this.logger.info(`Resolving complaint ${complaintId}`);

    if (!resolutionNotes) {
      throw new Error('Resolution notes are required to resolve a complaint.');
    }

    const complaint = this.getComplaint(complaintId);
    const workflow = this.workflowService.transition(complaint.workflowId, 'RESOLVE', { notes: resolutionNotes });

    const updatedComplaint = this.repository.update(complaintId, {
      status: workflow.currentState, // Sync status from workflow
      resolutionNotes,
      resolutionDate: new Date().toISOString(),
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('ComplaintResolved', {
      source: 'ComplaintService',
      payload: updatedComplaint,
    });

    this.analyticsService.track('complaint_resolved', {
      complaintId: complaintId,
      category: updatedComplaint.category,
    });

    return updatedComplaint;
  }

  /**
   * Closes a complaint. This is typically done after it has been resolved.
   * This triggers the 'CLOSE' action in the associated workflow.
   * @param {string} complaintId - The ID of the complaint.
   * @returns {Complaint} The updated complaint record.
   */
  closeComplaint(complaintId) {
    WK.security().checkPermission('complaint.record.close');
    this.logger.info(`Closing complaint ${complaintId}`);

    const complaint = this.getComplaint(complaintId);
    const workflow = this.workflowService.transition(complaint.workflowId, 'CLOSE');

    const updatedComplaint = this.repository.update(complaintId, {
      status: workflow.currentState, // Sync status from workflow
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('ComplaintClosed', {
      source: 'ComplaintService',
      payload: updatedComplaint,
    });

    return updatedComplaint;
  }

  /**
   * Reopens a closed or resolved complaint.
   * This triggers the 'REOPEN' action in the associated workflow.
   * @param {string} complaintId - The ID of the complaint.
   * @param {string} reason - The reason for reopening.
   * @returns {Complaint} The updated complaint record.
   */
  reopenComplaint(complaintId, reason) {
    WK.security().checkPermission('complaint.record.reopen');
    this.logger.warn(`Reopening complaint ${complaintId} for reason: ${reason}`);

    if (!reason) {
      throw new Error('A reason is required to reopen a complaint.');
    }

    const complaint = this.getComplaint(complaintId);
    const workflow = this.workflowService.transition(complaint.workflowId, 'REOPEN', { notes: reason });

    // Reset resolution fields and update status
    const updatedComplaint = this.repository.update(complaintId, {
      status: workflow.currentState, // Sync status from workflow
      resolutionNotes: null,
      resolutionDate: null,
      updatedBy: WK.user().id,
    });

    this.eventBus.publish('ComplaintReopened', {
      source: 'ComplaintService',
      payload: updatedComplaint,
    });

    return updatedComplaint;
  }

  /**
   * Updates a complaint's non-status fields.
   * @param {string} id - The ID of the complaint.
   * @param {object} payload - The data to update.
   * @returns {Complaint} The updated complaint record.
   */
  updateComplaint(id, payload) {
    const complaint = this.getComplaint(id);
    const security = WK.security();

    // Allow owner to update if not yet assigned, otherwise require full update permission
    if (complaint.status === 'SUBMITTED' && complaint.citizenId === WK.user().citizenId) {
      security.checkPermission('complaint.record.update.own');
    } else {
      security.checkPermission('complaint.record.update.all');
    }

    this.validator.validateForUpdate(payload);

    const updatedRecord = this.repository.update(id, { ...payload, updatedBy: WK.user().id });

    this.eventBus.publish('ComplaintUpdated', {
      source: 'ComplaintService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }
}