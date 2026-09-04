/**
 * @file ForumRule.js
 * @description Encapsulates business logic, status transition validation, and domain rules for the Forum module.
 */

// Import or fallback to ForumConstants
let ForumConstants;
try {
  ({ ForumConstants } = require('./ForumEntity.js'));
} catch (e) {
  ForumConstants = {
    CATEGORIES: ['INFRASTRUKTUR', 'LINGKUNGAN', 'KEAMANAN', 'KEGIATAN_WARGA', 'UMUM', 'ASPIRASI_MUSRENBANG'],
    STATUSES: ['DRAFT', 'PUBLISHED', 'LOCKED', 'ARCHIVED', 'HIDDEN'],
    COMMENT_STATUSES: ['ACTIVE', 'FLAGGED', 'HIDDEN'],
    VOTE_TYPES: ['UPVOTE', 'DOWNVOTE'],
  };
}

class ForumRule {
  /**
   * @param {ForumRepository} forumRepository
   * @param {object} [citizenRepository=null]
   */
  constructor(forumRepository, citizenRepository = null) {
    /** @private */
    this.repository = forumRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ForumRule') : console;

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['PUBLISHED'],
      'PUBLISHED': ['LOCKED', 'ARCHIVED', 'HIDDEN'],
      'LOCKED': ['PUBLISHED', 'ARCHIVED', 'HIDDEN'],
      'ARCHIVED': [],
      'HIDDEN': ['PUBLISHED', 'ARCHIVED'],
    };
  }

  /**
   * Validates if the category is allowed.
   * @param {string} category - Category string.
   * @throws {Error} If category is invalid.
   */
  checkValidCategory(category) {
    const validCategories = ForumConstants.CATEGORIES || [];
    if (!category || !validCategories.includes(category)) {
      throw new Error(`Invalid forum category '${category}'. Must be one of: ${validCategories.join(', ')}`);
    }
  }

  /**
   * Validates if the status transition is permitted by business rules.
   * @param {string} currentStatus - Current topic status.
   * @param {string} nextStatus - Desired target status.
   * @throws {Error} If transition is illegal.
   */
  checkStatusTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
      return;
    }
    const allowed = this.allowedStatusTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid forum topic status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }

  /**
   * Validates that a topic is open and not locked or archived.
   * @param {object} topic - The topic entity or record.
   * @throws {Error} If topic cannot accept new comments or interaction.
   */
  checkTopicNotLocked(topic) {
    if (!topic) {
      throw new Error('Topic does not exist.');
    }
    if (topic.status === 'LOCKED') {
      throw new Error('This forum topic is locked. New comments and interactions are closed.');
    }
    if (topic.status === 'ARCHIVED') {
      throw new Error('This forum topic is archived.');
    }
    if (topic.status === 'HIDDEN') {
      throw new Error('This forum topic has been moderated/hidden.');
    }
  }

  /**
   * Verifies that the citizen is registered and active.
   * @param {string} citizenId - ID of citizen.
   * @throws {Error} If citizen does not exist.
   */
  checkCitizenExists(citizenId) {
    if (this.citizenRepository && typeof this.citizenRepository.exists === 'function') {
      const exists = this.citizenRepository.exists(citizenId);
      if (!exists) {
        throw new Error(`Citizen with ID '${citizenId}' not found.`);
      }
    }
  }

  /**
   * Anti-spam rate limit validation placeholder.
   * @param {string} citizenId - ID of citizen.
   * @returns {boolean} True if within rate limits.
   */
  checkAntiSpam(citizenId) {
    // Placeholder rate limiter check (returns true for baseline)
    return true;
  }
}

module.exports = ForumRule;

