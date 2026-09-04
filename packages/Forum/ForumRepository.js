/**
 * @file ForumRepository.js
 * @description Manages persistence and data queries for Forum topics, comments, and votes using BaseRepository.
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
let ForumTopic, ForumComment, ForumVote;
try {
  ({ ForumTopic, ForumComment, ForumVote } = require('./ForumEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class ForumRepository extends BaseRepo {
  constructor() {
    super('forum_topics');
    this.topicTableName = 'forum_topics';
    this.commentTableName = 'forum_comments';
    this.voteTableName = 'forum_votes';
  }

  // =========================================================================
  // TOPIC DATA ACCESS METHODS
  // =========================================================================

  /**
   * Creates a new topic record in the database.
   * @param {ForumTopic} entity - Topic entity instance.
   * @returns {ForumTopic}
   */
  createTopic(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.topicTableName, record);
    return ForumTopic ? ForumTopic.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a single topic by its ID.
   * @param {string} id - Topic ID.
   * @returns {ForumTopic|null}
   */
  findTopicById(id) {
    const record = this.dbAdapter.findById(this.topicTableName, id);
    if (!record) return null;
    return ForumTopic ? ForumTopic.fromObject(record) : record;
  }

  /**
   * Searches for topics matching a query criteria.
   * @param {object} [query={}] - Filter criteria.
   * @param {object} [options={}] - Pagination / sort options.
   * @returns {ForumTopic[]}
   */
  searchTopics(query = {}, options = {}) {
    const records = this.dbAdapter.search(this.topicTableName, query, options) || [];
    return ForumTopic ? records.map(r => ForumTopic.fromObject(r)) : records;
  }

  /**
   * Updates an existing topic record with optimistic locking.
   * @param {string} id - Topic ID.
   * @param {object} updates - Updates to apply.
   * @returns {ForumTopic}
   */
  updateTopic(id, updates) {
    const current = this.findTopicById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = { 
      ...updates, 
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1 
    };

    if (updateData.tags && Array.isArray(updateData.tags)) {
      updateData.tags = JSON.stringify(updateData.tags);
    }

    const updatedRecord = this.dbAdapter.update(this.topicTableName, id, updateData);
    return ForumTopic ? ForumTopic.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes a topic record.
   * @param {string} id - Topic ID.
   * @param {string} userId - User ID performing deletion.
   * @returns {boolean}
   */
  deleteTopic(id, userId) {
    return this.dbAdapter.softDelete(this.topicTableName, id, userId);
  }

  // =========================================================================
  // COMMENT DATA ACCESS METHODS
  // =========================================================================

  /**
   * Creates a new comment record in the database.
   * @param {ForumComment} entity - Comment entity instance.
   * @returns {ForumComment}
   */
  createComment(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.commentTableName, record);
    return ForumComment ? ForumComment.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a comment by its ID.
   * @param {string} id - Comment ID.
   * @returns {ForumComment|null}
   */
  findCommentById(id) {
    const record = this.dbAdapter.findById(this.commentTableName, id);
    if (!record) return null;
    return ForumComment ? ForumComment.fromObject(record) : record;
  }

  /**
   * Retrieves all comments under a given topic.
   * @param {string} topicId - Parent topic ID.
   * @param {object} [options={}] - Search / order options.
   * @returns {ForumComment[]}
   */
  findCommentsByTopicId(topicId, options = {}) {
    const query = { topicId, deletedAt: null };
    const records = this.dbAdapter.search(this.commentTableName, query, options) || [];
    return ForumComment ? records.map(r => ForumComment.fromObject(r)) : records;
  }

  /**
   * Updates an existing comment.
   * @param {string} id - Comment ID.
   * @param {object} updates - Updates to apply.
   * @returns {ForumComment}
   */
  updateComment(id, updates) {
    const current = this.findCommentById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = { 
      ...updates, 
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1 
    };

    const updatedRecord = this.dbAdapter.update(this.commentTableName, id, updateData);
    return ForumComment ? ForumComment.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes a comment.
   * @param {string} id - Comment ID.
   * @param {string} userId - User ID performing deletion.
   * @returns {boolean}
   */
  deleteComment(id, userId) {
    return this.dbAdapter.softDelete(this.commentTableName, id, userId);
  }

  // =========================================================================
  // VOTE DATA ACCESS METHODS
  // =========================================================================

  /**
   * Records or replaces a vote on a topic.
   * @param {ForumVote} entity - Vote entity.
   * @returns {ForumVote}
   */
  castVote(entity) {
    const existing = this.findVote(entity.topicId, entity.citizenId);
    if (existing) {
      const updated = this.dbAdapter.update(this.voteTableName, existing.id, {
        voteType: entity.voteType,
        createdAt: new Date().toISOString(),
      });
      return ForumVote ? ForumVote.fromObject(updated) : updated;
    }

    const createdRecord = this.dbAdapter.create(this.voteTableName, entity.toObject());
    return ForumVote ? ForumVote.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a vote cast by a specific citizen on a topic.
   * @param {string} topicId - Topic ID.
   * @param {string} citizenId - Citizen ID.
   * @returns {ForumVote|null}
   */
  findVote(topicId, citizenId) {
    const records = this.dbAdapter.search(this.voteTableName, { topicId, citizenId }) || [];
    if (records.length === 0) return null;
    return ForumVote ? ForumVote.fromObject(records[0]) : records[0];
  }

  /**
   * Counts the number of votes for a specific topic and vote type.
   * @param {string} topicId - Topic ID.
   * @param {string} voteType - 'UPVOTE' or 'DOWNVOTE'.
   * @returns {number}
   */
  countVotes(topicId, voteType) {
    if (typeof this.dbAdapter.count === 'function') {
      return this.dbAdapter.count(this.voteTableName, { topicId, voteType });
    }
    const records = this.dbAdapter.search(this.voteTableName, { topicId, voteType }) || [];
    return records.length;
  }
}

module.exports = ForumRepository;

