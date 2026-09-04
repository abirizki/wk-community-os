/**
 * @file ForumService.js
 * @description Core business service orchestrating the lifecycle of forum topics, citizen comments, and votes.
 */

// Import Entity models if available
let ForumTopic, ForumComment, ForumVote;
try {
  ({ ForumTopic, ForumComment, ForumVote } = require('./ForumEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class ForumService {
  /**
   * @param {ForumRepository} forumRepository
   * @param {ForumValidator} forumValidator
   * @param {ForumPermission} forumPermission
   * @param {ForumRule} forumRule
   * @param {object} [eventBus=null]
   * @param {object} [analyticsService=null]
   */
  constructor(
    forumRepository,
    forumValidator,
    forumPermission,
    forumRule,
    eventBus = null,
    analyticsService = null
  ) {
    /** @private */
    this.repository = forumRepository;
    /** @private */
    this.validator = forumValidator;
    /** @private */
    this.permission = forumPermission;
    /** @private */
    this.rule = forumRule;
    /** @private */
    this.eventBus = eventBus || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null);
    /** @private */
    this.analyticsService = analyticsService || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null);
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ForumService') : console;
  }

  // =========================================================================
  // TOPIC OPERATIONS
  // =========================================================================

  /**
   * Creates a new forum topic.
   * @param {object} payload - Topic creation data.
   * @returns {ForumTopic}
   */
  createTopic(payload) {
    this.permission.checkCreateTopic();
    if (this.logger && typeof this.logger.info === 'function') {
      this.logger.info(`Creating forum topic by citizen: ${payload.citizenId}`);
    }

    this.validator.validateTopicCreate(payload);

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: payload.citizenId };
    const entityData = {
      ...payload,
      createdBy: currentUser ? currentUser.id : payload.citizenId,
      updatedBy: currentUser ? currentUser.id : payload.citizenId,
    };

    const topicEntity = ForumTopic ? new ForumTopic(entityData) : entityData;
    const createdTopic = this.repository.createTopic(topicEntity);

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('ForumTopicCreated', {
        source: 'ForumService',
        payload: createdTopic,
      });
    }

    if (this.analyticsService && typeof this.analyticsService.track === 'function') {
      this.analyticsService.track('forum_topic_created', {
        topicId: createdTopic.id,
        category: createdTopic.category,
        citizenId: createdTopic.citizenId,
        sourceType: createdTopic.sourceType,
      });
    }

    return createdTopic;
  }

  /**
   * Retrieves a single topic by ID.
   * @param {string} id - Topic ID.
   * @returns {ForumTopic}
   */
  getTopic(id) {
    this.permission.checkReadTopic();
    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    // Increment view counter asynchronously if supported
    try {
      this.repository.updateTopic(id, { viewCount: (topic.viewCount || 0) + 1 });
    } catch (e) {
      // Non-blocking for view increment
    }

    return topic;
  }

  /**
   * Searches and lists topics.
   * @param {object} [query={}] - Search criteria.
   * @param {object} [options={}] - Options.
   * @returns {ForumTopic[]}
   */
  searchTopics(query = {}, options = {}) {
    this.permission.checkReadTopic();
    return this.repository.searchTopics(query, options);
  }

  /**
   * Updates an existing topic.
   * @param {string} id - Topic ID.
   * @param {object} updates - Updates payload.
   * @returns {ForumTopic}
   */
  updateTopic(id, updates) {
    this.permission.checkUpdateTopicOwn();
    this.validator.validateTopicUpdate(updates);

    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    if (updates.status && updates.status !== topic.status) {
      this.rule.checkStatusTransition(topic.status, updates.status);
    }

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : null;
    const updatePayload = {
      ...updates,
      updatedBy: currentUser ? currentUser.id : topic.updatedBy,
    };

    const updatedTopic = this.repository.updateTopic(id, updatePayload);

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('ForumTopicUpdated', {
        source: 'ForumService',
        payload: updatedTopic,
      });
    }

    return updatedTopic;
  }

  /**
   * Pins or unpins a topic.
   * @param {string} id - Topic ID.
   * @param {boolean} isPinned - True to pin, false to unpin.
   * @returns {ForumTopic}
   */
  pinTopic(id, isPinned) {
    this.permission.checkPinTopic();
    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: 'moderator' };
    const updates = {
      isPinned: !!isPinned,
      pinnedAt: isPinned ? new Date().toISOString() : null,
      pinnedBy: isPinned ? currentUser.id : null,
    };

    return this.repository.updateTopic(id, updates);
  }

  /**
   * Locks or unlocks a topic from new comments.
   * @param {string} id - Topic ID.
   * @param {boolean} isLocked - True to lock, false to publish.
   * @returns {ForumTopic}
   */
  lockTopic(id, isLocked) {
    this.permission.checkLockTopic();
    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    const targetStatus = isLocked ? 'LOCKED' : 'PUBLISHED';
    this.rule.checkStatusTransition(topic.status, targetStatus);

    return this.repository.updateTopic(id, { status: targetStatus });
  }

  /**
   * Moderates a topic (hide or restore).
   * @param {string} id - Topic ID.
   * @param {string} action - 'HIDE' or 'RESTORE'.
   * @param {string} [notes=null] - Moderation notes.
   * @returns {ForumTopic}
   */
  moderateTopic(id, action, notes = null) {
    this.permission.checkModerateTopic();
    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    const targetStatus = action === 'HIDE' ? 'HIDDEN' : 'PUBLISHED';
    this.rule.checkStatusTransition(topic.status, targetStatus);

    return this.repository.updateTopic(id, { status: targetStatus });
  }

  /**
   * Deletes a topic.
   * @param {string} id - Topic ID.
   * @returns {boolean}
   */
  deleteTopic(id) {
    this.permission.checkDeleteTopicOwn();
    const topic = this.repository.findTopicById(id);
    if (!topic) {
      throw new Error(`Forum topic with ID '${id}' not found.`);
    }

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: topic.citizenId };
    return this.repository.deleteTopic(id, currentUser ? currentUser.id : 'unknown');
  }

  // =========================================================================
  // COMMENT OPERATIONS
  // =========================================================================

  /**
   * Posts a new comment under a topic.
   * @param {object} payload - Comment payload { topicId, citizenId, content, parentCommentId }.
   * @returns {ForumComment}
   */
  addComment(payload) {
    this.permission.checkCreateComment();
    this.validator.validateCommentCreate(payload);

    const topic = this.repository.findTopicById(payload.topicId);
    if (!topic) {
      throw new Error(`Cannot comment: Topic '${payload.topicId}' does not exist.`);
    }

    this.rule.checkTopicNotLocked(topic);

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: payload.citizenId };
    const entityData = {
      ...payload,
      createdBy: currentUser ? currentUser.id : payload.citizenId,
      updatedBy: currentUser ? currentUser.id : payload.citizenId,
    };

    const commentEntity = ForumComment ? new ForumComment(entityData) : entityData;
    const createdComment = this.repository.createComment(commentEntity);

    // Increment topic commentCount
    const newCount = (topic.commentCount || 0) + 1;
    this.repository.updateTopic(payload.topicId, { commentCount: newCount });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('ForumCommentCreated', {
        source: 'ForumService',
        payload: createdComment,
      });
    }

    return createdComment;
  }

  /**
   * Retrieves comments for a topic.
   * @param {string} topicId - Topic ID.
   * @param {object} [options={}] - Search options.
   * @returns {ForumComment[]}
   */
  getCommentsByTopic(topicId, options = {}) {
    this.permission.checkReadTopic();
    return this.repository.findCommentsByTopicId(topicId, options);
  }

  /**
   * Deletes a comment.
   * @param {string} commentId - Comment ID.
   * @returns {boolean}
   */
  deleteComment(commentId) {
    const comment = this.repository.findCommentById(commentId);
    if (!comment) {
      throw new Error(`Comment with ID '${commentId}' not found.`);
    }

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: comment.citizenId };
    const result = this.repository.deleteComment(commentId, currentUser ? currentUser.id : 'unknown');

    // Decrement topic commentCount if successful
    if (result && comment.topicId) {
      const topic = this.repository.findTopicById(comment.topicId);
      if (topic && (topic.commentCount || 0) > 0) {
        this.repository.updateTopic(comment.topicId, { commentCount: topic.commentCount - 1 });
      }
    }

    return result;
  }

  // =========================================================================
  // VOTE OPERATIONS
  // =========================================================================

  /**
   * Casts an upvote or downvote on a topic.
   * @param {string} topicId - Topic ID.
   * @param {string} citizenId - Citizen ID.
   * @param {string} voteType - 'UPVOTE' or 'DOWNVOTE'.
   * @returns {object} Updated vote summary.
   */
  castVote(topicId, citizenId, voteType) {
    this.permission.checkCastVote();
    this.validator.validateVote({ topicId, citizenId, voteType });

    const topic = this.repository.findTopicById(topicId);
    if (!topic) {
      throw new Error(`Topic with ID '${topicId}' not found.`);
    }

    this.rule.checkTopicNotLocked(topic);

    const voteEntity = ForumVote ? new ForumVote({ topicId, citizenId, voteType }) : { topicId, citizenId, voteType };
    this.repository.castVote(voteEntity);

    // Recalculate upvotes and downvotes
    const upvotes = this.repository.countVotes(topicId, 'UPVOTE');
    const downvotes = this.repository.countVotes(topicId, 'DOWNVOTE');

    this.repository.updateTopic(topicId, { upvotes, downvotes });

    return {
      topicId,
      citizenId,
      voteType,
      upvotes,
      downvotes,
    };
  }

  // =========================================================================
  // CROSS-DOMAIN ASPIRATION INTEGRATION (DOC-016 / Blueprint §7)
  // =========================================================================

  /**
   * Creates a discussion thread automatically from an approved citizen aspiration.
   * @param {object} aspirationData - Aspiration payload.
   * @returns {ForumTopic}
   */
  createTopicFromAspiration(aspirationData) {
    const topicPayload = {
      citizenId: aspirationData.citizenId,
      title: `[Musyawarah Aspirasi] ${aspirationData.subject || aspirationData.title}`,
      content: aspirationData.description || 'Topik diskusi musyawarah aspirasi warga.',
      category: 'ASPIRASI_MUSRENBANG',
      sourceType: 'ASPIRATION',
      sourceId: aspirationData.id,
      status: 'PUBLISHED',
      tags: ['aspirasi', 'musrenbang', aspirationData.category || 'umum'],
    };

    return this.createTopic(topicPayload);
  }
}

module.exports = ForumService;

