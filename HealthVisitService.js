/**
 * @class HealthVisitService
 * @description The main service for managing citizen health visit/encounter records.
 */
class HealthVisitService {
  /**
   * @param {HealthVisitRepository} healthVisitRepository
   * @param {HealthVisitValidator} healthVisitValidator
   * @param {HealthVisitRule} healthVisitRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(healthVisitRepository, healthVisitValidator, healthVisitRule, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = healthVisitRepository;
    /** @private */
    this.validator = healthVisitValidator;
    /** @private */
    this.rule = healthVisitRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('HealthVisitService');
  }

  /**
   * Creates a new health visit record.
   * @param {object} payload - The data for the new record.
   * @returns {HealthVisit} The newly created record.
   */
  createHealthVisit(payload) {
    WK.security().checkPermission('health.visit.create');
    this.logger.info(`Attempting to create health visit for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const healthVisitEntity = new HealthVisit(entityData);
    const createdRecord = this.repository.create(healthVisitEntity);

    this.eventBus.publish('HealthVisitCreated', {
      source: 'HealthVisitService',
      payload: createdRecord,
    });

    this.analyticsService.track('health_visit_created', { citizenId: createdRecord.citizenId, visitType: createdRecord.visitType });
    this.logger.info(`Successfully created health visit ${createdRecord.id} for citizen ${createdRecord.citizenId}`);

    return createdRecord;
  }

  /**
   * Updates an existing health visit record.
   * @param {string} id - The ID of the record to update.
   * @param {object} payload - The update data.
   * @returns {HealthVisit} The updated record.
   */
  updateHealthVisit(id, payload) {
    WK.security().checkPermission('health.visit.update.all');
    this.logger.info(`Attempting to update health visit record: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Health visit record with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('HealthVisitUpdated', {
      source: 'HealthVisitService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated health visit record: ${id}`);
    return updatedRecord;
  }

  /**
   * Deletes a health visit record.
   * @param {string} id - The ID of the record to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteHealthVisit(id) {
    WK.security().checkPermission('health.visit.delete');
    this.logger.warn(`Attempting to delete health visit record: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Health visit record with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('HealthVisitDeleted', {
        source: 'HealthVisitService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deleted health visit record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single health visit record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {HealthVisit}
   */
  getHealthVisit(id) {
    WK.security().checkPermission('health.visit.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Health visit record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves the health visit history for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {HealthVisit[]}
   */
  getHistory(citizenId) {
    WK.security().checkPermission('health.visit.read.all');
    return this.repository.findByCitizenId(citizenId, { sortBy: 'visitDate', order: 'desc' });
  }

  /**
   * Searches for health visit records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {HealthVisit[]}
   */
  search(query, options) {
    WK.security().checkPermission('health.visit.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all health visit records.
   * @param {object} options - List options.
   * @returns {HealthVisit[]}
   */
  list(options) {
    WK.security().checkPermission('health.visit.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts health visit records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  count(query) {
    WK.security().checkPermission('health.visit.read.all');
    return this.repository.count(query);
  }

  /**
   * Updates the status of a health visit.
   * @param {string} id - The ID of the health visit.
   * @param {string} newStatus - The new status.
   * @returns {HealthVisit} The updated record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('health.visit.change.status');
    const existingRecord = this.getHealthVisit(id);
    this.rule.checkStatusTransition(existingRecord.visitStatus, newStatus);

    const updatedRecord = this.updateHealthVisit(id, { visitStatus: newStatus });

    this.eventBus.publish('HealthVisitStatusChanged', {
      source: 'HealthVisitService',
      payload: updatedRecord,
    });

    if (newStatus === 'CANCELLED' || newStatus === 'NO_SHOW') {
      this.workflowService.start('MISSED_HEALTH_VISIT_FOLLOW_UP', { healthVisitId: id });
    }

    return updatedRecord;
  }

  /**
   * Adds a new note to the health visit.
   * @param {string} id - The ID of the health visit.
   * @param {string} noteContent - The content of the new note.
   * @returns {HealthVisit} The updated record.
   */
  addNote(id, noteContent) {
    WK.security().checkPermission('health.visit.view.sensitive_notes'); // Assuming this permission covers adding notes
    const record = this.getHealthVisit(id);
    const newNote = {
      note: noteContent,
      authorId: WK.user().id,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...record.notes, newNote];
    return this.updateHealthVisit(id, { notes: updatedNotes });
  }

  /**
   * Retrieves recently created or updated health visit records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {HealthVisit[]} An array of health visit entities.
   */
  getRecentVisits(filters = {}, limit = 5) {
    WK.security().checkPermission('healthvisit.dashboard.view');
    return this.repository.list({
      ...filters,
      limit: limit,
      sortBy: 'updatedAt',
      order: 'desc',
    });
  }
}