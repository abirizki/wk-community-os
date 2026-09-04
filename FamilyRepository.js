/**
 * @class FamilyRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for Family entities.
 */
class FamilyRepository extends BaseRepository {
  constructor() {
    super('families');
  }

  /**
   * Creates a new family record.
   * @param {Family} entity - The entity to create.
   * @returns {Family} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return Family.fromObject(createdRecord);
  }

  /**
   * Updates an existing family record.
   * @param {string} id - The ID of the record to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {Family} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id)?.version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    if (updateData.members) {
      updateData.members = JSON.stringify(updateData.members);
    }
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return Family.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a family record.
   * @param {string} id - The ID of the record to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a family by its ID.
   * @param {string} id - The ID of the record.
   * @returns {Family|null}
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return Family.fromObject(record);
  }

  /**
   * Finds a family by its KK Number.
   * @param {string} KKNumber - The KK Number.
   * @returns {Family|null}
   */
  findByKKNumber(KKNumber) {
    const record = this.dbAdapter.findOne(this.tableName, { KKNumber });
    return Family.fromObject(record);
  }

  /**
   * Finds a family by the head of family's citizen ID.
   * @param {string} citizenId - The citizen ID of the head of family.
   * @returns {Family|null}
   */
  findByHeadOfFamily(citizenId) {
    const record = this.dbAdapter.findOne(this.tableName, { headOfFamilyCitizenId: citizenId });
    return Family.fromObject(record);
  }

  /**
   * Searches for family records based on a query.
   * @param {object} query - The search query.
   * @param {object} [options] - Search options.
   * @returns {Family[]}
   */
  search(query, options = {}) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(Family.fromObject);
  }

  /**
   * Checks if a family exists by its ID or KK Number.
   * @param {string} identifier - The ID or KK Number.
   * @returns {boolean}
   */
  exists(identifier) {
    return this.dbAdapter.exists(this.tableName, { id: identifier }) ||
           this.dbAdapter.exists(this.tableName, { KKNumber: identifier });
  }
}