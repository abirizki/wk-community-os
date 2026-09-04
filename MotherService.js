/**
 * @class MotherService
 * @description The main service for managing maternal-health profiles.
 */
class MotherService {
  /**
   * @param {MotherRepository} motherRepository
   * @param {MotherValidator} motherValidator
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(motherRepository, motherValidator, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = motherRepository;
    /** @private */
    this.validator = motherValidator;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('MotherService');
  }

  /**
   * Creates a new mother profile.
   * @param {object} payload - The data for the new profile.
   * @returns {MotherProfile} The newly created profile.
   */
  createMotherProfile(payload) {
    WK.security().checkPermission('mother.profile.create');
    this.logger.info(`Attempting to create mother profile for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const motherEntity = new MotherProfile(entityData);
    const createdProfile = this.repository.create(motherEntity);

    this.eventBus.publish('MotherProfileCreated', {
      source: 'MotherService',
      payload: createdProfile,
    });

    this.analyticsService.track('mother_profile_created', { citizenId: createdProfile.citizenId });
    this.logger.info(`Successfully created mother profile ${createdProfile.id} for citizen ${createdProfile.citizenId}`);

    return createdProfile;
  }

  /**
   * Updates an existing mother profile.
   * @param {string} id - The ID of the profile to update.
   * @param {object} payload - The update data.
   * @returns {MotherProfile} The updated profile.
   */
  updateMotherProfile(id, payload) {
    WK.security().checkPermission('mother.profile.update.all');
    this.logger.info(`Attempting to update mother profile: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingProfile = this.repository.findById(id);
    if (!existingProfile) {
      throw new Error(`Mother profile with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedProfile = this.repository.update(id, updateData);

    this.eventBus.publish('MotherProfileUpdated', {
      source: 'MotherService',
      payload: { old: existingProfile, new: updatedProfile },
    });

    this.logger.info(`Successfully updated mother profile: ${id}`);
    return updatedProfile;
  }

  /**
   * Deletes a mother profile.
   * @param {string} id - The ID of the profile to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteMotherProfile(id) {
    WK.security().checkPermission('mother.profile.delete');
    this.logger.warn(`Attempting to delete mother profile: ${id}`);

    const existingProfile = this.repository.findById(id);
    if (!existingProfile) {
      throw new Error(`Mother profile with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('MotherProfileDeleted', {
        source: 'MotherService',
        payload: existingProfile,
      });
      this.analyticsService.track('mother_profile_deleted', { citizenId: existingProfile.citizenId });
      this.logger.info(`Successfully deleted mother profile: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single mother profile by its ID.
   * @param {string} id - The ID of the profile.
   * @returns {MotherProfile}
   */
  getMotherProfile(id) {
    WK.security().checkPermission('mother.profile.read.all');
    const profile = this.repository.findById(id);
    if (!profile) {
      throw new Error(`Mother profile with ID ${id} not found.`);
    }
    return profile;
  }

  /**
   * Retrieves a mother profile by a citizen's ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {MotherProfile}
   */
  getMotherByCitizen(citizenId) {
    WK.security().checkPermission('mother.profile.read.all');
    const profile = this.repository.findByCitizen(citizenId);
    if (!profile) {
      throw new Error(`Mother profile for citizen ID ${citizenId} not found.`);
    }
    return profile;
  }

  /**
   * Retrieves a mother profile by a health profile's ID.
   * @param {string} healthProfileId - The ID of the health profile.
   * @returns {MotherProfile}
   */
  getMotherByHealthProfile(healthProfileId) {
    WK.security().checkPermission('mother.profile.read.all');
    const profile = this.repository.findByHealthProfile(healthProfileId);
    if (!profile) {
      throw new Error(`Mother profile for health profile ID ${healthProfileId} not found.`);
    }
    return profile;
  }

  /**
   * Searches for mother profiles.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {MotherProfile[]}
   */
  searchMothers(query, options) {
    WK.security().checkPermission('mother.profile.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all mother profiles.
   * @param {object} options - List options.
   * @returns {MotherProfile[]}
   */
  listMothers(options) {
    WK.security().checkPermission('mother.profile.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts mother profiles.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countMothers(query) {
    WK.security().checkPermission('mother.profile.read.all');
    return this.repository.count(query);
  }

  /**
   * Checks if a mother profile exists for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {boolean}
   */
  existsMotherProfile(citizenId) {
    WK.security().checkPermission('mother.profile.read.all');
    return this.repository.exists(citizenId);
  }

  /**
   * Updates maternal history fields like LMP and last delivery date.
   * @param {string} id - The ID of the mother profile.
   * @param {object} historyPayload - The history data.
   * @returns {MotherProfile} The updated profile.
   */
  updateMaternalHistory(id, historyPayload) {
    WK.security().checkPermission('mother.profile.update.all');
    const payload = {
      lastMenstrualPeriod: historyPayload.lastMenstrualPeriod,
      lastDeliveryDate: historyPayload.lastDeliveryDate,
    };
    const updatedProfile = this.updateMotherProfile(id, payload);
    this.eventBus.publish('MotherHistoryUpdated', { source: 'MotherService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Updates maternal counters.
   * @param {string} id - The ID of the mother profile.
   * @param {object} countersPayload - The counter data.
   * @returns {MotherProfile} The updated profile.
   */
  updateCounters(id, countersPayload) {
    WK.security().checkPermission('mother.profile.update.all');
    const payload = {
      numberOfPregnancies: countersPayload.numberOfPregnancies,
      numberOfDeliveries: countersPayload.numberOfDeliveries,
      numberOfMiscarriages: countersPayload.numberOfMiscarriages,
      numberOfLivingChildren: countersPayload.numberOfLivingChildren,
    };
    return this.updateMotherProfile(id, payload);
  }

  /**
   * Changes the maternal risk status of a profile.
   * @param {string} id - The ID of the mother profile.
   * @param {string} newStatus - The new maternal risk status.
   * @returns {MotherProfile} The updated profile.
   */
  changeMaternalRiskStatus(id, newStatus) {
    WK.security().checkPermission('mother.risk.update');
    const updatedProfile = this.updateMotherProfile(id, { maternalRiskStatus: newStatus });

    this.eventBus.publish('MotherRiskStatusChanged', {
      source: 'MotherService',
      payload: updatedProfile,
    });

    if (newStatus === 'HIGH_RISK') {
      this.notificationService.sendToRole('HealthOfficer', {
        channel: 'SYSTEM',
        type: 'ALERT',
        title: 'High Risk Mother Identified',
        body: `Citizen ID ${updatedProfile.citizenId} has been marked as high risk. Please review.`,
      });
      this.workflowService.start('HIGH_RISK_MOTHER_MONITORING', { motherProfileId: id });
    }

    return updatedProfile;
  }

  /**
   * Adds a maternal note to a profile.
   * @param {string} id - The ID of the mother profile.
   * @param {string} noteContent - The content of the note.
   * @returns {MotherProfile} The updated profile.
   */
  addMaternalNote(id, noteContent) {
    WK.security().checkPermission('mother.profile.update.all');
    const profile = this.getMotherProfile(id);
    const newNote = {
      note: noteContent,
      authorId: WK.user().id,
      createdAt: new Date().toISOString(),
    };
    const newNotes = [...profile.maternalNotes, newNote];
    return this.updateMotherProfile(id, { maternalNotes: newNotes });
  }

  /**
   * Retrieves the maternal history for a citizen. Alias for getMotherByCitizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {MotherProfile}
   */
  getMaternalHistory(citizenId) {
    return this.getMotherByCitizen(citizenId);
  }
}