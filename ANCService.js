/**
 * @class ANCService
 * @description The main service for managing Antenatal Care (ANC) records.
 */
class ANCService {
  /**
   * @param {ANCRepository} ancRepository
   * @param {ANCValidator} ancValidator
   * @param {ANCRule} ancRule
   * @param {EventBus} eventBus
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(ancRepository, ancValidator, ancRule, eventBus, notificationService, workflowService) {
    /** @private */
    this.repository = ancRepository;
    /** @private */
    this.validator = ancValidator;
    /** @private */
    this.rule = ancRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('ANCService');
  }

  /**
   * Creates a new ANC record for a pregnancy.
   * @param {object} payload - The data for the new ANC record.
   * @returns {ANCRecord} The newly created record.
   */
  createANC(payload) {
    WK.security().checkPermission('anc.record.create');
    this.logger.info(`Attempting to create ANC record for pregnancy: ${payload.pregnancyId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const ancEntity = new ANCRecord(entityData);
    const createdANC = this.repository.create(ancEntity);

    this.eventBus.publish('ANCCreated', {
      source: 'ANCService',
      payload: createdANC,
    });

    this.logger.info(`Successfully created ANC record ${createdANC.id} for pregnancy ${createdANC.pregnancyId}`);
    return createdANC;
  }

  /**
   * Updates an existing ANC record.
   * @param {string} id - The ID of the ANC record to update.
   * @param {object} payload - The update data.
   * @returns {ANCRecord} The updated record.
   */
  updateANC(id, payload) {
    WK.security().checkPermission('anc.record.update.all');
    this.logger.info(`Attempting to update ANC record: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingANC = this.repository.findById(id);
    if (!existingANC) {
      throw new Error(`ANC record with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedANC = this.repository.update(id, updateData);

    this.eventBus.publish('ANCUpdated', {
      source: 'ANCService',
      payload: { old: existingANC, new: updatedANC },
    });

    this.logger.info(`Successfully updated ANC record: ${id}`);
    return updatedANC;
  }

  /**
   * Deletes an ANC record.
   * @param {string} id - The ID of the record to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteANC(id) {
    WK.security().checkPermission('anc.record.delete');
    this.logger.warn(`Attempting to delete ANC record: ${id}`);

    const existingANC = this.repository.findById(id);
    if (!existingANC) {
      throw new Error(`ANC record with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('ANCDeleted', {
        source: 'ANCService',
        payload: existingANC,
      });
      this.logger.info(`Successfully deleted ANC record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single ANC record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {ANCRecord}
   */
  getANC(id) {
    WK.security().checkPermission('anc.record.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`ANC record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves all ANC records for a given pregnancy.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @returns {ANCRecord[]}
   */
  getANCHistory(pregnancyId) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.findByPregnancy(pregnancyId, { sortBy: 'visitNumber', order: 'asc' });
  }

  /**
   * Retrieves the latest ANC record for a given pregnancy.
   * @param {string} pregnancyId - The ID of the pregnancy.
   * @returns {ANCRecord|null}
   */
  getLatestANC(pregnancyId) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.findLatestByPregnancy(pregnancyId);
  }

  /**
   * Searches for ANC records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {ANCRecord[]}
   */
  searchANC(query, options) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all ANC records.
   * @param {object} options - List options.
   * @returns {ANCRecord[]}
   */
  listANC(options) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts ANC records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countANC(query) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.count(query);
  }

  /**
   * Updates the risk status for an ANC record.
   * @param {string} id - The ID of the ANC record.
   * @param {string} newStatus - The new risk status.
   * @returns {ANCRecord} The updated record.
   */
  updateRiskStatus(id, newStatus) {
    WK.security().checkPermission('anc.record.change.risk_status');
    const updatedANC = this.updateANC(id, { riskStatus: newStatus });

    this.eventBus.publish('ANCRiskChanged', {
      source: 'ANCService',
      payload: updatedANC,
    });

    if (newStatus === 'HIGH_RISK') {
      this.notificationService.sendToRole('HealthOfficer', {
        channel: 'SYSTEM',
        type: 'ALERT',
        title: 'High Risk ANC Visit',
        body: `ANC visit for pregnancy ${updatedANC.pregnancyId} has been marked as high risk.`,
      });
    }

    return updatedANC;
  }

  /**
   * Updates the follow-up status for an ANC record.
   * @param {string} id - The ID of the ANC record.
   * @param {boolean} isRequired - Whether follow-up is required.
   * @returns {ANCRecord} The updated record.
   */
  updateFollowUpStatus(id, isRequired) {
    WK.security().checkPermission('anc.record.update.all');
    const updatedANC = this.updateANC(id, { followUpRequired: isRequired });

    if (isRequired) {
      this.eventBus.publish('ANCFollowUpRequired', {
        source: 'ANCService',
        payload: updatedANC,
      });
      this.workflowService.start('ANC_FOLLOW_UP', { ancId: id });
    }

    return updatedANC;
  }

  /**
   * Updates the referral status for an ANC record.
   * @param {string} id - The ID of the ANC record.
   * @param {boolean} isRequired - Whether referral is required.
   * @returns {ANCRecord} The updated record.
   */
  updateReferralStatus(id, isRequired) {
    WK.security().checkPermission('anc.record.update.all');
    const updatedANC = this.updateANC(id, { referralRequired: isRequired });

    if (isRequired) {
      this.eventBus.publish('ANCReferralRequired', {
        source: 'ANCService',
        payload: updatedANC,
      });
      // This only flags the need; the actual referral is handled by the Referral package.
    }

    return updatedANC;
  }

  /**
   * Updates the next visit date for an ANC record.
   * @param {string} id - The ID of the ANC record.
   * @param {string|null} nextDate - The date of the next visit.
   * @returns {ANCRecord} The updated record.
   */
  updateNextVisit(id, nextDate) {
    WK.security().checkPermission('anc.record.update.all');
    const updatedANC = this.updateANC(id, { nextVisitDate: nextDate });

    if (nextDate) {
      this.notificationService.schedule({
        recipientId: updatedANC.citizenId,
        channel: 'SMS',
        sendAt: new Date(nextDate).toISOString(),
        template: 'ANC_VISIT_REMINDER',
        data: {
          visitDate: nextDate,
        },
      });
    }

    return updatedANC;
  }

  /**
   * Retrieves a list of ANC records that require follow-up.
   * @param {object} filters - Additional query filters.
   * @param {object} options - Pagination and sorting options.
   * @returns {ANCRecord[]}
   */
  getFollowUpQueue(filters = {}, options = {}) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.findFollowUpRequired(filters, options);
  }

  /**
   * Retrieves a list of ANC records that require referral.
   * @param {object} filters - Additional query filters.
   * @param {object} options - Pagination and sorting options.
   * @returns {ANCRecord[]}
   */
  getReferralQueue(filters = {}, options = {}) {
    WK.security().checkPermission('anc.record.read.all');
    return this.repository.findReferralRequired(filters, options);
  }

  /**
   * Retrieves a list of ANC records with a specific risk status.
   * @param {string} riskStatus - The risk status to filter by.
   * @param {object} filters - Additional query filters.
   * @param {object} options - Pagination and sorting options.
   * @returns {ANCRecord[]}
   */
  getRiskMonitoringQueue(riskStatus, filters = {}, options = {}) {
    WK.security().checkPermission('anc.record.read.all');
    const query = { ...filters, riskStatus };
    return this.repository.search(query, options);
  }

  /**
   * Retrieves recently created ANC records.
   * @param {object} filters - Additional query filters.
   * @param {number} limit - The number of records to return.
   * @returns {ANCRecord[]}
   */
  getRecentVisits(filters = {}, limit = 5) {
    WK.security().checkPermission('anc.record.read.all');
    const options = { ...filters, limit, sortBy: 'visitDate', order: 'desc' };
    return this.repository.list(options);
  }
}