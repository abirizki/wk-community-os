/**
 * @class HealthService
 * @description The main service for managing citizen health profiles.
 */
class HealthService {
  /**
   * @param {HealthRepository} healthRepository
   * @param {HealthValidator} healthValidator
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(healthRepository, healthValidator, eventBus, analyticsService) {
    /** @private */
    this.repository = healthRepository;
    /** @private */
    this.validator = healthValidator;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('HealthService');
  }

  /**
   * Creates a new health profile for a citizen.
   * @param {object} payload - The data for the new health profile.
   * @returns {HealthEntity} The newly created health profile.
   */
  createHealthProfile(payload) {
    WK.security().checkPermission('health.profile.create');
    this.logger.info(`Attempting to create health profile for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const healthEntity = new HealthEntity(entityData);
    const createdProfile = this.repository.create(healthEntity);

    this.eventBus.publish('HealthProfileCreated', {
      source: 'HealthService',
      payload: createdProfile,
    });

    this.analyticsService.track('health_profile_created', { citizenId: createdProfile.citizenId });
    this.logger.info(`Successfully created health profile ${createdProfile.id} for citizen ${createdProfile.citizenId}`);

    return createdProfile;
  }

  /**
   * Updates an existing health profile.
   * @param {string} id - The ID of the health profile to update.
   * @param {object} payload - The update data.
   * @returns {HealthEntity} The updated health profile.
   */
  updateHealthProfile(id, payload) {
    WK.security().checkPermission('health.profile.update.all');
    this.logger.info(`Attempting to update health profile: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingProfile = this.repository.findById(id);
    if (!existingProfile) {
      throw new Error(`Health profile with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedProfile = this.repository.update(id, updateData);

    this.eventBus.publish('HealthProfileUpdated', {
      source: 'HealthService',
      payload: { old: existingProfile, new: updatedProfile },
    });

    this.logger.info(`Successfully updated health profile: ${id}`);
    return updatedProfile;
  }

  /**
   * Deletes a health profile.
   * @param {string} id - The ID of the health profile to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteHealthProfile(id) {
    WK.security().checkPermission('health.profile.delete');
    this.logger.warn(`Attempting to delete health profile: ${id}`);

    const existingProfile = this.repository.findById(id);
    if (!existingProfile) {
      throw new Error(`Health profile with ID ${id} not found.`);
    }

    const success = this.repository.delete(id);
    if (success) {
      this.eventBus.publish('HealthProfileDeleted', {
        source: 'HealthService',
        payload: existingProfile,
      });
      this.analyticsService.track('health_profile_deleted', { citizenId: existingProfile.citizenId });
      this.logger.info(`Successfully deleted health profile: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single health profile by its ID.
   * @param {string} id - The ID of the health profile.
   * @returns {HealthEntity} The health profile.
   */
  getHealthProfile(id) {
    WK.security().checkPermission('health.profile.read.all');
    const profile = this.repository.findById(id);
    if (!profile) {
      throw new Error(`Health profile with ID ${id} not found.`);
    }
    return profile;
  }

  /**
   * Retrieves a health profile by a citizen's ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {HealthEntity} The health profile.
   */
  getHealthProfileByCitizen(citizenId) {
    WK.security().checkPermission('health.profile.read.all');
    const profile = this.repository.findByCitizenId(citizenId);
    if (!profile) {
      throw new Error(`Health profile for citizen ID ${citizenId} not found.`);
    }
    return profile;
  }

  /**
   * Searches for health profiles.
   * @param {object} query - The search query.
   * @param {object} options - Search options like limit, offset, sortBy.
   * @returns {HealthEntity[]} A list of health profiles.
   */
  searchHealthProfiles(query, options) {
    WK.security().checkPermission('health.profile.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all health profiles.
   * @param {object} options - List options like limit, offset, sortBy.
   * @returns {HealthEntity[]} A list of health profiles.
   */
  listHealthProfiles(options) {
    WK.security().checkPermission('health.profile.read.all');
    return this.repository.list(options);
  }

  /**
   * Changes the health status of a profile.
   * @param {string} id - The ID of the health profile.
   * @param {string} newStatus - The new health status.
   * @returns {HealthEntity} The updated health profile.
   */
  changeHealthStatus(id, newStatus) {
    WK.security().checkPermission('health.profile.update.all');
    const updatedProfile = this.updateHealthProfile(id, { healthStatus: newStatus });
    this.eventBus.publish('HealthStatusChanged', {
      source: 'HealthService',
      payload: updatedProfile,
    });
    return updatedProfile;
  }

  /**
   * Adds a disease to a citizen's disease history.
   * @param {string} id - The ID of the health profile.
   * @param {string} disease - The disease to add.
   * @returns {HealthEntity} The updated health profile.
   */
  addDiseaseHistory(id, disease) {
    WK.security().checkPermission('health.profile.update.all');
    const profile = this.getHealthProfile(id);
    if (profile.diseaseHistory.includes(disease)) {
      return profile; // Avoid duplicates
    }
    const newHistory = [...profile.diseaseHistory, disease];
    const updatedProfile = this.updateHealthProfile(id, { diseaseHistory: newHistory });
    this.eventBus.publish('DiseaseHistoryUpdated', { source: 'HealthService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Removes a disease from a citizen's disease history.
   * @param {string} id - The ID of the health profile.
   * @param {string} disease - The disease to remove.
   * @returns {HealthEntity} The updated health profile.
   */
  removeDiseaseHistory(id, disease) {
    WK.security().checkPermission('health.profile.update.all');
    const profile = this.getHealthProfile(id);
    const newHistory = profile.diseaseHistory.filter(d => d !== disease);
    const updatedProfile = this.updateHealthProfile(id, { diseaseHistory: newHistory });
    this.eventBus.publish('DiseaseHistoryUpdated', { source: 'HealthService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Adds an allergy to a citizen's profile.
   * @param {string} id - The ID of the health profile.
   * @param {string} allergy - The allergy to add.
   * @returns {HealthEntity} The updated health profile.
   */
  addAllergy(id, allergy) {
    WK.security().checkPermission('health.profile.update.all');
    const profile = this.getHealthProfile(id);
    if (profile.allergies.includes(allergy)) {
      return profile;
    }
    const newAllergies = [...profile.allergies, allergy];
    const updatedProfile = this.updateHealthProfile(id, { allergies: newAllergies });
    this.eventBus.publish('AllergyUpdated', { source: 'HealthService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Removes an allergy from a citizen's profile.
   * @param {string} id - The ID of the health profile.
   * @param {string} allergy - The allergy to remove.
   * @returns {HealthEntity} The updated health profile.
   */
  removeAllergy(id, allergy) {
    WK.security().checkPermission('health.profile.update.all');
    const profile = this.getHealthProfile(id);
    const newAllergies = profile.allergies.filter(a => a !== allergy);
    const updatedProfile = this.updateHealthProfile(id, { allergies: newAllergies });
    this.eventBus.publish('AllergyUpdated', { source: 'HealthService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Adds a medical note to a citizen's profile.
   * @param {string} id - The ID of the health profile.
   * @param {string} noteContent - The content of the note.
   * @returns {HealthEntity} The updated health profile.
   */
  addMedicalNote(id, noteContent) {
    WK.security().checkPermission('health.profile.update.all');
    const profile = this.getHealthProfile(id);
    const newNote = {
      note: noteContent,
      authorId: WK.user().id,
      createdAt: new Date().toISOString(),
    };
    const newNotes = [...profile.medicalNotes, newNote];
    const updatedProfile = this.updateHealthProfile(id, { medicalNotes: newNotes });
    this.eventBus.publish('MedicalNoteAdded', { source: 'HealthService', payload: updatedProfile });
    return updatedProfile;
  }

  /**
   * Updates the blood type and rhesus factor.
   * @param {string} id - The ID of the health profile.
   * @param {string} bloodType - The new blood type.
   * @param {string} rhesus - The new rhesus factor.
   * @returns {HealthEntity} The updated health profile.
   */
  updateBloodType(id, bloodType, rhesus) {
    WK.security().checkPermission('health.profile.update.all');
    this.validator.validateBloodType(bloodType, rhesus);
    return this.updateHealthProfile(id, { bloodType, rhesus });
  }

  /**
   * Updates the list of disabilities.
   * @param {string} id - The ID of the health profile.
   * @param {string[]} disabilities - The new list of disabilities.
   * @returns {HealthEntity} The updated health profile.
   */
  updateDisability(id, disabilities) {
    WK.security().checkPermission('health.profile.update.all');
    return this.updateHealthProfile(id, { disabilities });
  }

  /**
   * Checks if a health profile exists for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {boolean}
   */
  existsHealthProfile(citizenId) {
    WK.security().checkPermission('health.profile.read.all');
    return this.repository.exists(citizenId);
  }
}