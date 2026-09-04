/**
 * @class AdministrativeServiceService
 * @description The main service for managing administrative service requests.
 */
class AdministrativeServiceService {
  /**
   * @param {AdministrativeServiceRepository} repository
   * @param {AdministrativeServiceValidator} validator
   * @param {AdministrativeServiceRule} rule
   * @param {CitizenRepository} citizenRepository
   * @param {FamilyRepository} familyRepository
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, validator, rule, citizenRepository, familyRepository, eventBus, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.validator = validator;
    /** @private */
    this.rule = rule;
    /** @private */
    this.citizenRepository = citizenRepository; // For dependency checks
    /** @private */
    this.familyRepository = familyRepository; // For dependency checks
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('AdministrativeServiceService');
  }

  /**
   * Creates a new administrative service request.
   * @param {object} payload - The data for the new request.
   * @returns {AdministrativeService} The newly created request record.
   */
  createRequest(payload) {
    WK.security().checkPermission('administrativeservice.request.create');
    this.logger.info(`Attempting to create administrative service request for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const requestEntity = new AdministrativeService(entityData);
    const createdRecord = this.repository.create(requestEntity);

    this.eventBus.publish('AdministrativeServiceCreated', {
      source: 'AdministrativeServiceService',
      payload: createdRecord,
    });

    this.analyticsService.track('admin_service_created', {
      requestId: createdRecord.id,
      requestType: createdRecord.requestType,
      citizenId: createdRecord.citizenId,
    });

    this.logger.info(`Successfully created administrative service request ${createdRecord.id}`);
    return createdRecord;
  }

  /**
   * Retrieves a single administrative service request by its ID.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  getRequest(id) {
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Administrative service request with ID ${id} not found.`);
    }

    // Enforce 'own' permission if 'all' is not present
    const security = WK.security();
    if (!security.hasPermission('administrativeservice.request.read.all')) {
      security.checkPermission('administrativeservice.request.read.own');
      if (record.citizenId !== WK.user().citizenId) {
        throw new Error('Access denied. You can only view your own service requests.');
      }
    }

    return record;
  }

  /**
   * Searches for administrative service requests.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {AdministrativeService[]}
   */
  searchRequests(query, options) {
    WK.security().checkPermission('administrativeservice.request.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Updates the status of a request. This is the central method for workflow progression.
   * @param {string} id - The ID of the request.
   * @param {string} newStatus - The target status.
   * @param {object} [context={}] - Additional context for the update (e.g., notes, verifierId).
   * @returns {AdministrativeService} The updated request record.
   */
  updateStatus(id, newStatus, context = {}) {
    this.logger.info(`Attempting to update status for request ${id} to ${newStatus}`);
    const existingRecord = this.getRequest(id); // getRequest handles initial permission check

    // Determine required permission for this specific transition
    this._checkTransitionPermission(existingRecord.requestStatus, newStatus);

    // Validate the transition is allowed by business rules
    this.rule.checkStatusTransition(existingRecord.requestStatus, newStatus);

    const currentUser = WK.user();
    const updatePayload = {
      requestStatus: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: currentUser.id,
    };

    // Add context-specific fields based on the new status
    switch (newStatus) {
      case 'SUBMITTED':
        updatePayload.submissionDate = new Date().toISOString();
        break;
      case 'RT_VERIFIED':
        updatePayload.rtVerificationStatus = 'VERIFIED';
        updatePayload.rtVerifierId = currentUser.id;
        updatePayload.rtVerificationDate = new Date().toISOString();
        break;
      case 'RW_VERIFIED':
        updatePayload.rwVerificationStatus = 'VERIFIED';
        updatePayload.rwVerifierId = currentUser.id;
        updatePayload.rwVerificationDate = new Date().toISOString();
        break;
      case 'KELURAHAN_PROCESSED':
        updatePayload.kelurahanProcessingStatus = 'PROCESSED';
        updatePayload.kelurahanProcessorId = currentUser.id;
        updatePayload.kelurahanProcessingDate = new Date().toISOString();
        break;
      case 'COMPLETED':
        updatePayload.completedAt = new Date().toISOString();
        updatePayload.completedBy = currentUser.id;
        break;
      case 'REJECTED':
      case 'CANCELLED':
        updatePayload.cancelledAt = new Date().toISOString();
        updatePayload.cancelledBy = currentUser.id;
        if (context.reason) {
          updatePayload.notes = [...existingRecord.notes, { type: 'REJECTION/CANCELLATION', reason: context.reason, authorId: currentUser.id, date: new Date().toISOString() }];
        }
        break;
    }

    const updatedRecord = this.repository.update(id, updatePayload);

    this.eventBus.publish('AdministrativeServiceStatusChanged', {
      source: 'AdministrativeServiceService',
      payload: { oldStatus: existingRecord.requestStatus, newStatus: newStatus, record: updatedRecord },
    });

    this.analyticsService.track('admin_service_status_changed', {
      requestId: id,
      requestType: updatedRecord.requestType,
      fromStatus: existingRecord.requestStatus,
      toStatus: newStatus,
    });

    this.logger.info(`Successfully updated status for request ${id} to ${newStatus}`);
    return updatedRecord;
  }

  /**
   * Submits a draft request for verification.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  submitRequest(id) {
    return this.updateStatus(id, 'SUBMITTED');
  }

  /**
   * Verifies a request at the RT level.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  verifyByRT(id) {
    return this.updateStatus(id, 'RT_VERIFIED');
  }

  /**
   * Verifies a request at the RW level.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  verifyByRW(id) {
    const request = this.getRequest(id);
    if (request.rtVerificationStatus !== 'VERIFIED') {
      throw new Error('Request must be verified by RT before RW verification.');
    }
    return this.updateStatus(id, 'RW_VERIFIED');
  }

  /**
   * Marks a request as processed by the Kelurahan.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  processByKelurahan(id) {
    const request = this.getRequest(id);
    if (request.rwVerificationStatus !== 'VERIFIED') {
      throw new Error('Request must be verified by RW before Kelurahan processing.');
    }
    return this.updateStatus(id, 'KELURAHAN_PROCESSED');
  }

  /**
   * Completes a request.
   * @param {string} id - The ID of the request.
   * @returns {AdministrativeService}
   */
  completeRequest(id) {
    return this.updateStatus(id, 'COMPLETED');
  }

  /**
   * Rejects a request.
   * @param {string} id - The ID of the request.
   * @param {string} reason - The reason for rejection.
   * @returns {AdministrativeService}
   */
  rejectRequest(id, reason) {
    if (!reason) {
      throw new Error('A reason is required to reject a request.');
    }
    return this.updateStatus(id, 'REJECTED', { reason });
  }

  /**
   * Cancels a request.
   * @param {string} id - The ID of the request.
   * @param {string} reason - The reason for cancellation.
   * @returns {AdministrativeService}
   */
  cancelRequest(id, reason) {
    if (!reason) {
      throw new Error('A reason is required to cancel a request.');
    }
    return this.updateStatus(id, 'CANCELLED', { reason });
  }

  /**
   * Adds a note to a request.
   * @param {string} id - The ID of the request.
   * @param {string} noteContent - The content of the note.
   * @returns {AdministrativeService}
   */
  addNote(id, noteContent) {
    WK.security().checkPermission('administrativeservice.request.update.all'); // Or a specific note permission
    const existingRecord = this.getRequest(id);
    const newNote = {
      content: noteContent,
      authorId: WK.user().id,
      date: new Date().toISOString(),
    };
    const updatedNotes = [...existingRecord.notes, newNote];
    return this.repository.update(id, { notes: updatedNotes });
  }

  /**
   * @private
   * Checks the required permission for a status transition.
   * @param {string} fromStatus - The current status.
   * @param {string} toStatus - The new status.
   */
  _checkTransitionPermission(fromStatus, toStatus) {
    const security = WK.security();
    switch (toStatus) {
      case 'SUBMITTED':
        if (fromStatus === 'DRAFT') security.checkPermission('administrativeservice.request.update.own');
        break;
      case 'RT_VERIFIED':
        security.checkPermission('administrativeservice.request.verify.rt');
        break;
      case 'RW_VERIFIED':
        security.checkPermission('administrativeservice.request.verify.rw');
        break;
      case 'KELURAHAN_PROCESSED':
        security.checkPermission('administrativeservice.request.process.kelurahan');
        break;
      case 'COMPLETED':
      case 'REJECTED':
        // Allow RT, RW, or Kelurahan to reject/complete
        if (!security.hasAnyPermission(['administrativeservice.request.verify.rt', 'administrativeservice.request.verify.rw', 'administrativeservice.request.process.kelurahan'])) {
          throw new Error('Access Denied. You do not have permission to reject or complete this request.');
        }
        break;
      case 'CANCELLED':
        // Allow the owner or an admin to cancel
        if (!security.hasPermission('administrativeservice.request.update.all')) {
          security.checkPermission('administrativeservice.request.update.own');
        }
        break;
      default:
        // Generic status change permission for other cases
        security.checkPermission('administrativeservice.request.change.status');
        break;
    }
  }
}