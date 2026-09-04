/**
 * @class PregnancyService
 * @description The main service for managing pregnancy episodes.
 */
class PregnancyService {
  /**
   * @param {PregnancyRepository} pregnancyRepository
   * @param {PregnancyValidator} pregnancyValidator
   * @param {PregnancyRule} pregnancyRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(pregnancyRepository, pregnancyValidator, pregnancyRule, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = pregnancyRepository;
    /** @private */
    this.validator = pregnancyValidator;
    /** @private */
    this.rule = pregnancyRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('PregnancyService');
  }

  /**
   * Creates a new pregnancy record.
   * @param {object} payload - The data for the new pregnancy.
   * @returns {Pregnancy} The newly created pregnancy record.
   */
  createPregnancy(payload) {
    WK.security().checkPermission('pregnancy.episode.create');
    this.logger.info(`Attempting to create pregnancy for mother: ${payload.motherId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const pregnancyEntity = new Pregnancy(entityData);
    const createdPregnancy = this.repository.create(pregnancyEntity);

    this.eventBus.publish('PregnancyCreated', {
      source: 'PregnancyService',
      payload: createdPregnancy,
    });

    this.analyticsService.track('pregnancy_created', { motherId: createdPregnancy.motherId });
    this.logger.info(`Successfully created pregnancy ${createdPregnancy.id} for mother ${createdPregnancy.motherId}`);

    return createdPregnancy;
  }

  /**
   * Updates an existing pregnancy record.
   * @param {string} id - The ID of the pregnancy to update.
   * @param {object} payload - The update data.
   * @returns {Pregnancy} The updated pregnancy record.
   */
  updatePregnancy(id, payload) {
    WK.security().checkPermission('pregnancy.episode.update.all');
    this.logger.info(`Attempting to update pregnancy: ${id}`);

    this.validator.validateForUpdate(id, payload);

    const existingPregnancy = this.repository.findById(id);
    if (!existingPregnancy) {
      throw new Error(`Pregnancy with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedPregnancy = this.repository.update(id, updateData);

    this.eventBus.publish('PregnancyUpdated', {
      source: 'PregnancyService',
      payload: { old: existingPregnancy, new: updatedPregnancy },
    });

    this.logger.info(`Successfully updated pregnancy: ${id}`);
    return updatedPregnancy;
  }

  /**
   * Deletes a pregnancy record.
   * @param {string} id - The ID of the pregnancy to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deletePregnancy(id) {
    WK.security().checkPermission('pregnancy.episode.delete');
    this.logger.warn(`Attempting to delete pregnancy: ${id}`);

    const existingPregnancy = this.repository.findById(id);
    if (!existingPregnancy) {
      throw new Error(`Pregnancy with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('PregnancyDeleted', {
        source: 'PregnancyService',
        payload: existingPregnancy,
      });
      this.analyticsService.track('pregnancy_deleted', { motherId: existingPregnancy.motherId });
      this.logger.info(`Successfully deleted pregnancy: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single pregnancy record by its ID.
   * @param {string} id - The ID of the pregnancy.
   * @returns {Pregnancy}
   */
  getPregnancy(id) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    const pregnancy = this.repository.findById(id);
    if (!pregnancy) {
      throw new Error(`Pregnancy with ID ${id} not found.`);
    }
    return pregnancy;
  }

  /**
   * Retrieves all pregnancy records for a mother.
   * @param {string} motherId - The ID of the mother.
   * @returns {Pregnancy[]}
   */
  getPregnancyHistory(motherId) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    return this.repository.findByMother(motherId, { sortBy: 'pregnancyNumber', order: 'desc' });
  }

  /**
   * Retrieves the current active pregnancy for a mother.
   * @param {string} motherId - The ID of the mother.
   * @returns {Pregnancy|null}
   */
  getActivePregnancy(motherId) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    return this.repository.findActiveByMother(motherId);
  }

  /**
   * Searches for pregnancy records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Pregnancy[]}
   */
  searchPregnancies(query, options) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all pregnancy records.
   * @param {object} options - List options.
   * @returns {Pregnancy[]}
   */
  listPregnancies(options) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts pregnancy records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countPregnancies(query) {
    WK.security().checkPermission('pregnancy.episode.read.all');
    return this.repository.count(query);
  }

  /**
   * Changes the status of a pregnancy.
   * @param {string} id - The ID of the pregnancy.
   * @param {string} newStatus - The new status.
   * @returns {Pregnancy} The updated pregnancy record.
   */
  changeStatus(id, newStatus) {
    WK.security().checkPermission('pregnancy.episode.change.status');
    const existingPregnancy = this.getPregnancy(id);

    this.rule.checkStateTransition(existingPregnancy.status, newStatus);

    if (newStatus === 'ACTIVE') {
      this.rule.checkActivePregnancyExists(existingPregnancy.motherId, id);
    }

    const updatedPregnancy = this.updatePregnancy(id, { status: newStatus });

    this.eventBus.publish('PregnancyStatusChanged', {
      source: 'PregnancyService',
      payload: updatedPregnancy,
    });

    return updatedPregnancy;
  }

  /**
   * Changes the risk status of a pregnancy.
   * @param {string} id - The ID of the pregnancy.
   * @param {string} newRiskStatus - The new risk status.
   * @returns {Pregnancy} The updated pregnancy record.
   */
  changeRiskStatus(id, newRiskStatus) {
    WK.security().checkPermission('pregnancy.episode.change.risk_status');
    const updatedPregnancy = this.updatePregnancy(id, { riskStatus: newRiskStatus });

    this.eventBus.publish('PregnancyRiskChanged', {
      source: 'PregnancyService',
      payload: updatedPregnancy,
    });

    if (newRiskStatus === 'HIGH_RISK') {
      this.notificationService.sendToRole('HealthOfficer', {
        channel: 'SYSTEM',
        type: 'ALERT',
        title: 'High Risk Pregnancy Identified',
        body: `Pregnancy ID ${id} for citizen ${updatedPregnancy.citizenId} has been marked as high risk.`,
      });
      this.workflowService.start('HIGH_RISK_PREGNANCY_MONITORING', { pregnancyId: id });
    }

    return updatedPregnancy;
  }

  /**
   * Marks a pregnancy as completed.
   * @param {string} id - The ID of the pregnancy.
   * @param {object} completionPayload - Data for completion (e.g., actualEndDate, pregnancyOutcome).
   * @returns {Pregnancy} The completed pregnancy record.
   */
  completePregnancy(id, completionPayload) {
    const { actualEndDate, pregnancyOutcome } = completionPayload;
    if (!actualEndDate || !pregnancyOutcome) {
      throw new Error('Actual end date and pregnancy outcome are required to complete a pregnancy.');
    }

    const updatedPregnancy = this.changeStatus(id, 'COMPLETED');
    const finalPregnancy = this.updatePregnancy(id, { actualEndDate, pregnancyOutcome });

    this.eventBus.publish('PregnancyCompleted', {
      source: 'PregnancyService',
      payload: finalPregnancy,
    });

    // This could also trigger an update to the parent MotherProfile's counters
    // e.g., WK.service('MotherService').incrementDeliveryCounter(finalPregnancy.motherId);

    return finalPregnancy;
  }

  /**
   * Marks a pregnancy as ended (e.g., due to miscarriage).
   * @param {string} id - The ID of the pregnancy.
   * @param {object} endPayload - Data for ending (e.g., actualEndDate, pregnancyOutcome).
   * @returns {Pregnancy} The ended pregnancy record.
   */
  endPregnancy(id, endPayload) {
    const { actualEndDate, pregnancyOutcome } = endPayload;
    if (!actualEndDate || !pregnancyOutcome) {
      throw new Error('Actual end date and pregnancy outcome are required to end a pregnancy.');
    }

    const updatedPregnancy = this.changeStatus(id, 'ENDED');
    const finalPregnancy = this.updatePregnancy(id, { actualEndDate, pregnancyOutcome });

    this.eventBus.publish('PregnancyEnded', {
      source: 'PregnancyService',
      payload: finalPregnancy,
    });

    return finalPregnancy;
  }

  /**
   * Updates the gestational age for a pregnancy.
   * @param {string} id - The ID of the pregnancy.
   * @param {number} weeks - The gestational age in weeks.
   * @returns {Pregnancy} The updated pregnancy record.
   */
  updateGestationalAge(id, weeks) {
    WK.security().checkPermission('pregnancy.episode.update.all');
    this.rule.checkGestationalAge(weeks);
    return this.updatePregnancy(id, { gestationalAgeWeeks: weeks });
  }
}