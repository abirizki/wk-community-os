/**
 * @class PosyanduService
 * @description The main service for managing Posyandu visit records.
 */
class PosyanduService {
  /**
   * @param {PosyanduRepository} posyanduRepository
   * @param {PosyanduValidator} posyanduValidator
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   */
  constructor(posyanduRepository, posyanduValidator, eventBus, analyticsService, notificationService) {
    /** @private */
    this.repository = posyanduRepository;
    /** @private */
    this.validator = posyanduValidator;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.logger = WK.logger('PosyanduService');
  }

  /**
   * Creates a new Posyandu visit record.
   * @param {object} payload - The data for the new visit.
   * @returns {PosyanduVisit} The newly created visit entity.
   */
  createVisit(payload) {
    WK.security().checkPermission('posyandu.visit.create');
    this.logger.info(`Attempting to create Posyandu visit for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const visitEntity = new PosyanduVisit(entityData);
    const createdVisit = this.repository.create(visitEntity);

    this.eventBus.publish('PosyanduVisitCreated', {
      source: 'PosyanduService',
      payload: createdVisit,
    });

    this.analyticsService.track('posyandu_visit_created', { citizenId: createdVisit.citizenId, location: createdVisit.posyanduLocation });
    this.logger.info(`Successfully created Posyandu visit ${createdVisit.id} for citizen ${createdVisit.citizenId}`);

    return createdVisit;
  }

  /**
   * Updates an existing Posyandu visit record.
   * @param {string} id - The ID of the visit to update.
   * @param {object} payload - The update data.
   * @returns {PosyanduVisit} The updated visit entity.
   */
  updateVisit(id, payload) {
    WK.security().checkPermission('posyandu.visit.update.all');
    this.logger.info(`Attempting to update Posyandu visit: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingVisit = this.repository.findById(id);
    if (!existingVisit) {
      throw new Error(`Posyandu visit with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedVisit = this.repository.update(id, updateData);

    this.eventBus.publish('PosyanduVisitUpdated', {
      source: 'PosyanduService',
      payload: { old: existingVisit, new: updatedVisit },
    });

    this.logger.info(`Successfully updated Posyandu visit: ${id}`);
    return updatedVisit;
  }

  /**
   * Deletes a Posyandu visit record.
   * @param {string} id - The ID of the visit to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteVisit(id) {
    WK.security().checkPermission('posyandu.visit.delete');
    this.logger.warn(`Attempting to delete Posyandu visit: ${id}`);

    const existingVisit = this.repository.findById(id);
    if (!existingVisit) {
      throw new Error(`Posyandu visit with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('PosyanduVisitDeleted', {
        source: 'PosyanduService',
        payload: existingVisit,
      });
      this.analyticsService.track('posyandu_visit_deleted', { citizenId: existingVisit.citizenId });
      this.logger.info(`Successfully deleted Posyandu visit: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single Posyandu visit by its ID.
   * @param {string} id - The ID of the visit.
   * @returns {PosyanduVisit}
   */
  getVisit(id) {
    WK.security().checkPermission('posyandu.visit.read.all');
    const visit = this.repository.findById(id);
    if (!visit) {
      throw new Error(`Posyandu visit with ID ${id} not found.`);
    }
    return visit;
  }

  /**
   * Retrieves all visits for a specific citizen, sorted by most recent.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {PosyanduVisit[]}
   */
  getVisitHistory(citizenId) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.findByCitizen(citizenId, { sortBy: 'visitDate', order: 'desc' });
  }

  /**
   * Retrieves visits by date.
   * @param {string} date - The date in YYYY-MM-DD format.
   * @param {object} options - Listing options.
   * @returns {PosyanduVisit[]}
   */
  getVisitsByDate(date, options) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.findByDate(date, options);
  }

  /**
   * Retrieves visits by RT.
   * @param {string} rt - The RT number.
   * @param {object} options - Listing options.
   * @returns {PosyanduVisit[]}
   */
  getVisitsByRT(rt, options) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.findByRT(rt, options);
  }

  /**
   * Retrieves visits by RW.
   * @param {string} rw - The RW number.
   * @param {object} options - Listing options.
   * @returns {PosyanduVisit[]}
   */
  getVisitsByRW(rw, options) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.findByRW(rw, options);
  }

  /**
   * Searches for Posyandu visits.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {PosyanduVisit[]}
   */
  searchVisits(query, options) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all Posyandu visits.
   * @param {object} options - List options.
   * @returns {PosyanduVisit[]}
   */
  listVisits(options) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts Posyandu visits.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countVisits(query) {
    WK.security().checkPermission('posyandu.visit.read.all');
    return this.repository.count(query);
  }

  /**
   * Records a specific measurement for a visit.
   * @param {string} visitId - The ID of the visit.
   * @param {object} measurementPayload - The measurement data (e.g., { weight: 5.5, height: 60 }).
   * @returns {PosyanduVisit} The updated visit.
   */
  recordMeasurement(visitId, measurementPayload) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const updatedVisit = this.updateVisit(visitId, measurementPayload);
    this.eventBus.publish('PosyanduMeasurementRecorded', { source: 'PosyanduService', payload: updatedVisit });
    return updatedVisit;
  }

  /**
   * Updates the nutrition status for a visit.
   * @param {string} visitId - The ID of the visit.
   * @param {string} newStatus - The new nutrition status.
   * @returns {PosyanduVisit} The updated visit.
   */
  updateNutritionStatus(visitId, newStatus) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const updatedVisit = this.updateVisit(visitId, { nutritionStatus: newStatus });
    this.eventBus.publish('PosyanduNutritionUpdated', { source: 'PosyanduService', payload: updatedVisit });
    return updatedVisit;
  }

  /**
   * Updates the development status for a visit.
   * @param {string} visitId - The ID of the visit.
   * @param {string} newStatus - The new development status.
   * @returns {PosyanduVisit} The updated visit.
   */
  updateDevelopmentStatus(visitId, newStatus) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const updatedVisit = this.updateVisit(visitId, { developmentStatus: newStatus });
    this.eventBus.publish('PosyanduDevelopmentUpdated', { source: 'PosyanduService', payload: updatedVisit });
    return updatedVisit;
  }

  /**
   * Records that a vitamin was given during a visit.
   * @param {string} visitId - The ID of the visit.
   * @param {string} vitaminName - The name of the vitamin (e.g., 'Vitamin A').
   * @returns {PosyanduVisit} The updated visit.
   */
  recordVitamin(visitId, vitaminName) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const visit = this.getVisit(visitId);
    if (visit.vitaminGiven.includes(vitaminName)) {
      return visit; // Idempotent
    }
    const newVitamins = [...visit.vitaminGiven, vitaminName];
    const updatedVisit = this.updateVisit(visitId, { vitaminGiven: newVitamins });
    this.eventBus.publish('PosyanduVitaminRecorded', { source: 'PosyanduService', payload: updatedVisit });
    return updatedVisit;
  }

  /**
   * Updates the overall immunization status for a visit.
   * @param {string} visitId - The ID of the visit.
   * @param {string} newStatus - The new immunization status (e.g., 'COMPLETE', 'INCOMPLETE').
   * @returns {PosyanduVisit} The updated visit.
   */
  recordImmunizationStatus(visitId, newStatus) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const updatedVisit = this.updateVisit(visitId, { immunizationStatus: newStatus });
    this.eventBus.publish('PosyanduImmunizationUpdated', { source: 'PosyanduService', payload: updatedVisit });
    return updatedVisit;
  }

  /**
   * Schedules the next visit and sends a notification.
   * @param {string} visitId - The ID of the current visit.
   * @param {string} nextDate - The date of the next visit in YYYY-MM-DD format.
   * @returns {PosyanduVisit} The updated visit.
   */
  scheduleNextVisit(visitId, nextDate) {
    WK.security().checkPermission('posyandu.visit.update.all');
    const updatedVisit = this.updateVisit(visitId, { nextVisitDate: nextDate });

    this.eventBus.publish('PosyanduNextVisitScheduled', { source: 'PosyanduService', payload: updatedVisit });

    // Trigger a scheduled notification
    this.notificationService.schedule({
      recipientId: updatedVisit.citizenId,
      channel: 'SMS',
      sendAt: new Date(nextDate).toISOString(),
      template: 'NEXT_VISIT_REMINDER',
      data: {
        visitDate: nextDate,
        location: updatedVisit.posyanduLocation,
      },
    });

    return updatedVisit;
  }
}