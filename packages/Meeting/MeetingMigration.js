/**
 * @file MeetingMigration.js
 * @description Handles database schema migrations and indexing for Meeting module (Epic Governance / Package P20).
 */

class MeetingMigration {
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
   * Applies schema migrations to create meetings, meeting_attendees, and meeting_agendas tables.
   */
  static up() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('MeetingMigration.up')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) {
      if (logger.warn) logger.warn('Database adapter not available. Skipping MeetingMigration.up.');
      return;
    }

    if (logger.info) logger.info('Running migrations for Meeting package...');

    try {
      // 1. Table: meetings
      const meetingTable = 'meetings';
      if (!db.hasTable(meetingTable)) {
        db.createTable(meetingTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'title', type: 'string', notNull: true },
          { name: 'description', type: 'text' },
          { name: 'meetingType', type: 'string', notNull: true, default: 'RUTIN_RT' },
          { name: 'scopeType', type: 'string', notNull: true, default: 'RT' },
          { name: 'scopeId', type: 'string', notNull: true },
          { name: 'venue', type: 'string', notNull: true },
          { name: 'meetingUrl', type: 'string' },
          { name: 'scheduledStartTime', type: 'datetime', notNull: true },
          { name: 'scheduledEndTime', type: 'datetime', notNull: true },
          { name: 'actualStartTime', type: 'datetime' },
          { name: 'actualEndTime', type: 'datetime' },
          { name: 'organizerCitizenId', type: 'string' },
          { name: 'chairpersonCitizenId', type: 'string' },
          { name: 'secretaryCitizenId', type: 'string' },
          { name: 'quorumCount', type: 'integer', default: 0 },
          { name: 'totalInvited', type: 'integer', default: 0 },
          { name: 'totalAttended', type: 'integer', default: 0 },
          { name: 'status', type: 'string', notNull: true, default: 'DRAFT' },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(meetingTable, 'scopeId');
          db.ensureIndex(meetingTable, 'scopeType');
          db.ensureIndex(meetingTable, 'meetingType');
          db.ensureIndex(meetingTable, 'status');
          db.ensureIndex(meetingTable, 'scheduledStartTime');
          db.ensureIndex(meetingTable, 'organizerCitizenId');
          db.ensureIndex(meetingTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${meetingTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${meetingTable}' already exists. Skipping creation.`);
      }

      // 2. Table: meeting_attendees
      const attendeeTable = 'meeting_attendees';
      if (!db.hasTable(attendeeTable)) {
        db.createTable(attendeeTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'meetingId', type: 'string', notNull: true },
          { name: 'citizenId', type: 'string', notNull: true },
          { name: 'role', type: 'string', notNull: true, default: 'MEMBER' },
          { name: 'invitationStatus', type: 'string', notNull: true, default: 'INVITED' },
          { name: 'attendanceStatus', type: 'string', notNull: true, default: 'ABSENT' },
          { name: 'checkInTime', type: 'datetime' },
          { name: 'checkOutTime', type: 'datetime' },
          { name: 'signatureUrl', type: 'string' },
          { name: 'notes', type: 'text' },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(attendeeTable, 'meetingId');
          db.ensureIndex(attendeeTable, 'citizenId');
          db.ensureIndex(attendeeTable, 'attendanceStatus');
          db.ensureIndex(attendeeTable, 'role');
          db.ensureIndex(attendeeTable, 'createdAt');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${attendeeTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${attendeeTable}' already exists. Skipping creation.`);
      }

      // 3. Table: meeting_agendas
      const agendaTable = 'meeting_agendas';
      if (!db.hasTable(agendaTable)) {
        db.createTable(agendaTable, [
          { name: 'id', type: 'string', primaryKey: true, notNull: true },
          { name: 'meetingId', type: 'string', notNull: true },
          { name: 'agendaOrder', type: 'integer', notNull: true, default: 1 },
          { name: 'title', type: 'string', notNull: true },
          { name: 'description', type: 'text' },
          { name: 'allocatedMinutes', type: 'integer', default: 15 },
          { name: 'status', type: 'string', notNull: true, default: 'PENDING' },
          { name: 'discussionNotes', type: 'text' },
          { name: 'decisionSummary', type: 'text' },
          { name: 'actionItems', type: 'text', default: '[]' },
          { name: 'createdAt', type: 'datetime', notNull: true },
          { name: 'updatedAt', type: 'datetime', notNull: true },
          { name: 'createdBy', type: 'string' },
          { name: 'updatedBy', type: 'string' },
          { name: 'deletedAt', type: 'datetime' },
          { name: 'deletedBy', type: 'string' },
          { name: 'version', type: 'integer', notNull: true, default: 1 },
        ]);

        if (typeof db.ensureIndex === 'function') {
          db.ensureIndex(agendaTable, 'meetingId');
          db.ensureIndex(agendaTable, 'status');
          db.ensureIndex(agendaTable, 'agendaOrder');
        }

        if (logger.info) logger.info(`Successfully created table and indexes for '${agendaTable}'.`);
      } else {
        if (logger.warn) logger.warn(`Table '${agendaTable}' already exists. Skipping creation.`);
      }

    } catch (e) {
      if (logger.error) logger.error(`Failed to run migration for Meeting package: ${e.message}`);
      throw e;
    }
  }

  /**
   * Reverts migration changes by dropping meeting tables in reverse dependency order.
   */
  static down() {
    const logger = typeof WK !== 'undefined' && typeof WK.logger === 'function'
      ? WK.logger('MeetingMigration.down')
      : console;
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function'
      ? WK.database()
      : null;

    if (!db) return;

    const tables = ['meeting_agendas', 'meeting_attendees', 'meetings'];
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

module.exports = MeetingMigration;

