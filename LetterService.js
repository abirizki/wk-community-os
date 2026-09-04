/**
 * @class LetterService
 * @description The main service for managing the lifecycle of official letter documents.
 */
class LetterService {
  /**
   * @param {LetterRepository} letterRepository
   * @param {LetterValidator} letterValidator
   * @param {LetterRule} letterRule
   * @param {AdministrativeServiceRepository} administrativeServiceRepository
   * @param {DocumentGeneratorService} documentGeneratorService - Assumes a service to generate content from templates.
   * @param {NumberingService} numberingService - Assumes a service to generate official document numbers.
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(
    letterRepository,
    letterValidator,
    letterRule,
    administrativeServiceRepository,
    documentGeneratorService,
    numberingService,
    eventBus,
    analyticsService
  ) {
    /** @private */
    this.repository = letterRepository;
    /** @private */
    this.validator = letterValidator;
    /** @private */
    this.rule = letterRule;
    /** @private */
    this.administrativeServiceRepository = administrativeServiceRepository;
    /** @private */
    this.documentGeneratorService = documentGeneratorService;
    /** @private */
    this.numberingService = numberingService;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('LetterService');
  }

  /**
   * Creates a new letter document based on an approved administrative service request.
   * @param {object} payload - The data for the new letter, including administrativeServiceId.
   * @returns {Letter} The newly created letter record.
   */
  createLetter(payload) {
    WK.security().checkPermission('letter.document.create');
    this.logger.info(`Attempting to create letter for administrative request: ${payload.administrativeServiceId}`);

    // Fetch the source request to denormalize necessary data
    const adminRequest = this.administrativeServiceRepository.findById(payload.administrativeServiceId);
    if (!adminRequest) {
      throw new Error(`Administrative Service Request with ID ${payload.administrativeServiceId} not found.`);
    }

    const creationPayload = {
      ...payload,
      citizenId: adminRequest.citizenId,
      familyId: adminRequest.familyId,
      letterType: adminRequest.requestType,
    };

    this.validator.validateForCreate(creationPayload);

    const currentUser = WK.user();
    const entityData = {
      ...creationPayload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    // Generate initial content from template
    entityData.content = this.documentGeneratorService.generate(entityData.templateId, {
      citizenId: entityData.citizenId,
      familyId: entityData.familyId,
      requestId: entityData.administrativeServiceId,
    });

    const letterEntity = new Letter(entityData);
    const createdRecord = this.repository.create(letterEntity);

    this.eventBus.publish('LetterCreated', {
      source: 'LetterService',
      payload: createdRecord,
    });

    this.analyticsService.track('letter_created', {
      letterId: createdRecord.id,
      letterType: createdRecord.letterType,
    });

    this.logger.info(`Successfully created letter ${createdRecord.id} for request ${createdRecord.administrativeServiceId}`);
    return createdRecord;
  }

  /**
   * Retrieves a single letter by its ID.
   * @param {string} id - The ID of the letter.
   * @returns {Letter}
   */
  getLetter(id) {
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Letter with ID ${id} not found.`);
    }

    const security = WK.security();
    if (!security.hasPermission('letter.document.read.all')) {
      security.checkPermission('letter.document.read.own');
      if (record.citizenId !== WK.user().citizenId) {
        throw new Error('Access denied. You can only view your own letters.');
      }
    }

    return record;
  }

  /**
   * Searches for letter documents.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Letter[]}
   */
  searchLetters(query, options) {
    WK.security().checkPermission('letter.document.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Issues a finalized letter, assigning an official number and date.
   * @param {string} id - The ID of the letter to issue.
   * @returns {Letter} The updated, issued letter record.
   */
  issueLetter(id) {
    WK.security().checkPermission('letter.document.issue');
    this.logger.info(`Attempting to issue letter: ${id}`);

    const existingRecord = this.getLetter(id);
    this.rule.checkCanBeIssued(existingRecord);

    const currentUser = WK.user();
    const updatePayload = {
      letterStatus: 'ISSUED',
      letterNumber: this.numberingService.generate('LETTER', { type: existingRecord.letterType }),
      issueDate: new Date().toISOString(),
      issuedBy: currentUser.id,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };

    const updatedRecord = this.repository.update(id, updatePayload);

    this.eventBus.publish('LetterIssued', {
      source: 'LetterService',
      payload: updatedRecord,
    });

    this.analyticsService.track('letter_issued', {
      letterId: id,
      letterType: updatedRecord.letterType,
      issuedBy: currentUser.id,
    });

    this.logger.info(`Successfully issued letter ${id} with number ${updatedRecord.letterNumber}`);
    return updatedRecord;
  }

  /**
   * Revokes an already issued letter.
   * @param {string} id - The ID of the letter to revoke.
   * @param {string} reason - The reason for revocation.
   * @returns {Letter} The updated, revoked letter record.
   */
  revokeLetter(id, reason) {
    WK.security().checkPermission('letter.document.revoke');
    this.logger.warn(`Attempting to revoke letter: ${id} for reason: ${reason}`);

    if (!reason) {
      throw new Error('A reason is required to revoke a letter.');
    }

    const existingRecord = this.getLetter(id);
    this.rule.checkStatusTransition(existingRecord.letterStatus, 'REVOKED');

    const currentUser = WK.user();
    const updatePayload = {
      letterStatus: 'REVOKED',
      revocationReason: reason,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };

    const updatedRecord = this.repository.update(id, updatePayload);

    this.eventBus.publish('LetterRevoked', {
      source: 'LetterService',
      payload: updatedRecord,
    });

    this.logger.info(`Successfully revoked letter ${id}`);
    return updatedRecord;
  }

  /**
   * Regenerates the content of a letter from its template and associated data.
   * This is useful if the template or underlying citizen data has changed.
   * @param {string} id - The ID of the letter to regenerate.
   * @returns {Letter} The updated letter with new content.
   */
  regenerateContent(id) {
    WK.security().checkPermission('letter.document.regenerate');
    this.logger.info(`Regenerating content for letter: ${id}`);

    const existingRecord = this.getLetter(id);

    if (existingRecord.letterStatus === 'ISSUED') {
      throw new Error('Cannot regenerate content for an already issued letter. Revoke it first if changes are needed.');
    }

    const newContent = this.documentGeneratorService.generate(existingRecord.templateId, {
      citizenId: existingRecord.citizenId,
      familyId: existingRecord.familyId,
      requestId: existingRecord.administrativeServiceId,
    });

    const updatePayload = {
      content: newContent,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updatePayload);

    this.eventBus.publish('LetterContentRegenerated', {
      source: 'LetterService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Updates the status of a letter. This is a generic method for controlled state changes.
   * Prefer specific methods like `issueLetter` or `revokeLetter` where possible.
   * @param {string} id - The ID of the letter.
   * @param {string} newStatus - The target status.
   * @returns {Letter} The updated letter record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('letter.document.update.all'); // Generic, powerful permission
    this.logger.info(`Attempting to update status for letter ${id} to ${newStatus}`);

    const existingRecord = this.getLetter(id);
    this.rule.checkStatusTransition(existingRecord.letterStatus, newStatus);

    const updatePayload = {
      letterStatus: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updatePayload);

    this.eventBus.publish('LetterStatusChanged', {
      source: 'LetterService',
      payload: { oldStatus: existingRecord.letterStatus, newStatus: newStatus, record: updatedRecord },
    });

    return updatedRecord;
  }
}