/**
 * @file ForumSeeder.js
 * @description Seeds initial lookup groups and metadata items for the Forum package with idempotency.
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

class ForumSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ForumSeeder') : console;
  }

  /**
   * Executes all seeding operations for the Forum package.
   */
  run() {
    if (!this.db) {
      if (this.logger.warn) this.logger.warn('Database adapter not available. Skipping ForumSeeder.run.');
      return;
    }

    if (this.logger.info) this.logger.info('Running Forum package seeder...');

    try {
      this._seedCategories();
      this._seedStatuses();
      this._seedCommentStatuses();
      this._seedVoteTypes();

      if (this.logger.info) this.logger.info('Forum package seeder completed successfully.');
    } catch (e) {
      if (this.logger.error) this.logger.error(`Forum seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * Checks if the forum lookup groups have already been seeded.
   * @returns {boolean}
   */
  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('lookup_groups') && typeof db.findOne === 'function') {
      const existing = db.findOne('lookup_groups', { name: 'FORUM_CATEGORY' });
      return !!existing;
    }

    if (db.hasTable('system_lookups') && typeof db.search === 'function') {
      const items = db.search('system_lookups', { lookupType: 'FORUM_CATEGORY' });
      return Array.isArray(items) && items.length > 0;
    }

    return false;
  }

  /**
   * Checks if any data exists in forum tables.
   * @returns {boolean}
   */
  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('forum_topics')) {
      if (typeof db.count === 'function') {
        return db.count('forum_topics', {}) > 0;
      }
      if (typeof db.search === 'function') {
        const topics = db.search('forum_topics', {});
        return Array.isArray(topics) && topics.length > 0;
      }
    }

    return false;
  }

  // =========================================================================
  // PRIVATE SEEDING HELPERS (IDEMPOTENT)
  // =========================================================================

  /** @private */
  _seedCategories() {
    const categories = (ForumConstants && ForumConstants.CATEGORIES) || [
      'INFRASTRUKTUR', 'LINGKUNGAN', 'KEAMANAN', 'KEGIATAN_WARGA', 'UMUM', 'ASPIRASI_MUSRENBANG'
    ];
    const items = categories.map((cat, idx) => ({
      name: cat,
      code: cat,
      value: this._formatLabel(cat),
      displayOrder: idx + 1,
      description: `Kategori forum: ${this._formatLabel(cat)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('FORUM_CATEGORY', 'Kategori topik diskusi forum warga', items);
  }

  /** @private */
  _seedStatuses() {
    const statuses = (ForumConstants && ForumConstants.STATUSES) || [
      'DRAFT', 'PUBLISHED', 'LOCKED', 'ARCHIVED', 'HIDDEN'
    ];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status topik forum: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('FORUM_STATUS', 'Status siklus hidup topik forum', items);
  }

  /** @private */
  _seedCommentStatuses() {
    const statuses = (ForumConstants && ForumConstants.COMMENT_STATUSES) || [
      'ACTIVE', 'FLAGGED', 'HIDDEN'
    ];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status moderasi komentar: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('FORUM_COMMENT_STATUS', 'Status komentar forum', items);
  }

  /** @private */
  _seedVoteTypes() {
    const voteTypes = (ForumConstants && ForumConstants.VOTE_TYPES) || ['UPVOTE', 'DOWNVOTE'];
    const items = voteTypes.map((type, idx) => ({
      name: type,
      code: type,
      value: this._formatLabel(type),
      displayOrder: idx + 1,
      description: `Jenis vote respon forum: ${type}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('FORUM_VOTE_TYPE', 'Jenis dukungan voting topik forum', items);
  }

  /**
   * Idempotently seeds lookup group and items across available schema variants.
   * @private
   * @param {string} groupName
   * @param {string} description
   * @param {object[]} items
   */
  _seedLookupGroup(groupName, description, items) {
    // 1. Variant: lookup_groups & lookup_items
    if (this.db.hasTable('lookup_groups') && typeof this.db.create === 'function') {
      let group = typeof this.db.findOne === 'function' ? this.db.findOne('lookup_groups', { name: groupName }) : null;
      if (!group) {
        group = this.db.create('lookup_groups', {
          name: groupName,
          description: description,
          createdAt: new Date().toISOString(),
        });
      }

      if (group && this.db.hasTable('lookup_items')) {
        items.forEach(item => {
          let existingItem = null;
          if (typeof this.db.findOne === 'function') {
            existingItem = this.db.findOne('lookup_items', { groupId: group.id, name: item.name });
          }
          if (!existingItem) {
            this.db.create('lookup_items', {
              groupId: group.id,
              name: item.name,
              displayOrder: item.displayOrder,
              description: item.description,
              createdAt: item.createdAt,
            });
          }
        });
      }
    }

    // 2. Variant: system_lookups
    if (this.db.hasTable('system_lookups') && typeof this.db.create === 'function') {
      items.forEach(item => {
        let existing = null;
        if (typeof this.db.findOne === 'function') {
          existing = this.db.findOne('system_lookups', { lookupType: groupName, code: item.code });
        }
        if (!existing) {
          this.db.create('system_lookups', {
            lookupType: groupName,
            code: item.code,
            value: item.value,
            displayOrder: item.displayOrder,
            createdAt: item.createdAt,
          });
        }
      });
    }
  }

  /**
   * Converts SNAKE_CASE / CONSTANT string to Capitalized Title.
   * @private
   */
  _formatLabel(str) {
    if (!str) return '';
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

module.exports = ForumSeeder;

