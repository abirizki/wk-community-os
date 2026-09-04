/**
 * @class HealthRepository
 * @extends {BaseRepository}
 * @description Manages data persistence for HealthProfile entities.
 */
class HealthRepository extends BaseRepository {
  constructor() {
    super('health_profiles');
  }

  /**
   * Creates a new health profile record.
   * @param {HealthEntity} entity - The health profile entity to create.
   * @returns {HealthEntity} The created entity.
   */
  create(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.tableName, record);
    return HealthEntity.fromObject(createdRecord);
  }

  /**
   * Updates an existing health profile record.
   * @param {string} id - The ID of the health profile to update.
   * @param {object} updates - An object containing the fields to update.
   * @returns {HealthEntity} The updated entity.
   */
  update(id, updates) {
    const updatedRecord = this.dbAdapter.update(this.tableName, id, updates);
    return HealthEntity.fromObject(updatedRecord);
  }

  /**
   * Deletes a health profile record by its ID.
   * @param {string} id - The ID of the health profile to delete.
   * @returns {boolean} True if deletion was successful.
   */
  delete(id) {
    return this.dbAdapter.delete(this.tableName, id);
  }

  /**
   * Finds a health profile by its ID.
   * @param {string} id - The ID of the health profile.
   * @returns {HealthEntity|null} The found entity or null.
   */
  findById(id) {
    const record = this.dbAdapter.findById(this.tableName, id);
    return HealthEntity.fromObject(record);
  }

  /**
   * Finds a health profile by the citizen's ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {HealthEntity|null} The found entity or null.
   */
  findByCitizenId(citizenId) {
    const record = this.dbAdapter.findOne(this.tableName, { citizenId: citizenId });
    return HealthEntity.fromObject(record);
  }

  /**
   * Checks if a health profile exists for a given citizen ID.
   * @param {string} citizenId - The ID of the citizen.
   * @returns {boolean} True if a profile exists.
   */
  exists(citizenId) {
    return this.dbAdapter.exists(this.tableName, { citizenId: citizenId });
  }

  /**
   * Searches for health profiles based on a query and options.
   * @param {object} query - The search query.
   * @param {object} options - The search options (e.g., limit, offset, sortBy).
   * @returns {HealthEntity[]} An array of found entities.
   */
  search(query, options) {
    const records = this.dbAdapter.search(this.tableName, query, options);
    return records.map(HealthEntity.fromObject);
  }

  /**
   * Lists all health profiles with pagination.
   * @param {object} options - The listing options (e.g., limit, offset, sortBy).
   * @returns {HealthEntity[]} An array of entities.
   */
  list(options) {
    const records = this.dbAdapter.findAll(this.tableName, options);
    return records.map(HealthEntity.fromObject);
  }

  /**
   * Counts the total number of health profiles matching a query.
   * @param {object} [query={}] - The query to match.
   * @returns {number} The total count.
   */
  count(query = {}) {
    return this.dbAdapter.count(this.tableName, query);
  }
}