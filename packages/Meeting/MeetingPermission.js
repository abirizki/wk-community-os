/**
 * @file MeetingPermission.js
 * @description Role-Based Access Control (RBAC) authorization layer for the Meeting module.
 */

class MeetingPermission {
  /**
   * @param {object} [security=null] - Security service instance.
   */
  constructor(security = null) {
    /** @private */
    this.security = security || (typeof WK !== 'undefined' && typeof WK.security === 'function' ? WK.security() : null);
  }

  /**
   * Checks if the active user possesses the given permission. Throws an Error if denied.
   * @param {string} permission - The permission string to verify.
   * @throws {Error} If permission is denied.
   */
  check(permission) {
    if (this.security && typeof this.security.checkPermission === 'function') {
      try {
        this.security.checkPermission(permission);
      } catch (e) {
        throw new Error(`Meeting Permission denied for '${permission}': ${e.message}`);
      }
    }
  }

  /**
   * Verifies if the active user possesses the given permission without throwing.
   * @param {string} permission - The permission string to verify.
   * @returns {boolean}
   */
  has(permission) {
    if (this.security && typeof this.security.hasPermission === 'function') {
      try {
        return this.security.hasPermission(permission);
      } catch (e) {
        return false;
      }
    }
    return true;
  }

  // --- Granular Permission Checks ---

  checkReadOwnScope() {
    this.check('meeting.read.own_scope');
  }

  checkCreateMeeting() {
    this.check('meeting.create');
  }

  checkScheduleMeeting() {
    this.check('meeting.schedule');
  }

  checkStartMeeting() {
    this.check('meeting.start');
  }

  checkRecordAttendance() {
    this.check('meeting.attendance.record');
  }

  checkManageAgenda() {
    this.check('meeting.agenda.manage');
  }

  checkConcludeMeeting() {
    this.check('meeting.conclude');
  }

  checkCancelMeeting() {
    this.check('meeting.cancel');
  }

  checkViewStatistics() {
    this.check('meeting.statistics.view');
  }

  /**
   * Returns metadata for all registered Meeting permissions.
   * @returns {object[]}
   */
  static getPermissions() {
    return [
      { id: 'meeting.read.own_scope', description: 'Read meetings and minutes within citizen scope (RT/RW)' },
      { id: 'meeting.create', description: 'Create draft meeting and specify agenda outline' },
      { id: 'meeting.schedule', description: 'Publish meeting schedule and dispatch invitations' },
      { id: 'meeting.start', description: 'Open and start official meeting session' },
      { id: 'meeting.attendance.record', description: 'Record participant attendance and check-in times' },
      { id: 'meeting.agenda.manage', description: 'Manage discussion notes, conclusions, and action items' },
      { id: 'meeting.conclude', description: 'Ratify final minutes and conclude the meeting' },
      { id: 'meeting.cancel', description: 'Cancel scheduled meeting' },
      { id: 'meeting.statistics.view', description: 'View governance meeting metrics and participation stats' },
    ];
  }
}

module.exports = MeetingPermission;

