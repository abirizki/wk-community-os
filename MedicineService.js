/**
 * @class MedicineService
 * @description The main service for managing the medicine master data catalog.
 */
class MedicineService {
  /**
   * @param {MedicineRepository} medicineRepository
   * @param {MedicineValidator} medicineValidator
   * @param {MedicineRule} medicineRule
   * @param {EventBus} eventBus
   * @param {AnalyticsService} analyticsService
   */
  constructor(medicineRepository, medicineValidator, medicineRule, eventBus, analyticsService) {
    /** @private */
    this.repository = medicineRepository;
    /** @private */
    this.validator = medicineValidator;
    /** @private */
    this.rule = medicineRule;
    /** @private */
    this.eventBus = eventBus;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.logger = WK.logger('MedicineService');
  }

  /**
   * Creates a new medicine master record.
   * @param {object} payload - The data for the new medicine.
   * @returns {Medicine} The newly created medicine record.
   */
  createMedicine(payload) {
    WK.security().checkPermission('medicine.master.create');
    this.logger.info(`Attempting to create medicine master record with code: ${payload.code}`);

    this.validator.validateForCreate(payload);

    const currentUser = WK.user();
    const entityData = {
      ...payload,
      id: Utilities.getUuid(),
      createdBy: currentUser.id,
      updatedBy: currentUser.id,
    };

    const medicineEntity = new Medicine(entityData);
    const createdRecord = this.repository.create(medicineEntity);

    this.eventBus.publish('MedicineCreated', {
      source: 'MedicineService',
      payload: createdRecord,
    });

    this.analyticsService.track('medicine_master_created', { medicineId: createdRecord.id, medicineCode: createdRecord.code });
    this.logger.info(`Successfully created medicine master record ${createdRecord.id} with code ${createdRecord.code}`);

    return createdRecord;
  }

  /**
   * Updates an existing medicine master record.
   * @param {string} id - The ID of the medicine to update.
   * @param {object} payload - The update data.
   * @returns {Medicine} The updated medicine record.
   */
  updateMedicine(id, payload) {
    WK.security().checkPermission('medicine.master.update');
    this.logger.info(`Attempting to update medicine master record: ${id}`);

    this.validator.validateForUpdate(id, payload);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }

    const updateData = {
      ...payload,
      updatedAt: new Date().toISOString(),
      updatedBy: WK.user().id,
    };

    const updatedRecord = this.repository.update(id, updateData);

    this.eventBus.publish('MedicineUpdated', {
      source: 'MedicineService',
      payload: { old: existingRecord, new: updatedRecord },
    });

    this.logger.info(`Successfully updated medicine master record: ${id}`);
    return updatedRecord;
  }

  /**
   * Deletes a medicine master record.
   * @param {string} id - The ID of the medicine to delete.
   * @returns {{success: boolean, id: string}} The result of the deletion.
   */
  deleteMedicine(id) {
    WK.security().checkPermission('medicine.master.delete');
    this.logger.warn(`Attempting to delete medicine master record: ${id}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }

    // In a real scenario, a rule would check for historical transaction references here.
    // e.g., this.rule.checkNoActiveTransactions(id);

    const success = this.repository.delete(id, WK.user().id);
    if (success) {
      this.eventBus.publish('MedicineDeleted', {
        source: 'MedicineService',
        payload: existingRecord,
      });
      this.logger.info(`Successfully deleted medicine master record: ${id}`);
    }

    return { success, id };
  }

  /**
   * Retrieves a single medicine by its ID.
   * @param {string} id - The ID of the medicine.
   * @returns {Medicine}
   */
  getMedicine(id) {
    WK.security().checkPermission('medicine.master.read');
    const record = this.repository.findById(id);
    if (!record) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }
    return record;
  }

  /**
   * Retrieves a single medicine by its code.
   * @param {string} code - The code of the medicine.
   * @returns {Medicine}
   */
  getByCode(code) {
    WK.security().checkPermission('medicine.master.read');
    const record = this.repository.findByCode(code);
    if (!record) {
      throw new Error(`Medicine with code ${code} not found.`);
    }
    return record;
  }

  /**
   * Searches for medicine master records.
   * @param {object} query - The search query.
   * @param {object} options - Search options.
   * @returns {Medicine[]}
   */
  searchMedicines(query, options) {
    WK.security().checkPermission('medicine.master.search');
    return this.repository.search(query, options);
  }

  /**
   * Lists all medicine master records.
   * @param {object} options - List options.
   * @returns {Medicine[]}
   */
  listMedicines(options) {
    WK.security().checkPermission('medicine.master.read');
    return this.repository.list(options);
  }

  /**
   * Counts medicine master records.
   * @param {object} query - The query to match.
   * @returns {number}
   */
  countMedicines(query) {
    WK.security().checkPermission('medicine.master.read');
    return this.repository.count(query);
  }

  /**
   * Checks if a medicine exists.
   * @param {string} id - The ID of the medicine.
   * @returns {boolean}
   */
  existsMedicine(id) {
    WK.security().checkPermission('medicine.master.read');
    return this.repository.exists(id);
  }

  /**
   * Updates the status of a medicine master record.
   * @param {string} id - The ID of the medicine.
   * @param {string} newStatus - The new status (e.g., 'ACTIVE', 'INACTIVE').
   * @returns {Medicine} The updated medicine record.
   */
  updateStatus(id, newStatus) {
    WK.security().checkPermission('medicine.master.update');
    this.logger.info(`Attempting to update status for medicine master record: ${id} to ${newStatus}`);

    const existingRecord = this.repository.findById(id);
    if (!existingRecord) {
      throw new Error(`Medicine with ID ${id} not found.`);
    }

    // Validate the new status against master data
    this.rule.checkMasterDataLookups({ status: newStatus });

    const updatedRecord = this.updateMedicine(id, { status: newStatus });

    this.eventBus.publish('MedicineStatusChanged', {
      source: 'MedicineService',
      payload: updatedRecord,
    });

    return updatedRecord;
  }
}