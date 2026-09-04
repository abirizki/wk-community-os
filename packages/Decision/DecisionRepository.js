/**
 * @file DecisionRepository.js
 * @description Manages persistence and data queries for formal decisions and impacts using BaseRepository.
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
let Decision, DecisionImpact;
try {
  ({ Decision, DecisionImpact } = require('./DecisionEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class DecisionRepository extends BaseRepo {
  constructor() {
    super('decisions');
    this.decisionTableName = 'decisions';
    this.impactTableName = 'decision_impacts';
  }

  // =========================================================================
  // DECISION DATA ACCESS METHODS
  // =========================================================================

  /**
   * Creates a new decision record in the database.
   * @param {Decision} entity - Decision entity.
   * @returns {Decision}
   */
  createDecision(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.decisionTableName, record);
    return Decision ? Decision.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a decision by its ID.
   * @param {string} id - Decision ID.
   * @returns {Decision|null}
   */
  findDecisionById(id) {
    const record = this.dbAdapter.findById(this.decisionTableName, id);
    if (!record) return null;
    return Decision ? Decision.fromObject(record) : record;
  }

  /**
   * Finds a decision by its official number.
   * @param {string} decisionNumber - Official decision number.
   * @returns {Decision|null}
   */
  findByDecisionNumber(decisionNumber) {
    const records = this.dbAdapter.search(this.decisionTableName, { decisionNumber }) || [];
    if (records.length === 0) return null;
    return Decision ? Decision.fromObject(records[0]) : records[0];
  }

  /**
   * Finds decisions originating from a specific meeting.
   * @param {string} meetingId - Meeting ID.
   * @returns {Decision[]}
   */
  findByMeetingId(meetingId) {
    const query = { meetingId, deletedAt: null };
    const records = this.dbAdapter.search(this.decisionTableName, query) || [];
    return Decision ? records.map(r => Decision.fromObject(r)) : records;
  }

  /**
   * Searches for decisions matching query filters.
   * @param {object} [query={}] - Filter criteria.
   * @param {object} [options={}] - Search / pagination options.
   * @returns {Decision[]}
   */
  searchDecisions(query = {}, options = {}) {
    const records = this.dbAdapter.search(this.decisionTableName, query, options) || [];
    return Decision ? records.map(r => Decision.fromObject(r)) : records;
  }

  /**
   * Updates an existing decision record with optimistic locking.
   * @param {string} id - Decision ID.
   * @param {object} updates - Updates to apply.
   * @returns {Decision}
   */
  updateDecision(id, updates) {
    const current = this.findDecisionById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    const updatedRecord = this.dbAdapter.update(this.decisionTableName, id, updateData);
    return Decision ? Decision.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes a decision record.
   * @param {string} id - Decision ID.
   * @param {string} userId - User ID performing deletion.
   * @returns {boolean}
   */
  deleteDecision(id, userId) {
    return this.dbAdapter.softDelete(this.decisionTableName, id, userId);
  }

  // =========================================================================
  // IMPACT DATA ACCESS METHODS
  // =========================================================================

  /**
   * Adds an impact declaration to a decision.
   * @param {DecisionImpact} entity - DecisionImpact entity.
   * @returns {DecisionImpact}
   */
  addImpact(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.impactTableName, record);
    return DecisionImpact ? DecisionImpact.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds an impact record by ID.
   * @param {string} id - Impact ID.
   * @returns {DecisionImpact|null}
   */
  findImpactById(id) {
    const record = this.dbAdapter.findById(this.impactTableName, id);
    if (!record) return null;
    return DecisionImpact ? DecisionImpact.fromObject(record) : record;
  }

  /**
   * Retrieves all impacts associated with a decision.
   * @param {string} decisionId - Decision ID.
   * @returns {DecisionImpact[]}
   */
  findImpactsByDecisionId(decisionId) {
    const query = { decisionId, deletedAt: null };
    const records = this.dbAdapter.search(this.impactTableName, query) || [];
    return DecisionImpact ? records.map(r => DecisionImpact.fromObject(r)) : records;
  }

  /**
   * Soft deletes an impact record.
   * @param {string} id - Impact ID.
   * @param {string} userId - User ID.
   * @returns {boolean}
   */
  deleteImpact(id, userId) {
    return this.dbAdapter.softDelete(this.impactTableName, id, userId);
  }
}

module.exports = DecisionRepository;

