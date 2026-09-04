/**
 * @file MeetingSeeder.js
 * @description Seeds initial lookup groups and metadata items for the Meeting module with idempotency.
 */

// Import or fallback to MeetingConstants
let MeetingConstants;
try {
  ({ MeetingConstants } = require('./MeetingEntity.js'));
} catch (e) {
  MeetingConstants = {
    MEETING_TYPES: ['RUTIN_RT', 'RUTIN_RW', 'MUSRENBANG_KELURAHAN', 'RAPAT_DARURAT', 'KOORDINASI_PENGURUS', 'SOSIALISASI_WARGA'],
    SCOPE_TYPES: ['RT', 'RW', 'KELURAHAN'],
    MEETING_STATUSES: ['DRAFT', 'SCHEDULED', 'ONGOING', 'CONCLUDED', 'CANCELLED', 'ADJOURNED'],
    ATTENDEE_ROLES: ['CHAIRPERSON', 'SECRETARY', 'SPEAKER', 'MEMBER', 'INVITED_GUEST', 'OBSERVER'],
    INVITATION_STATUSES: ['INVITED', 'CONFIRMED', 'DECLINED', 'TENTATIVE'],
    ATTENDANCE_STATUSES: ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'],
    AGENDA_STATUSES: ['PENDING', 'IN_DISCUSSION', 'CONCLUDED', 'SKIPPED'],
  };
}

class MeetingSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('MeetingSeeder') : console;
  }

  /**
   * Executes all seeding operations for the Meeting package.
   */
  run() {
    if (!this.db) {
      if (this.logger.warn) this.logger.warn('Database adapter not available. Skipping MeetingSeeder.run.');
      return;
    }

    if (this.logger.info) this.logger.info('Running Meeting package seeder...');

    try {
      this._seedMeetingTypes();
      this._seedScopeTypes();
      this._seedMeetingStatuses();
      this._seedAttendeeRoles();
      this._seedInvitationStatuses();
      this._seedAttendanceStatuses();
      this._seedAgendaStatuses();

      if (this.logger.info) this.logger.info('Meeting package seeder completed successfully.');
    } catch (e) {
      if (this.logger.error) this.logger.error(`Meeting seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * Checks if the meeting lookup groups have already been seeded.
   * @returns {boolean}
   */
  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('lookup_groups') && typeof db.findOne === 'function') {
      const existing = db.findOne('lookup_groups', { name: 'MEETING_TYPE' });
      return !!existing;
    }

    if (db.hasTable('system_lookups') && typeof db.search === 'function') {
      const items = db.search('system_lookups', { lookupType: 'MEETING_TYPE' });
      return Array.isArray(items) && items.length > 0;
    }

    return false;
  }

  /**
   * Checks if any data exists in meeting tables.
   * @returns {boolean}
   */
  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('meetings')) {
      if (typeof db.count === 'function') {
        return db.count('meetings', {}) > 0;
      }
      if (typeof db.search === 'function') {
        const records = db.search('meetings', {});
        return Array.isArray(records) && records.length > 0;
      }
    }

    return false;
  }

  // =========================================================================
  // PRIVATE SEEDING HELPERS (IDEMPOTENT)
  // =========================================================================

  /** @private */
  _seedMeetingTypes() {
    const types = (MeetingConstants && MeetingConstants.MEETING_TYPES) || [];
    const items = types.map((type, idx) => ({
      name: type,
      code: type,
      value: this._formatLabel(type),
      displayOrder: idx + 1,
      description: `Jenis pertemuan/musyawarah: ${this._formatLabel(type)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('MEETING_TYPE', 'Jenis-jenis pertemuan dan musyawarah warga', items);
  }

  /** @private */
  _seedScopeTypes() {
    const scopes = (MeetingConstants && MeetingConstants.SCOPE_TYPES) || [];
    const items = scopes.map((scope, idx) => ({
      name: scope,
      code: scope,
      value: scope,
      displayOrder: idx + 1,
      description: `Lingkup wilayah pertemuan: ${scope}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('SCOPE_TYPE', 'Lingkup wilayah administrasi musyawarah', items);
  }

  /** @private */
  _seedMeetingStatuses() {
    const statuses = (MeetingConstants && MeetingConstants.MEETING_STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status siklus hidup pertemuan: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('MEETING_STATUS', 'Status siklus hidup pertemuan', items);
  }

  /** @private */
  _seedAttendeeRoles() {
    const roles = (MeetingConstants && MeetingConstants.ATTENDEE_ROLES) || [];
    const items = roles.map((role, idx) => ({
      name: role,
      code: role,
      value: this._formatLabel(role),
      displayOrder: idx + 1,
      description: `Peran peserta pertemuan: ${this._formatLabel(role)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('ATTENDEE_ROLE', 'Peran kepengurusan dan peserta rapat', items);
  }

  /** @private */
  _seedInvitationStatuses() {
    const statuses = (MeetingConstants && MeetingConstants.INVITATION_STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status undangan: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('INVITATION_STATUS', 'Status respon undangan rapat', items);
  }

  /** @private */
  _seedAttendanceStatuses() {
    const statuses = (MeetingConstants && MeetingConstants.ATTENDANCE_STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status kehadiran fisik/presensi: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('ATTENDANCE_STATUS', 'Status presensi kehadiran rapat', items);
  }

  /** @private */
  _seedAgendaStatuses() {
    const statuses = (MeetingConstants && MeetingConstants.AGENDA_STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status agenda pembahasan: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('AGENDA_STATUS', 'Status pembahasan agenda musyawarah', items);
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

module.exports = MeetingSeeder;

