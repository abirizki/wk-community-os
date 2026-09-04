/**
 * @class MotherRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for MotherProfile entities.
 */
class MotherRepository extends BaseRepository {
  constructor() {
    super('mother_profiles');
  }

  /**
   * Creates a new mother profile record.
   * @param {MotherProfile} entity - The mother profile entity to create.
   * @returns {MotherProfile} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return MotherProfile.fromObject(createdRecord);
  }

  /**
   * Updates an existing mother profile record.
   * @param {string} id - The ID of the mother profile to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {MotherProfile} The updated entity.
   */
  update(id, updates) {
    const currentVersion = this.findById(id).version || 1;
    const updateData = { ...updates, version: currentVersion + 1 };
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updateData);
    return MotherProfile.fromObject(updatedRecord);
  }

  /**
   * Soft deletes a mother profile record.
   * @param {string} id - The ID of the mother profile to delete.
   * @param {string} userId - The ID of the user performing the deletion.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id, userId) {
    return this.dbAdapter.softDelete(this.tableName, id, userId);
  }

  /**
   * Finds a mother profile by its ID.
   * @param {string} id - The ID of the mother profile.
   * @returns {MotherProfile|null} The found entity or null.
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return MotherProfile.fromObject(record);
  }

  /**
   * Finds a mother profile by the citizen's ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {MotherProfile|null} The found entity or null.
   */
  findByCitizen(citizenId) {
    const record = this.dbAdapter.findOne(this.tableName, { citizenId: citizenId });
    return MotherProfile.fromObject(record);
  }

  /**
   * Finds a mother profile by the health profile's ID.
   * @param {string} healthProfileId - The ID of the health profile.
   * @returns {MotherProfile|null} The found entity or null.
   */
  findByHealthProfile(healthProfileId) {
    const record = this.dbAdapter.findOne(this.tableName, { healthProfileId: healthProfileId });
    return MotherProfile.fromObject(record);
  }

  /**
   * Checks if a mother profile exists for a given citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {boolean} True if a profile exists.
   */
  exists(citizenId) {
    return this.dbAdapter.exists(this.tableName, { citizenId: citizenId });
  }

  /**
   * Searches for mother profiles based on a query and options.
   * @param {object} query - The search query.
   * @param {object} options - The search options (e.g., limit, offset, sortBy).
   * @returns {MotherProfile[]} An array of found entities.
   */
  search(query, options) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(MotherProfile.fromObject);
  }

  /**
   * Lists all mother profiles with pagination.
   * @param {object} options - The listing options (e.g., limit, offset, sortBy).
   * @returns {MotherProfile[]} An array of entities.
   */
  list(options) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(MotherProfile.fromObject);
  }

  /**
   * Counts the total number of mother profiles matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number} The total count.
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }
}