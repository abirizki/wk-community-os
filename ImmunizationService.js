/**
 * @class ImmunizationService
 * @description The main service for managing citizen immunization records.
 */
class ImmunizationService {
  /**
   * @param {ImmunizationRepository} immunizationRepository
   * @param {ImmunizationValidator} immunizationValidator
   * @param {ImmunizationRule} immunizationRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(immunizationRepository, immunizationValidator, immunizationRule, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = immunizationRepository;
    /** @private */
    this.validator = immunizationValidator;
    /** @private */
    this.rule = immunizationRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('ImmunizationService');
  }

  /**
   * Creates a new immunization record.
   * @param {object} payload - The data for the new record.
   * @returns {ImmunizationRecord} The newly created record.
   */
  createImmunization(payload) {
    WK.security().checkPermission('immunization.record.create');
    this.logger.info(`Attempting to create immunization record for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const immunizationEntity = new ImmunizationRecord(entityData);
    const createdRecord = this.repository.create(immunizationEntity);

    this.eventBus.publish('ImmunizationCreated', {
      source: 'ImmunizationService',
      payload: createdRecord,
    });

    this.analyticsService.track('immunization_created', { citizenId: createdRecord.citizenId, vaccineId: createdRecord.vaccineId });
    this.logger.info(`Successfully created immunization record ${createdRecord.id} for citizen ${createdRecord.citizenId}`);

    return createdRecord;
  }

  /**
   * Updates an existing immunization record.
   * @param {string} id - The ID of the record to update.
   * @param {object} payload - The update data.
   * @returns {ImmunizationRecord} The updated record.
   */
  updateImmunization(id, payload) {
    WK.security().checkPermission('immunization.record.update.all');
    this.logger.info(`Attempting to update immunization record: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Immunization record with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('ImmunizationUpdated', {
      source: 'ImmunizationService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated immunization record: ${id}`);
    return updatedRecord;
  }

  /**
   * Deletes an immunization record.
   * @param {string} id - The ID of the record to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteImmunization(id) {
    WK.security().checkPermission('immunization.record.delete');
    this.logger.warn(`Attempting to delete immunization record: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Immunization record with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('ImmunizationDeleted', {
        source: 'ImmunizationService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deleted immunization record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single immunization record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {ImmunizationRecord}
   */
  getImmunization(id) {
    WK.security().checkPermission('immunization.record.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Immunization record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves the full immunization history for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {ImmunizationRecord[]}
   */
  getHistory(citizenId) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.findByCitizen(citizenId, { sortBy: 'administrationDate', order: 'asc' });
  }

  /**
   * Retrieves the latest immunization record for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {ImmunizationRecord|null}
   */
  getLatestByCitizen(citizenId) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.findLatestByCitizen(citizenId);
  }

  /**
   * Searches for immunization records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {ImmunizationRecord[]}
   */
  search(query, options) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all immunization records.
   * @param {object} options - List options.
   * @returns {ImmunizationRecord[]}
   */
  list(options) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts immunization records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  count(query) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.count(query);
  }

  /**
   * Records the administration of a scheduled immunization.
   * @param {string} id - The ID of the immunization record.
   * @param {object} adminPayload - The administration data (e.g., date, time, provider, batch).
   * @returns {ImmunizationRecord} The updated record.
   */
  recordAdministration(id, adminPayload) {
    WK.security().checkPermission('immunization.record.update.all');
    if (!adminPayload.administrationDate) {
      throw new Error('Administration date is required to record an administration.');
    }

    const payload = {
      ...adminPayload,
      administrationStatus: 'ADMINISTERED',
    };

    const updatedRecord = this.updateImmunization(id, payload);

    this.eventBus.publish('ImmunizationAdministered', {
      source: 'ImmunizationService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Updates the administration status of a record.
   * @param {string} id - The ID of the immunization record.
   * @param {string} newStatus - The new administration status.
   * @returns {ImmunizationRecord} The updated record.
   */
  updateAdministrationStatus(id, newStatus) {
    WK.security().checkPermission('immunization.record.change.status');
    this.rule.checkAdministrationStatus(newStatus);

    const updatedRecord = this.updateImmunization(id, { administrationStatus: newStatus });

    this.eventBus.publish('ImmunizationStatusChanged', {
      source: 'ImmunizationService',
      payload: updatedRecord,
    });

    if (newStatus === 'MISSED') {
      this.workflowService.start('MISSED_IMMUNIZATION_FOLLOW_UP', { immunizationRecordId: id });
    }

    return updatedRecord;
  }

  /**
   * Updates the next dose date for an immunization record.
   * @param {string} id - The ID of the immunization record.
   * @param {string|null} nextDate - The date of the next scheduled dose.
   * @returns {ImmunizationRecord} The updated record.
   */
  updateNextDose(id, nextDate) {
    WK.security().checkPermission('immunization.record.update.all');
    const updatedRecord = this.updateImmunization(id, { nextDoseDate: nextDate });

    this.eventBus.publish('ImmunizationNextDoseScheduled', {
      source: 'ImmunizationService',
      payload: updatedRecord,
    });

    if (nextDate) {
      this.notificationService.schedule({
        recipientId: updatedRecord.citizenId,
        channel: 'SMS',
        sendAt: new Date(nextDate).toISOString(),
        template: 'IMMUNIZATION_DOSE_REMINDER',
        data: {
          vaccineName: updatedRecord.vaccineName,
          doseNumber: updatedRecord.doseNumber + 1,
          nextDoseDate: nextDate,
        },
      });
    }

    return updatedRecord;
  }

  /**
   * Retrieves a list of immunization records with upcoming next dose dates.
   * @param {string} startDate - The start of the date range.
   * @param {string} endDate - The end of the date range.
   * @param {object} options - Pagination and sorting options.
   * @returns {ImmunizationRecord[]}
   */
  getUpcomingQueue(startDate, endDate, options = {}) {
    WK.security().checkPermission('immunization.record.read.all');
    return this.repository.findUpcoming(startDate, endDate, options);
  }

  /**
   * Retrieves a list of immunization records with a 'MISSED' status.
   * @param {object} filters - Additional query filters.
   * @param {object} options - Pagination and sorting options.
   * @returns {ImmunizationRecord[]}
   */
  getMissedQueue(filters = {}, options = {}) {
    WK.security().checkPermission('immunization.record.read.all');
    const query = { ...filters, administrationStatus: 'MISSED' };
    return this.repository.search(query, options);
  }

  /**
   * Retrieves recently administered immunization records.
   * @param {object} filters - Additional query filters.
   * @param {number} limit - The number of records to return.
   * @returns {ImmunizationRecord[]}
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('immunization.record.read.all');
    const query = { ...filters, administrationStatus: 'ADMINISTERED' };
    const options = { limit, sortBy: 'administrationDate', order: 'desc' };
    return this.repository.search(query, options);
  }
}