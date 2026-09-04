/**
 * @class ReferralService
 * @description The main service for managing citizen referral records.
 */
class ReferralService {
  /**
   * @param {ReferralRepository} referralRepository
   * @param {ReferralValidator} referralValidator
   * @param {ReferralRule} referralRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(referralRepository, referralValidator, referralRule, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = referralRepository;
    /** @private */
    this.validator = referralValidator;
    /** @private */
    this.rule = referralRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('ReferralService');
  }

  /**
   * Creates a new referral record.
   * @param {object} payload - The data for the new record.
   * @returns {Referral} The newly created record.
   */
  createReferral(payload) {
    WK.security().checkPermission('referral.record.create');
    this.logger.info(`Attempting to create referral for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const referralEntity = new Referral(entityData);
    const createdRecord = this.repository.create(referralEntity);

    this.eventBus.publish('ReferralCreated', {
      source: 'ReferralService',
      payload: createdRecord,
    });

    this.analyticsService.track('referral_created', { citizenId: createdRecord.citizenId, referralType: createdRecord.referralType });
    this.logger.info(`Successfully created referral ${createdRecord.id} for citizen ${createdRecord.citizenId}`);

    return createdRecord;
  }

  /**
   * Updates an existing referral record.
   * @param {string} id - The ID of the record to update.
   * @param {object} payload - The update data.
   * @returns {Referral} The updated record.
   */
  updateReferral(id, payload) {
    WK.security().checkPermission('referral.record.update.all');
    this.logger.info(`Attempting to update referral record: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Referral record with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('ReferralUpdated', {
      source: 'ReferralService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated referral record: ${id}`);
    return updatedRecord;
  }

  /**
   * Deletes a referral record.
   * @param {string} id - The ID of the record to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteReferral(id) {
    WK.security().checkPermission('referral.record.delete');
    this.logger.warn(`Attempting to delete referral record: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Referral record with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('ReferralDeleted', {
        source: 'ReferralService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deleted referral record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single referral record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Referral}
   */
  getReferral(id) {
    WK.security().checkPermission('referral.record.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Referral record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves the referral history for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {Referral[]}
   */
  getHistory(citizenId) {
    WK.security().checkPermission('referral.record.read.all');
    return this.repository.findByCitizen(citizenId, { sortBy: 'referralDate', order: 'desc' });
  }

  /**
   * Retrieves the latest referral record for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {Referral|null}
   */
  getLatestByCitizen(citizenId) {
    WK.security().checkPermission('referral.record.read.all');
    return this.repository.getLatestByCitizen(citizenId);
  }

  /**
   * Searches for referral records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Referral[]}
   */
  search(query, options) {
    WK.security().checkPermission('referral.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all referral records.
   * @param {object} options - List options.
   * @returns {Referral[]}
   */
  list(options) {
    WK.security().checkPermission('referral.record.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts referral records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  count(query) {
    WK.security().checkPermission('referral.record.read.all');
    return this.repository.count(query);
  }

  /**
   * Accepts a pending referral.
   * @param {string} id - The ID of the referral.
   * @param {string} receivingProviderId - The ID of the provider accepting the referral.
   * @param {string} receivingProviderType - The type of the provider.
   * @returns {Referral} The updated referral record.
   */
  acceptReferral(id, receivingProviderId, receivingProviderType) {
    WK.security().checkPermission('referral.record.accept');
    const existingRecord = this.getReferral(id);
    this.rule.checkStatusTransition(existingRecord.referralStatus, 'ACCEPTED');
    this.rule.checkProvider(receivingProviderId);

    const updatedRecord = this.updateReferral(id, {
      referralStatus: 'ACCEPTED',
      receivingProviderId,
      receivingProviderType,
    });

    this.eventBus.publish('ReferralAccepted', {
      source: 'ReferralService',
      payload: updatedRecord,
    });
    this.notificationService.sendToRole('ReferringProvider', {
      channel: 'SYSTEM',
      type: 'INFO',
      title: 'Referral Accepted',
      body: `Referral ${updatedRecord.referralNumber} for citizen ${updatedRecord.citizenId} has been accepted.`,
    });

    return updatedRecord;
  }

  /**
   * Rejects a pending referral.
   * @param {string} id - The ID of the referral.
   * @param {string} rejectionReason - The reason for rejection.
   * @returns {Referral} The updated referral record.
   */
  rejectReferral(id, rejectionReason) {
    WK.security().checkPermission('referral.record.reject');
    const existingRecord = this.getReferral(id);
    this.rule.checkStatusTransition(existingRecord.referralStatus, 'REJECTED');

    const updatedNotes = [...existingRecord.notes, { note: `Rejected: ${rejectionReason}`, authorId: WK.user().id, createdAt: new Date().toISOString() }];
    const updatedRecord = this.updateReferral(id, {
      referralStatus: 'REJECTED',
      notes: updatedNotes,
    });

    this.eventBus.publish('ReferralRejected', {
      source: 'ReferralService',
      payload: updatedRecord,
    });
    this.notificationService.sendToRole('ReferringProvider', {
      channel: 'SYSTEM',
      type: 'WARNING',
      title: 'Referral Rejected',
      body: `Referral ${updatedRecord.referralNumber} for citizen ${updatedRecord.citizenId} was rejected. Reason: ${rejectionReason}`,
    });

    return updatedRecord;
  }

  /**
   * Cancels an active referral.
   * @param {string} id - The ID of the referral.
   * @param {string} cancellationReason - The reason for cancellation.
   * @returns {Referral} The updated referral record.
   */
  cancelReferral(id, cancellationReason) {
    WK.security().checkPermission('referral.record.cancel');
    const existingRecord = this.getReferral(id);
    this.rule.checkStatusTransition(existingRecord.referralStatus, 'CANCELLED');

    const updatedNotes = [...existingRecord.notes, { note: `Cancelled: ${cancellationReason}`, authorId: WK.user().id, createdAt: new Date().toISOString() }];
    const updatedRecord = this.updateReferral(id, {
      referralStatus: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelledBy: WK.user().id,
      notes: updatedNotes,
    });

    this.eventBus.publish('ReferralCancelled', {
      source: 'ReferralService',
      payload: updatedRecord,
    });
    this.notificationService.sendToRole('ReceivingProvider', {
      channel: 'SYSTEM',
      type: 'INFO',
      title: 'Referral Cancelled',
      body: `Referral ${updatedRecord.referralNumber} for citizen ${updatedRecord.citizenId} has been cancelled.`,
    });

    return updatedRecord;
  }

  /**
   * Completes an in-progress referral.
   * @param {string} id - The ID of the referral.
   * @param {string} completionNotes - Notes regarding the completion.
   * @returns {Referral} The updated referral record.
   */
  completeReferral(id, completionNotes) {
    WK.security().checkPermission('referral.record.complete');
    const existingRecord = this.getReferral(id);
    this.rule.checkStatusTransition(existingRecord.referralStatus, 'COMPLETED');

    const updatedNotes = [...existingRecord.notes, { note: `Completed: ${completionNotes}`, authorId: WK.user().id, createdAt: new Date().toISOString() }];
    const updatedRecord = this.updateReferral(id, {
      referralStatus: 'COMPLETED',
      completedAt: new Date().toISOString(),
      completedBy: WK.user().id,
      notes: updatedNotes,
    });

    this.eventBus.publish('ReferralCompleted', {
      source: 'ReferralService',
      payload: updatedRecord,
    });
    this.workflowService.start('REFERRAL_FOLLOW_UP_CHECK', { referralId: id });

    return updatedRecord;
  }

  /**
   * Schedules a follow-up for a referral.
   * @param {string} id - The ID of the referral.
   * @param {string} followUpDate - The date of the follow-up.
   * @param {string} [followUpNotes] - Optional notes for the follow-up.
   * @returns {Referral} The updated referral record.
   */
  scheduleFollowUp(id, followUpDate, followUpNotes = null) {
    WK.security().checkPermission('referral.record.schedule_followup');
    const existingRecord = this.getReferral(id);
    this.rule.checkDates({ referralDate: existingRecord.referralDate, followUpDate }); // Validate new followUpDate

    const updatedRecord = this.updateReferral(id, {
      followUpDate,
      followUpNotes,
      followUpStatus: 'SCHEDULED',
    });

    this.eventBus.publish('ReferralFollowUpScheduled', {
      source: 'ReferralService',
      payload: updatedRecord,
    });

    this.notificationService.schedule({
      recipientId: existingRecord.citizenId,
      channel: 'SMS',
      sendAt: new Date(followUpDate).toISOString(),
      template: 'REFERRAL_FOLLOWUP_REMINDER',
      data: {
        referralNumber: updatedRecord.referralNumber,
        followUpDate: followUpDate,
        notes: followUpNotes,
      },
    });

    return updatedRecord;
  }

  /**
   * Updates the follow-up details for a referral.
   * @param {string} id - The ID of the referral.
   * @param {object} payload - The follow-up update data (followUpDate, followUpStatus, followUpNotes).
   * @returns {Referral} The updated referral record.
   */
  updateFollowUp(id, payload) {
    WK.security().checkPermission('referral.record.schedule_followup'); // Reusing for update
    const existingRecord = this.getReferral(id);
    this.rule.checkDates({ referralDate: existingRecord.referralDate, ...payload }); // Validate dates

    const updatedRecord = this.updateReferral(id, payload);

    this.eventBus.publish('ReferralFollowUpUpdated', {
      source: 'ReferralService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Updates the destination of a referral.
   * @param {string} id - The ID of the referral.
   * @param {string} destinationType - The new destination type.
   * @param {string} destinationId - The new destination ID.
   * @param {string} [destinationReference] - Optional reference for the destination.
   * @returns {Referral} The updated referral record.
   */
  updateDestination(id, destinationType, destinationId, destinationReference = null) {
    WK.security().checkPermission('referral.record.update.all');
    const existingRecord = this.getReferral(id);
    // Rule to check if status permits destination change
    if (['COMPLETED', 'CANCELLED', 'REJECTED'].includes(existingRecord.referralStatus)) {
      throw new Error('Cannot change destination for a completed, cancelled, or rejected referral.');
    }
    this.rule.checkDestination(destinationType, destinationId);

    return this.updateReferral(id, { destinationType, destinationId, destinationReference });
  }

  /**
   * Updates provider information for a referral.
   * @param {string} id - The ID of the referral.
   * @param {string} referringProviderId - The ID of the referring provider.
   * @param {string} referringProviderType - The type of the referring provider.
   * @param {string|null} [receivingProviderId] - The ID of the receiving provider.
   * @param {string|null} [receivingProviderType] - The type of the receiving provider.
   * @returns {Referral} The updated referral record.
   */
  updateProvider(id, referringProviderId, referringProviderType, receivingProviderId = null, receivingProviderType = null) {
    WK.security().checkPermission('referral.record.update.all');
    this.rule.checkProvider(referringProviderId);
    if (receivingProviderId) {
      this.rule.checkProvider(receivingProviderId);
    }
    return this.updateReferral(id, { referringProviderId, referringProviderType, receivingProviderId, receivingProviderType });
  }

  /**
   * Adds a new note to the referral.
   * @param {string} id - The ID of the referral.
   * @param {string} noteContent - The content of the new note.
   * @returns {Referral} The updated referral record.
   */
  updateNotes(id, noteContent) {
    WK.security().checkPermission('referral.record.view.sensitive_notes'); // Assuming this permission covers adding notes
    const record = this.getReferral(id);
    const newNote = {
      note: noteContent,
      authorId: WK.user().id,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...record.notes, newNote];
    return this.updateReferral(id, { notes: updatedNotes });
  }

  /**
   * Updates the generic status of a referral. Use specific methods (accept, reject, cancel, complete) for workflow-driven changes.
   * @param {string} id - The ID of the referral.
   * @param {string} newStatus - The new status.
   * @returns {Referral} The updated referral record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('referral.record.change.status');
    const existingRecord = this.getReferral(id);
    this.rule.checkStatusTransition(existingRecord.referralStatus, newStatus);

    const updatedRecord = this.updateReferral(id, { referralStatus: newStatus });

    this.eventBus.publish('ReferralStatusChanged', {
      source: 'ReferralService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Retrieves a list of pending referrals.
   * @param {object} [filters={}] - Additional query filters.
   * @param {object} [options={}] - Pagination and sorting options.
   * @returns {Referral[]}
   */
  getPending(filters = {}, options = {}) {
    WK.security().checkPermission('referral.record.read.all');
    const query = { ...filters, referralStatus: 'PENDING' };
    return this.repository.search(query, options);
  }

  /**
   * Retrieves a list of active referrals (ACCEPTED or IN_PROGRESS).
   * @param {object} [filters={}] - Additional query filters.
   * @param {object} [options={}] - Pagination and sorting options.
   * @returns {Referral[]}
   */
  getActive(filters = {}, options = {}) {
    WK.security().checkPermission('referral.record.read.all');
    const query = { ...filters, referralStatus: { in: ['ACCEPTED', 'IN_PROGRESS'] } };
    return this.repository.search(query, options);
  }

  /**
   * Retrieves a list of completed referrals.
   * @param {object} [filters={}] - Additional query filters.
   * @param {object} [options={}] - Pagination and sorting options.
   * @returns {Referral[]}
   */
  getCompleted(filters = {}, options = {}) {
    WK.security().checkPermission('referral.record.read.all');
    const query = { ...filters, referralStatus: 'COMPLETED' };
    return this.repository.search(query, options);
  }

  /**
   * Retrieves recently created or updated referral records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {Referral[]} An array of referral entities.
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('referral.dashboard.view');
    return this.repository.list({
      ...filters,
      limit: limit,
      sortBy: 'updatedAt',
      order: 'desc',
    });
  }
}