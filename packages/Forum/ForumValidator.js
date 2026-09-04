/**
 * @file ForumValidator.js
 * @description Provides payload validation for forum topics, comments, and votes.
 */

class ForumValidator {
  /**
   * @param {ForumRule} [forumRule=null]
   */
  constructor(forumRule = null) {
    /** @private */
    this.rule = forumRule;
  }

  /**
   * Validates the payload for creating a new topic.
   * @param {object} payload - Topic creation data.
   * @throws {Error} If validation fails.
   */
  validateTopicCreate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Topic payload is required and must be an object.');
    }
    if (!payload.citizenId || typeof payload.citizenId !== 'string' || payload.citizenId.trim() === '') {
      throw new Error('Citizen ID is required to create a forum topic.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Topic title is required.');
    }
    if (!payload.content || typeof payload.content !== 'string' || payload.content.trim() === '') {
      throw new Error('Topic content is required.');
    }
    if (!payload.category || typeof payload.category !== 'string' || payload.category.trim() === '') {
      throw new Error('Topic category is required.');
    }

    if (this.rule) {
      if (typeof this.rule.checkValidCategory === 'function') {
        this.rule.checkValidCategory(payload.category);
      }
      if (typeof this.rule.checkCitizenExists === 'function') {
        this.rule.checkCitizenExists(payload.citizenId);
      }
      if (typeof this.rule.checkAntiSpam === 'function') {
        this.rule.checkAntiSpam(payload.citizenId);
      }
    }
  }

  /**
   * Validates the payload for updating an existing topic.
   * @param {object} payload - Topic update data.
   * @throws {Error} If validation fails.
   */
  validateTopicUpdate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Update payload is required.');
    }

    const immutableFields = ['citizenId', 'sourceType', 'sourceId', 'createdAt'];
    for (const field of immutableFields) {
      if (payload[field] !== undefined) {
        throw new Error(`Field '${field}' cannot be modified during an update.`);
      }
    }

    if (payload.category && this.rule && typeof this.rule.checkValidCategory === 'function') {
      this.rule.checkValidCategory(payload.category);
    }
  }

  /**
   * Validates the payload for posting a new comment.
   * @param {object} payload - Comment creation data.
   * @throws {Error} If validation fails.
   */
  validateCommentCreate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Comment payload is required and must be an object.');
    }
    if (!payload.topicId || typeof payload.topicId !== 'string' || payload.topicId.trim() === '') {
      throw new Error('Topic ID is required to post a comment.');
    }
    if (!payload.citizenId || typeof payload.citizenId !== 'string' || payload.citizenId.trim() === '') {
      throw new Error('Citizen ID is required to post a comment.');
    }
    if (!payload.content || typeof payload.content !== 'string' || payload.content.trim() === '') {
      throw new Error('Comment content is required.');
    }

    if (this.rule && typeof this.rule.checkCitizenExists === 'function') {
      this.rule.checkCitizenExists(payload.citizenId);
    }
  }

  /**
   * Validates the payload for casting a vote.
   * @param {object} payload - Vote payload { topicId, citizenId, voteType }.
   * @throws {Error} If validation fails.
   */
  validateVote(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Vote payload is required.');
    }
    if (!payload.topicId || typeof payload.topicId !== 'string') {
      throw new Error('Topic ID is required to cast a vote.');
    }
    if (!payload.citizenId || typeof payload.citizenId !== 'string') {
      throw new Error('Citizen ID is required to cast a vote.');
    }
    if (!payload.voteType || !['UPVOTE', 'DOWNVOTE'].includes(payload.voteType)) {
      throw new Error("Vote type must be either 'UPVOTE' or 'DOWNVOTE'.");
    }
  }
}

module.exports = ForumValidator;

