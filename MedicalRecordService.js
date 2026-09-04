/**
 * @class MedicalRecordService
 * @description The main service for managing citizen medical records.
 */
class MedicalRecordService {
  /**
   * @param {MedicalRecordRepository} medicalRecordRepository
   * @param {MedicalRecordValidator} medicalRecordValidator
   * @param {MedicalRecordRule} medicalRecordRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   * @param {NotificationService} notificationService
   * @param {WorkflowService} workflowService
   */
  constructor(medicalRecordRepository, medicalRecordValidator, medicalRecordRule, eventBus, analyticsService, notificationService, workflowService) {
    /** @private */
    this.repository = medicalRecordRepository;
    /** @private */
    this.validator = medicalRecordValidator;
    /** @private */
    this.rule = medicalRecordRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.workflowService = workflowService;
    /** @private */
    this.logger = WK.logger('MedicalRecordService');
  }

  /**
   * Creates a new medical record.
   * @param {object} payload - The data for the new record.
   * @returns {MedicalRecord} The newly created record.
   */
  createMedicalRecord(payload) {
    WK.security().checkPermission('medicalrecord.record.create');
    this.logger.info(`Attempting to create medical record for citizen: ${payload.citizenId}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const medicalRecordEntity = new MedicalRecord(entityData);
    const createdRecord = this.repository.create(medicalRecordEntity);

    this.eventBus.publish('MedicalRecordCreated', {
      source: 'MedicalRecordService',
      payload: createdRecord,
    });

    this.analyticsService.track('medical_record_created', { citizenId: createdRecord.citizenId, recordType: createdRecord.recordType });
    this.logger.info(`Successfully created medical record ${createdRecord.id} for citizen ${createdRecord.citizenId}`);

    return createdRecord;
  }

  /**
   * Updates an existing medical record.
   * @param {string} id - The ID of the record to update.
   * @param {object} payload - The update data.
   * @returns {MedicalRecord} The updated record.
   */
  updateMedicalRecord(id, payload) {
    WK.security().checkPermission('medicalrecord.record.update.all');
    this.logger.info(`Attempting to update medical record: ${id}`);

    this.validator.validateForUpdate(payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Medical record with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('MedicalRecordUpdated', {
      source: 'MedicalRecordService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated medical record: ${id}`);
    return updatedRecord;
  }

  /**
   * Deletes a medical record.
   * @param {string} id - The ID of the record to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteMedicalRecord(id) {
    WK.security().checkPermission('medicalrecord.record.delete');
    this.logger.warn(`Attempting to delete medical record: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Medical record with ID ${id} not found.`);
    }

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('MedicalRecordDeleted', {
        source: 'MedicalRecordService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deleted medical record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single medical record by its ID.
   * @param {string} id - The ID of the record.
   * @returns {MedicalRecord}
   */
  getMedicalRecord(id) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Medical record with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves the full medical history for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {MedicalRecord[]}
   */
  getHistory(citizenId) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    return this.repository.findByCitizen(citizenId, { sortBy: 'recordDate', order: 'desc' });
  }

  /**
   * Retrieves the latest medical record for a citizen.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {MedicalRecord|null}
   */
  getLatestByCitizen(citizenId) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    return this.repository.findLatestByCitizen(citizenId);
  }

  /**
   * Searches for medical records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {MedicalRecord[]}
   */
  search(query, options) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    return this.repository.search(query, options);
  }

  /**
   * Lists all medical records.
   * @param {object} options - List options.
   * @returns {MedicalRecord[]}
   */
  list(options) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    return this.repository.list(options);
  }

  /**
   * Counts medical records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  count(query) {
    WK.security().checkPermission('medicalrecord.record.read.all');
    return this.repository.count(query);
  }

  /**
   * Marks a medical record as completed.
   * @param {string} id - The ID of the medical record.
   * @returns {MedicalRecord} The completed record.
   */
  completeRecord(id) {
    WK.security().checkPermission('medicalrecord.record.complete');
    const existingRecord = this.getMedicalRecord(id);
    this.rule.checkCompleteness(existingRecord);

    const updatedRecord = this.updateStatus(id, 'COMPLETED');

    this.eventBus.publish('MedicalRecordCompleted', {
      source: 'MedicalRecordService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }

  /**
   * Updates the status of a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} newStatus - The new status.
   * @returns {MedicalRecord} The updated record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('medicalrecord.record.change.status');
    const existingRecord = this.getMedicalRecord(id);
    this.rule.checkStatusTransition(existingRecord.recordStatus, newStatus);

    const updatedRecord = this.updateMedicalRecord(id, { recordStatus: newStatus });

    this.eventBus.publish('MedicalRecordStatusChanged', {
      source: 'MedicalRecordService',
      payload: updatedRecord,
    });

    // Example: Trigger workflow/notification for specific status changes
    if (newStatus === 'ARCHIVED') {
      this.workflowService.start('MEDICAL_RECORD_ARCHIVAL', { medicalRecordId: id });
    }

    return updatedRecord;
  }

  /**
   * Updates the diagnosis information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string[]} diagnosisPayload - An array of diagnosis codes/descriptions.
   * @returns {MedicalRecord} The updated record.
   */
  updateDiagnosis(id, diagnosisPayload) {
    WK.security().checkPermission('medicalrecord.record.update.diagnosis');
    // Assuming validator checks format of diagnosisPayload
    return this.updateMedicalRecord(id, { diagnosis: diagnosisPayload });
  }

  /**
   * Updates the treatment information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string[]} treatmentPayload - An array of treatment descriptions.
   * @returns {MedicalRecord} The updated record.
   */
  updateTreatment(id, treatmentPayload) {
    WK.security().checkPermission('medicalrecord.record.update.treatment');
    // Assuming validator checks format of treatmentPayload
    return this.updateMedicalRecord(id, { treatment: treatmentPayload });
  }

  /**
   * Updates the prescription information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {object} prescriptionPayload - Structured prescription data.
   * @returns {MedicalRecord} The updated record.
   */
  updatePrescription(id, prescriptionPayload) {
    WK.security().checkPermission('medicalrecord.record.update.prescription');
    // Assuming validator checks format of prescriptionPayload
    return this.updateMedicalRecord(id, { prescription: prescriptionPayload });
  }

  /**
   * Adds a clinical note to a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} noteContent - The content of the new note.
   * @returns {MedicalRecord} The updated record.
   */
  updateClinicalNotes(id, noteContent) {
    WK.security().checkPermission('medicalrecord.record.update.clinical_notes');
    const record = this.getMedicalRecord(id);
    const newNote = {
      note: noteContent,
      authorId: WK.user().id,
      createdAt: new Date().toISOString(),
    };
    const updatedNotes = [...record.clinicalNotes, newNote];
    return this.updateMedicalRecord(id, { clinicalNotes: updatedNotes });
  }

  /**
   * Updates the provider information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} providerId - The ID of the provider.
   * @param {string} providerType - The type of the provider.
   * @returns {MedicalRecord} The updated record.
   */
  updateProvider(id, providerId, providerType) {
    WK.security().checkPermission('medicalrecord.record.update.provider');
    this.rule.checkProviderExists(providerId); // Assuming rule checks provider validity
    return this.updateMedicalRecord(id, { providerId, providerType });
  }

  /**
   * Updates the location information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} locationId - The ID of the location.
   * @param {string} locationType - The type of the location.
   * @returns {MedicalRecord} The updated record.
   */
  updateLocation(id, locationId, locationType) {
    WK.security().checkPermission('medicalrecord.record.update.location');
    this.rule.checkLocationExists(locationId); // Assuming rule checks location validity
    return this.updateMedicalRecord(id, { locationId, locationType });
  }

  /**
   * Updates the context information for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} contextType - The type of the context.
   * @param {string} contextId - The ID of the context entity.
   * @returns {MedicalRecord} The updated record.
   */
  updateContext(id, contextType, contextId) {
    WK.security().checkPermission('medicalrecord.record.update.context');
    const existingRecord = this.getMedicalRecord(id);
    this.rule.checkContextIntegrity(contextType, contextId, existingRecord.citizenId); // Assuming rule checks context validity
    return this.updateMedicalRecord(id, { contextType, contextId });
  }

  /**
   * Schedules a follow-up for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string} followUpDate - The date of the follow-up.
   * @param {string} [followUpNotes] - Optional notes for the follow-up.
   * @returns {MedicalRecord} The updated record.
   */
  scheduleFollowUp(id, followUpDate, followUpNotes = null) {
    WK.security().checkPermission('medicalrecord.record.schedule_followup');
    const existingRecord = this.getMedicalRecord(id);
    this.validator.validateFollowUp(followUpDate); // Assuming validator checks date validity

    const updatedRecord = this.updateMedicalRecord(id, { followUpDate, followUpNotes });

    this.eventBus.publish('MedicalRecordFollowUpScheduled', {
      source: 'MedicalRecordService',
      payload: updatedRecord,
    });

    this.notificationService.schedule({
      recipientId: existingRecord.citizenId,
      channel: 'SMS',
      sendAt: new Date(followUpDate).toISOString(),
      template: 'MEDICAL_RECORD_FOLLOWUP_REMINDER',
      data: {
        recordId: id,
        followUpDate: followUpDate,
        notes: followUpNotes,
      },
    });

    return updatedRecord;
  }

  /**
   * Updates the attachment reference for a medical record.
   * @param {string} id - The ID of the medical record.
   * @param {string|null} attachmentId - The ID of the attachment.
   * @returns {MedicalRecord} The updated record.
   */
  updateAttachment(id, attachmentId) {
    WK.security().checkPermission('medicalrecord.record.update.attachment');
    return this.updateMedicalRecord(id, { attachmentId });
  }

  /**
   * Retrieves recently created or updated medical records.
   * @param {object} [filters={}] - Optional filters for the query.
   * @param {number} [limit=5] - The number of records to return.
   * @returns {MedicalRecord[]} An array of medical record entities.
   */
  getRecentActivity(filters = {}, limit = 5) {
    WK.security().checkPermission('medicalrecord.dashboard.view');
    return this.repository.list({
      ...filters,
      limit: limit,
      sortBy: 'updatedAt',
      order: 'desc',
    });
  }
}