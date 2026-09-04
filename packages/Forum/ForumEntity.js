/**
 * @file ForumEntity.js
 * @description Core Entity Layer for Forum Module (Epic E-11) in Warga Kebonjati (WK COMMUNITY OS).
 * Encapsulates domain models for Topics, Comments, and Votes with serialization and audit trail support.
 */

// Helper to generate UUID compatible with Google Apps Script Utilities and standard Node environments
function generateEntityUuid() {
  if (typeof Utilities !== 'undefined' && typeof Utilities.getUuid === 'function') {
    return Utilities.getUuid();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * @class ForumTopic
 * @classdesc Represents a discussion topic or thread created by citizens or generated from aspirations.
 */
class ForumTopic {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateEntityUuid();
    this.citizenId = data.citizenId;
    this.title = data.title;
    this.content = data.content;
    this.category = data.category;
    this.status = data.status || 'PUBLISHED';
    this.isPinned = typeof data.isPinned === 'boolean' ? data.isPinned : false;
    this.pinnedAt = data.pinnedAt || null;
    this.pinnedBy = data.pinnedBy || null;

    // Metrics
    this.upvotes = typeof data.upvotes === 'number' ? data.upvotes : 0;
    this.downvotes = typeof data.downvotes === 'number' ? data.downvotes : 0;
    this.viewCount = typeof data.viewCount === 'number' ? data.viewCount : 0;
    this.commentCount = typeof data.commentCount === 'number' ? data.commentCount : 0;

    // Source Reference
    this.sourceType = data.sourceType || 'DIRECT';
    this.sourceId = data.sourceId || null;
    this.tags = Array.isArray(data.tags) ? data.tags : [];

    // WK Standard Audit Trail Fields
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = typeof data.version === 'number' ? data.version : 1;
  }

  /**
   * Returns a plain JavaScript object suitable for database persistence.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      title: this.title,
      content: this.content,
      category: this.category,
      status: this.status,
      isPinned: this.isPinned,
      pinnedAt: this.pinnedAt,
      pinnedBy: this.pinnedBy,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      viewCount: this.viewCount,
      commentCount: this.commentCount,
      sourceType: this.sourceType,
      sourceId: this.sourceId,
      tags: JSON.stringify(this.tags),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  /**
   * Deserializes a raw database record into a ForumTopic entity instance.
   * @param {object} record - Database record.
   * @returns {ForumTopic|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };

    if (typeof record.tags === 'string') {
      try {
        data.tags = JSON.parse(record.tags);
      } catch (e) {
        data.tags = [];
      }
    } else if (!Array.isArray(record.tags)) {
      data.tags = [];
    }

    return new ForumTopic(data);
  }

  /**
   * Returns a sanitized object for public view.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      citizenId: this.citizenId,
      title: this.title,
      content: this.content,
      category: this.category,
      status: this.status,
      isPinned: this.isPinned,
      pinnedAt: this.pinnedAt,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      viewCount: this.viewCount,
      commentCount: this.commentCount,
      sourceType: this.sourceType,
      tags: this.tags,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * @class ForumComment
 * @classdesc Represents a citizen response or comment posted under a forum topic.
 */
class ForumComment {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateEntityUuid();
    this.topicId = data.topicId;
    this.citizenId = data.citizenId;
    this.parentCommentId = data.parentCommentId || null;
    this.content = data.content;
    this.status = data.status || 'ACTIVE';
    this.likes = typeof data.likes === 'number' ? data.likes : 0;

    // WK Standard Audit Trail Fields
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy || null;
    this.updatedBy = data.updatedBy || null;
    this.deletedAt = data.deletedAt || null;
    this.deletedBy = data.deletedBy || null;
    this.version = typeof data.version === 'number' ? data.version : 1;
  }

  /**
   * Returns a plain JavaScript object suitable for database persistence.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      topicId: this.topicId,
      citizenId: this.citizenId,
      parentCommentId: this.parentCommentId,
      content: this.content,
      status: this.status,
      likes: this.likes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      createdBy: this.createdBy,
      updatedBy: this.updatedBy,
      deletedAt: this.deletedAt,
      deletedBy: this.deletedBy,
      version: this.version,
    };
  }

  /**
   * Deserializes a raw database record into a ForumComment entity instance.
   * @param {object} record - Database record.
   * @returns {ForumComment|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new ForumComment({ ...record });
  }

  /**
   * Returns a sanitized object for public view.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      topicId: this.topicId,
      citizenId: this.citizenId,
      parentCommentId: this.parentCommentId,
      content: this.content,
      status: this.status,
      likes: this.likes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * @class ForumVote
 * @classdesc Represents an upvote or downvote cast by a citizen on a topic.
 */
class ForumVote {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateEntityUuid();
    this.topicId = data.topicId;
    this.citizenId = data.citizenId;
    this.voteType = data.voteType || 'UPVOTE';
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  /**
   * Returns a plain JavaScript object suitable for database persistence.
   * @returns {object}
   */
  toObject() {
    return {
      id: this.id,
      topicId: this.topicId,
      citizenId: this.citizenId,
      voteType: this.voteType,
      createdAt: this.createdAt,
    };
  }

  /**
   * Deserializes a raw database record into a ForumVote entity instance.
   * @param {object} record - Database record.
   * @returns {ForumVote|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new ForumVote({ ...record });
  }
}

/**
 * @class ForumConstants
 * @classdesc Enumerations and lookup constants for the Forum module.
 */
class ForumConstants {
  static get CATEGORIES() {
    return [
      'INFRASTRUKTUR',
      'LINGKUNGAN',
      'KEAMANAN',
      'KEGIATAN_WARGA',
      'UMUM',
      'ASPIRASI_MUSRENBANG',
    ];
  }

  static get STATUSES() {
    return ['DRAFT', 'PUBLISHED', 'LOCKED', 'ARCHIVED', 'HIDDEN'];
  }

  static get COMMENT_STATUSES() {
    return ['ACTIVE', 'FLAGGED', 'HIDDEN'];
  }

  static get VOTE_TYPES() {
    return ['UPVOTE', 'DOWNVOTE'];
  }

  static get SOURCE_TYPES() {
    return ['DIRECT', 'ASPIRATION'];
  }
}

module.exports = {
  ForumTopic,
  ForumComment,
  ForumVote,
  ForumConstants,
};

