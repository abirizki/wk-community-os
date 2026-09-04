/**
 * @class LetterRule
 * @description Encapsulates business rule checks for the Letter package.
 */
class LetterRule {
  /**
   * @param {LetterRepository} letterRepository
   * @param {AdministrativeServiceRepository} administrativeServiceRepository
   * @param {TemplateRepository} templateRepository - Assumes a repository for document templates.
   */
  constructor(letterRepository, administrativeServiceRepository, templateRepository) {
    /** @private */
    this.letterRepository = letterRepository;
    /** @private */
    this.administrativeServiceRepository = administrativeServiceRepository;
    /** @private */
    this.templateRepository = templateRepository;
    /** @private */
    this.logger = WK.logger('LetterRule');

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['PENDING_SIGNATURE', 'CANCELLED'],
      'PENDING_SIGNATURE': ['ISSUED', 'REJECTED'],
      'ISSUED': ['EXPIRED', 'REVOKED'],
      'EXPIRED': [],
      'REVOKED': [],
      'REJECTED': [],
      'CANCELLED': [],
    };
  }

  /**
   * Checks if the referenced administrative service request exists.
   * @param {string} administrativeServiceId - The ID of the request.
   * @throws {Error} If the request does not exist.
   */
  checkAdministrativeServiceRequestExists(administrativeServiceId) {
    if (!this.administrativeServiceRepository.exists(administrativeServiceId)) {
      throw new Error(`Administrative Service Request with ID ${administrativeServiceId} not found.`);
    }
  }

  /**
   * Checks if the administrative service request is approved for letter generation.
   * @param {string} administrativeServiceId - The ID of the request.
   * @throws {Error} If the request is not in an approved state.
   */
  checkRequestIsApproved(administrativeServiceId) {
    const request = this.administrativeServiceRepository.findById(administrativeServiceId);
    const approvedStates = ['RW_VERIFIED', 'KELURAHAN_PROCESSED', 'COMPLETED'];
    if (!request || !approvedStates.includes(request.requestStatus)) {
      throw new Error(`Cannot generate letter. Administrative Service Request ${administrativeServiceId} is not in an approved state (current status: ${request?.requestStatus || 'N/A'}).`);
    }
  }

  /**
   * Checks if a letter has already been generated for the given request.
   * @param {string} administrativeServiceId - The ID of the request.
   * @throws {Error} If a letter already exists for the request.
   */
  checkDuplicateLetterForRequest(administrativeServiceId) {
    const existingLetter = this.letterRepository.findByAdministrativeServiceId(administrativeServiceId);
    if (existingLetter) {
      throw new Error(`A letter has already been generated for Administrative Service Request ${administrativeServiceId}.`);
    }
  }

  /**
   * Checks if the specified document template exists.
   * @param {string} templateId - The ID of the template.
   * @throws {Error} If the template does not exist.
   */
  checkTemplateExists(templateId) {
    // Assumes a TemplateRepository or a MasterData service for templates
    if (!this.templateRepository.exists(templateId)) {
      throw new Error(`Document template with ID ${templateId} not found.`);
    }
  }

  /**
   * Validates a status transition for a letter.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   * @throws {Error} If the transition is not allowed.
   */
  checkStatusTransition(fromStatus, toStatus) {
    if (!this.allowedStatusTransitions[fromStatus] || !this.allowedStatusTransitions[fromStatus].includes(toStatus)) {
      this.logger.warn(`Invalid letter status transition from ${fromStatus} to ${toStatus}`);
      throw new Error(`Invalid letter status transition from ${fromStatus} to ${toStatus}.`);
    }
  }

  /**
   * Checks if a letter can be issued.
   * @param {Letter} letter - The letter entity.
   * @throws {Error} If the letter is not in a state that allows issuance.
   */
  checkCanBeIssued(letter) {
    if (letter.letterStatus !== 'PENDING_SIGNATURE') {
      throw new Error(`Letter cannot be issued. Current status is '${letter.letterStatus}'.`);
    }
  }
}