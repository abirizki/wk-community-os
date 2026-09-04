/**
 * @class CitizenService
 * @description The main service for managing citizen (resident) master data.
 */
class CitizenService {
  /**
   * @param {CitizenRepository} citizenRepository
   * @param {CitizenValidator} citizenValidator
   * @param {CitizenRule} citizenRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(citizenRepository, citizenValidator, citizenRule, eventBus, analyticsService) {
    /** @private */
    this.repository = citizenRepository;
    /** @private */
    this.validator = citizenValidator;
    /** @private */
    this.rule = citizenRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('CitizenService');
  }

  /**
   * Creates a new citizen profile.
   * @param {object} payload - The data for the new citizen.
   * @returns {Citizen} The newly created citizen record.
   */
  createCitizen(payload) {
    WK.security().checkPermission('citizen.profile.create');
    this.logger.info(`Attempting to create citizen with NIK: ${payload.NIK}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const citizenEntity = new Citizen(entityData);
    const createdRecord = this.repository.create(citizenEntity);

    this.eventBus.publish('CitizenCreated', {
      source: 'CitizenService',
      payload: createdRecord,
    });

    this.analyticsService.track('citizen_created', { citizenId: createdRecord.id, rt: createdRecord.rt, rw: createdRecord.rw });
    this.logger.info(`Successfully created citizen ${createdRecord.id} with NIK ${createdRecord.NIK}`);

    return createdRecord;
  }

  /**
   * Updates an existing citizen profile.
   * @param {string} id - The ID of the citizen to update.
   * @param {object} payload - The update data.
   * @returns {Citizen} The updated citizen record.
   */
  updateCitizen(id, payload) {
    WK.security().checkPermission('citizen.profile.update.all');
    this.logger.info(`Attempting to update citizen profile: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Citizen with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('CitizenUpdated', {
      source: 'CitizenService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated citizen profile: ${id}`);
    return updatedRecord;
  }

  /**
   * Deactivates a citizen profile (soft delete).
   * @param {string} id - The ID of the citizen to deactivate.
   * @returns {{success: boolean, id: string}} The result of the deactivation.
   */
  deactivateCitizen(id) {
    WK.security().checkPermission('citizen.profile.delete');
    this.logger.warn(`Attempting to deactivate citizen profile: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Citizen with ID ${id} not found.`);
    }

    // A rule would check here if the citizen can be deactivated (e.g., no open administrative requests).

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('CitizenDeactivated', {
        source: 'CitizenService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deactivated citizen profile: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single citizen by their ID.
   * @param {string} id - The ID of the citizen.
   * @returns {Citizen}
   */
  getCitizen(id) {
    WK.security().checkPermission('citizen.profile.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Citizen with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves a single citizen by their NIK. Requires special permission.
   * @param {string} NIK - The NIK of the citizen.
   * @returns {Citizen}
   */
  getCitizenByNIK(NIK) {
    WK.security().checkPermission('citizen.profile.view.sensitive_nik');
    const record = this.repository.findByNIK(NIK);
    if (!record) {
      throw new Error(`Citizen with NIK ${NIK} not found.`);
    }
    return record;
  }

  /**
   * Searches for citizen profiles.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Citizen[]}
   */
  searchCitizens(query, options) {
    WK.security().checkPermission('citizen.profile.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all citizen profiles.
   * @param {object} options - List options.
   * @returns {Citizen[]}
   */
  listCitizens(options) {
    WK.security().checkPermission('citizen.profile.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts citizen profiles.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countCitizens(query) {
    WK.security().checkPermission('citizen.profile.read.all');
    return this.repository.count(query);
  }

  /**
   * Updates the status of a citizen profile.
   * @param {string} id - The ID of the citizen.
   * @param {string} newStatus - The new status (e.g., 'ACTIVE', 'INACTIVE', 'DECEASED').
   * @returns {Citizen} The updated citizen record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('citizen.profile.change.status');
    this.logger.info(`Attempting to update status for citizen: ${id} to ${newStatus}`);

    const existingRecord = this.getCitizen(id);
    this.rule.checkStatusTransition(existingRecord.status, newStatus);

    const updatedRecord = this.updateCitizen(id, { status: newStatus });

    this.eventBus.publish('CitizenStatusChanged', {
      source: 'CitizenService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }
}