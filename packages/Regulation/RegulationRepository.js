/**
 * @file RegulationRepository.js
 * @description Manages persistence and data queries for community regulations and articles using BaseRepository.
 */

// Fallback for BaseRepository in standalone environments
const BaseRepo = typeof BaseRepository !== 'undefined'
  ? BaseRepository
  : class {
      constructor(tableName) {
        this.tableName = tableName;
        this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
      }
    };

// Import Entity models if available
let Regulation, RegulationArticle;
try {
  ({ Regulation, RegulationArticle } = require('./RegulationEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class RegulationRepository extends BaseRepo {
  constructor() {
    super('regulations');
    this.regulationTableName = 'regulations';
    this.articleTableName = 'regulation_articles';
  }

  // =========================================================================
  // REGULATION DATA ACCESS METHODS
  // =========================================================================

  /**
   * Creates a new regulation record in the database.
   * @param {Regulation} entity - Regulation entity.
   * @returns {Regulation}
   */
  createRegulation(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.regulationTableName, record);
    return Regulation ? Regulation.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a regulation by its ID.
   * @param {string} id - Regulation ID.
   * @returns {Regulation|null}
   */
  findRegulationById(id) {
    const record = this.dbAdapter.findById(this.regulationTableName, id);
    if (!record) return null;
    return Regulation ? Regulation.fromObject(record) : record;
  }

  /**
   * Finds a regulation by its official number.
   * @param {string} regulationNumber - Official regulation number.
   * @returns {Regulation|null}
   */
  findByRegulationNumber(regulationNumber) {
    const records = this.dbAdapter.search(this.regulationTableName, { regulationNumber }) || [];
    if (records.length === 0) return null;
    return Regulation ? Regulation.fromObject(records[0]) : records[0];
  }

  /**
   * Finds regulations anchored to a specific Decision reference.
   * @param {string} decisionId - Decision ID.
   * @returns {Regulation[]}
   */
  findByDecisionId(decisionId) {
    const query = { decisionId, deletedAt: null };
    const records = this.dbAdapter.search(this.regulationTableName, query) || [];
    return Regulation ? records.map(r => Regulation.fromObject(r)) : records;
  }

  /**
   * Searches for regulations matching query filters.
   * @param {object} [query={}] - Filter criteria.
   * @param {object} [options={}] - Search / pagination options.
   * @returns {Regulation[]}
   */
  searchRegulations(query = {}, options = {}) {
    const records = this.dbAdapter.search(this.regulationTableName, query, options) || [];
    return Regulation ? records.map(r => Regulation.fromObject(r)) : records;
  }

  /**
   * Updates an existing regulation record with optimistic locking.
   * @param {string} id - Regulation ID.
   * @param {object} updates - Updates to apply.
   * @returns {Regulation}
   */
  updateRegulation(id, updates) {
    const current = this.findRegulationById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    const updatedRecord = this.dbAdapter.update(this.regulationTableName, id, updateData);
    return Regulation ? Regulation.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes a regulation record.
   * @param {string} id - Regulation ID.
   * @param {string} userId - User ID performing deletion.
   * @returns {boolean}
   */
  deleteRegulation(id, userId) {
    return this.dbAdapter.softDelete(this.regulationTableName, id, userId);
  }

  // =========================================================================
  // ARTICLE DATA ACCESS METHODS
  // =========================================================================

  /**
   * Adds an article to a regulation.
   * @param {RegulationArticle} entity - RegulationArticle entity.
   * @returns {RegulationArticle}
   */
  addArticle(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.articleTableName, record);
    return RegulationArticle ? RegulationArticle.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds an article record by ID.
   * @param {string} id - Article ID.
   * @returns {RegulationArticle|null}
   */
  findArticleById(id) {
    const record = this.dbAdapter.findById(this.articleTableName, id);
    if (!record) return null;
    return RegulationArticle ? RegulationArticle.fromObject(record) : record;
  }

  /**
   * Retrieves all articles associated with a regulation, ordered by displayOrder.
   * @param {string} regulationId - Regulation ID.
   * @param {object} [options={}] - Options.
   * @returns {RegulationArticle[]}
   */
  findArticlesByRegulationId(regulationId, options = {}) {
    const query = { regulationId, deletedAt: null };
    const records = this.dbAdapter.search(this.articleTableName, query, options) || [];
    return RegulationArticle
      ? records.map(r => RegulationArticle.fromObject(r)).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
      : records;
  }

  /**
   * Updates an article record.
   * @param {string} id - Article ID.
   * @param {object} updates - Updates to apply.
   * @returns {RegulationArticle}
   */
  updateArticle(id, updates) {
    const current = this.findArticleById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    const updatedRecord = this.dbAdapter.update(this.articleTableName, id, updateData);
    return RegulationArticle ? RegulationArticle.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes an article record.
   * @param {string} id - Article ID.
   * @param {string} userId - User ID.
   * @returns {boolean}
   */
  deleteArticle(id, userId) {
    return this.dbAdapter.softDelete(this.articleTableName, id, userId);
  }
}

module.exports = RegulationRepository;

