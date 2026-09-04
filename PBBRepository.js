/**
 * @class PBBRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for PBB entities.
 */
class PBBRepository extends BaseRepository {
  constructor() {
    super('pbb');
  }

  /**
   * Creates a new PBB record.
   * @param {PBB} entity - The entity to create.
   * @returns {PBB} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return PBB.fromObject(createdRecord);
  }

  /**
   * Updates an existing PBB record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {PBB} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return PBB.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a PBB record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a PBB by its ID.
   * @param {string} id - The ID of the record.
   * @returns {PBB|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return PBB.fromObject(record);
  }

  /**
   * Finds PBB records by citizen ID.
   * @param {string} citizenId - The citizen ID.
   * @param {object} [options] - Search options.
   * @returns {PBB[]}
   */
  findByCitizenId(citizenId, options = {}) {
    const records = this.dbAdapter.search(this.tableName, { citizenId }, options);
    return records.map(PBB.fromObject);
  }

  /**
   * Finds PBB records by NOP.
   * @param {string} nop - The NOP index.
   * @returns {PBB[]}
   */
  findByNOP(nop) {
    return this.search({ nop });
  }

  /**
   * Finds PBB records by payment status.
   * @param {string} paymentStatus - The payment status.
   * @returns {PBB[]}
   */
  findByPaymentStatus(paymentStatus) {
    return this.search({ paymentStatus });
  }

  /**
   * Finds PBB records by tax year.
   * @param {number|string} taxYear - The tax year.
   * @returns {PBB[]}
   */
  findByTaxYear(taxYear) {
    return this.search({ taxYear });
  }

  /**
   * Finds PBB records by object category.
   * @param {string} objectCategory - The object category.
   * @returns {PBB[]}
   */
  findByObjectCategory(objectCategory) {
    return this.search({ objectCategory });
  }

  /**
   * Searches for PBB records based on query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {PBB[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(PBB.fromObject);
  }
}

module.exports = PBBRepository;
