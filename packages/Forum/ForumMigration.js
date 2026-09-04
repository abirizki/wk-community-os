/**
 * @file ForumMigration.js
 * @description Handles database schema migrations and indexing for Forum module (Epic E-11).
 */

class ForumMigration {
  /**
   * Returns the migration version string.
   * @returns {string}
   */
  static migrationVersion() {
    return '1.0.0';
  }

  /**
   * Indicates if seeding is required after migration execution.
   * @returns {boolean}
   */
  static seedRequired() {
    return true;
  }

  /**
   * Applies schema migrations to create forum_topics, forum_comments, and forum_votes tables.
   */
  static up() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' 
      ? WK.logger('ForumMigration.up') 
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' 
      ? WK.database() 
      : null;

    if (!db) {
      if (logger.warn) logger.warn('Database adapter not available. Skipping ForumMigration.up.');
      return;
    }

    if (logger.info) logger.info('Running migrations for Forum package...');

    try {
      // 1. Table: forum_topics
      const topicTable = 'forum_topics';
      if (!db.hasTable(topicTable)) {
        db.createTable(topicTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'citizenId', type: 'string', notNull: true },
          { name: 'title', type: 'string', notNull: true },
          { name: 'content', type: 'text', notNull: true },
          { name: 'category', type: 'string', notNull: true },
          { name: 'status', type: 'string', notNull: true, default: 'PUBLISHED' },
          { name: 'isPinned', type: 'boolean', default: false },
          { name: 'pinnedAt', type: 'datetime' },
          { name: 'pinnedBy', type: 'string' },
          { name: 'upvotes', type: 'integer', default: 0 },
          { name: 'downvotes', type: 'integer', default: 0 },
          { name: 'viewCount', type: 'integer', default: 0 },
          { name: 'commentCount', type: 'integer', default: 0 },
          { name: 'sourceType', type: 'string', default: 'DIRECT' },
          { name: 'sourceId', type: 'string' },
          { name: 'tags', type: 'text' },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(topicTable, 'citizenId');
          db.ensureIndex(topicTable, 'category');
          db.ensureIndex(topicTable, 'status');
          db.ensureIndex(topicTable, 'isPinned');
          db.ensureIndex(topicTable, 'sourceType');
          db.ensureIndex(topicTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${topicTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${topicTable}' already exists. Skipping creation.`);
      }

      // 2. Table: forum_comments
      const commentTable = 'forum_comments';
      if (!db.hasTable(commentTable)) {
        db.createTable(commentTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'topicId', type: 'string', notNull: true },
          { name: 'citizenId', type: 'string', notNull: true },
          { name: 'parentCommentId', type: 'string' },
          { name: 'content', type: 'text', notNull: true },
          { name: 'status', type: 'string', notNull: true, default: 'ACTIVE' },
          { name: 'likes', type: 'integer', default: 0 },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(commentTable, 'topicId');
          db.ensureIndex(commentTable, 'citizenId');
          db.ensureIndex(commentTable, 'createdAt');
          db.ensureIndex(commentTable, 'status');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${commentTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${commentTable}' already exists. Skipping creation.`);
      }

      // 3. Table: forum_votes
      const voteTable = 'forum_votes';
      if (!db.hasTable(voteTable)) {
        db.createTable(voteTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'topicId', type: 'string', notNull: true },
          { name: 'citizenId', type: 'string', notNull: true },
          { name: 'voteType', type: 'string', notNull: true },
          { name: 'createdAt', type: 'datetime', notNull: true },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(voteTable, 'topicId');
          db.ensureIndex(voteTable, 'citizenId');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${voteTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${voteTable}' already exists. Skipping creation.`);
      }

    } catch (e) {
      if (logger.error) logger.error(`Failed to run migration for Forum package: ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts migration changes by dropping forum tables in reverse dependency order.
   */
  static down() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' 
      ? WK.logger('ForumMigration.down') 
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' 
      ? WK.database() 
      : null;

    if (!db) return;

    const tables = ['forum_votes', 'forum_comments', 'forum_topics'];
    tables.forEach(tableName => {
      if (db.hasTable(tableName)) {
        db.dropTable(tableName);
        if (logger.info) logger.info(`Successfully dropped table '${tableName}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${tableName}' does not exist. Nothing to drop.`);
      }
    });
  }
}

module.exports = ForumMigration;

