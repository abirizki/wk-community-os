/**
 * @class FamilyService
 * @description The main service for managing family (household/KK) master data.
 */
class FamilyService {
  /**
   * @param {FamilyRepository} familyRepository
   * @param {FamilyValidator} familyValidator
   * @param {FamilyRule} familyRule
   * @param {CitizenRepository} citizenRepository
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(familyRepository, familyValidator, familyRule, citizenRepository, eventBus, analyticsService) {
    /** @private */
    this.repository = familyRepository;
    /** @private */
    this.validator = familyValidator;
    /** @private */
    this.rule = familyRule;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('FamilyService');
  }

  /**
   * Creates a new family profile.
   * @param {object} payload - The data for the new family.
   * @returns {Family} The newly created family record.
   */
  createFamily(payload) {
    WK.security().checkPermission('family.profile.create');
    this.logger.info(`Attempting to create family with KK Number: ${payload.KKNumber}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const familyEntity = new Family(entityData);
    const createdRecord = this.repository.create(familyEntity);

    this.eventBus.publish('FamilyCreated', {
      source: 'FamilyService',
      payload: createdRecord,
    });

    this.analyticsService.track('family_created', { familyId: createdRecord.id, rt: createdRecord.rt, rw: createdRecord.rw });
    this.logger.info(`Successfully created family ${createdRecord.id} with KK Number ${createdRecord.KKNumber}`);

    return createdRecord;
  }

  /**
   * Updates an existing family profile.
   * @param {string} id - The ID of the family to update.
   * @param {object} payload - The update data.
   * @returns {Family} The updated family record.
   */
  updateFamily(id, payload) {
    WK.security().checkPermission('family.profile.update.all');
    this.logger.info(`Attempting to update family profile: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Family with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('FamilyUpdated', {
      source: 'FamilyService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated family profile: ${id}`);
    return updatedRecord;
  }

  /**
   * Deactivates a family profile (soft delete).
   * @param {string} id - The ID of the family to deactivate.
   * @returns {{success: boolean, id: string}} The result of the deactivation.
   */
  deactivateFamily(id) {
    WK.security().checkPermission('family.profile.delete');
    this.logger.warn(`Attempting to deactivate family profile: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Family with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('FamilyDeactivated', {
        source: 'FamilyService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deactivated family profile: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single family by its ID.
   * @param {string} id - The ID of the family.
   * @returns {Family}
   */
  getFamily(id) {
    WK.security().checkPermission('family.profile.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Family with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves a single family by its KK Number.
   * @param {string} KKNumber - The KK Number of the family.
   * @returns {Family}
   */
  getFamilyByKKNumber(KKNumber) {
    WK.security().checkPermission('family.profile.read.all');
    const record = this.repository.findByKKNumber(KKNumber);
    if (!record) {
      throw new Error(`Family with KK Number ${KKNumber} not found.`);
    }
    return record;
  }

  /**
   * Searches for family profiles.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Family[]}
   */
  searchFamilies(query, options) {
    WK.security().checkPermission('family.profile.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Adds a new member to a family.
   * @param {string} familyId - The ID of the family.
   * @param {object} memberPayload - The member data { citizenId, relationship }.
   * @returns {Family} The updated family record.
   */
  addMember(familyId, memberPayload) {
    WK.security().checkPermission('family.profile.members.manage');
    this.logger.info(`Adding member ${memberPayload.citizenId} to family ${familyId}`);

    const family = this.getFamily(familyId);

    // Perform rule checks that are not part of the standard validator flow
    this.rule.checkAllMembersExist([memberPayload]); // Check if the new member exists as a citizen
    const newMembers = [...family.members, memberPayload];
    this.rule.checkMemberUniqueness(newMembers); // Check for duplicates

    const updatedFamily = this.repository.update(familyId, { members: newMembers });

    this.eventBus.publish('FamilyMemberAdded', {
      source: 'FamilyService',
      payload: { familyId, member: memberPayload },
    });

    return updatedFamily;
  }

  /**
   * Removes a member from a family.
   * @param {string} familyId - The ID of the family.
   * @param {string} citizenIdToRemove - The citizen ID of the member to remove.
   * @returns {Family} The updated family record.
   */
  removeMember(familyId, citizenIdToRemove) {
    WK.security().checkPermission('family.profile.members.manage');
    this.logger.warn(`Removing member ${citizenIdToRemove} from family ${familyId}`);

    const family = this.getFamily(familyId);

    // Business Rule: Cannot remove the head of the family.
    if (family.headOfFamilyCitizenId === citizenIdToRemove) {
      throw new Error('Cannot remove the head of the family. Please change the head of family first.');
    }

    const initialMemberCount = family.members.length;
    const newMembers = family.members.filter(m => m.citizenId !== citizenIdToRemove);

    if (newMembers.length === initialMemberCount) {
      this.logger.warn(`Member ${citizenIdToRemove} not found in family ${familyId}. No action taken.`);
      return family; // Idempotent: member was not there to begin with.
    }

    const updatedFamily = this.repository.update(familyId, { members: newMembers });

    this.eventBus.publish('FamilyMemberRemoved', {
      source: 'FamilyService',
      payload: { familyId, citizenId: citizenIdToRemove },
    });

    return updatedFamily;
  }

  /**
   * Changes the head of the family.
   * @param {string} familyId - The ID of the family.
   * @param {string} newHeadCitizenId - The citizen ID of the new head of family.
   * @returns {Family} The updated family record.
   */
  changeHeadOfFamily(familyId, newHeadCitizenId) {
    WK.security().checkPermission('family.profile.update.all');
    this.logger.info(`Changing head of family for ${familyId} to ${newHeadCitizenId}`);

    const family = this.getFamily(familyId);
    const oldHeadCitizenId = family.headOfFamilyCitizenId;

    if (oldHeadCitizenId === newHeadCitizenId) {
      return family; // No change needed
    }

    // Business Rule: The new head must be an existing member of the family.
    const newHeadAsMember = family.members.find(m => m.citizenId === newHeadCitizenId);
    if (!newHeadAsMember) {
      throw new Error(`Citizen ${newHeadCitizenId} is not a member of this family and cannot be assigned as head.`);
    }

    // Update relationships in the members array
    const newMembers = family.members.map(member => {
      if (member.citizenId === oldHeadCitizenId) {
        // The old head needs a new relationship. This is a business decision.
        // For now, we'll leave it to be updated in a separate call, or set to a default.
        // A more robust implementation might require the new relationship in the payload.
        return { ...member, relationship: 'ANGGOTA_KELUARGA' }; // Example default
      }
      if (member.citizenId === newHeadCitizenId) {
        return { ...member, relationship: 'KEPALA_KELUARGA' };
      }
      return member;
    });

    const updatePayload = {
      headOfFamilyCitizenId: newHeadCitizenId,
      members: newMembers,
    };

    const updatedFamily = this.updateFamily(familyId, updatePayload);

    this.eventBus.publish('FamilyHeadChanged', {
      source: 'FamilyService',
      payload: { familyId, oldHead: oldHeadCitizenId, newHead: newHeadCitizenId },
    });

    return updatedFamily;
  }
}
