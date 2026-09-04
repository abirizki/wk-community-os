/**
 * @file MeetingRule.js
 * @description Encapsulates business logic, schedule validation, and lifecycle transition rules for the Meeting module.
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
  };
}

class MeetingRule {
  /**
   * @param {MeetingRepository} meetingRepository
   * @param {object} [citizenRepository=null]
   */
  constructor(meetingRepository, citizenRepository = null) {
    /** @private */
    this.repository = meetingRepository;
    /** @private */
    this.citizenRepository = citizenRepository;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('MeetingRule') : console;

    /** @private */
    this.allowedStatusTransitions = {
      'DRAFT': ['SCHEDULED', 'CANCELLED'],
      'SCHEDULED': ['ONGOING', 'CANCELLED', 'ADJOURNED'],
      'ONGOING': ['CONCLUDED', 'ADJOURNED', 'CANCELLED'],
      'ADJOURNED': ['SCHEDULED', 'CANCELLED'],
      'CONCLUDED': [],
      'CANCELLED': [],
    };
  }

  /**
   * Validates if the meeting type is permitted.
   * @param {string} type - Meeting type.
   * @throws {Error} If type is invalid.
   */
  checkValidMeetingType(type) {
    const validTypes = MeetingConstants.MEETING_TYPES || [];
    if (!type || !validTypes.includes(type)) {
      throw new Error(`Invalid meeting type '${type}'. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  /**
   * Validates if the scope type is permitted.
   * @param {string} scope - Scope type ('RT', 'RW', 'KELURAHAN').
   * @throws {Error} If scope is invalid.
   */
  checkValidScopeType(scope) {
    const validScopes = MeetingConstants.SCOPE_TYPES || [];
    if (!scope || !validScopes.includes(scope)) {
      throw new Error(`Invalid scope type '${scope}'. Must be one of: ${validScopes.join(', ')}`);
    }
  }

  /**
   * Validates if the attendee role is permitted.
   * @param {string} role - Attendee role.
   * @throws {Error} If role is invalid.
   */
  checkValidRole(role) {
    const validRoles = MeetingConstants.ATTENDEE_ROLES || [];
    if (!role || !validRoles.includes(role)) {
      throw new Error(`Invalid attendee role '${role}'. Must be one of: ${validRoles.join(', ')}`);
    }
  }

  /**
   * Validates scheduling timestamps.
   * @param {string|Date} startTime - Scheduled start time.
   * @param {string|Date} endTime - Scheduled end time.
   * @param {boolean} [isNew=true] - Whether this is a new schedule creation.
   * @throws {Error} If schedule is invalid.
   */
  checkScheduleValidity(startTime, endTime, isNew = true) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    if (isNaN(start) || isNaN(end)) {
      throw new Error('Scheduled start and end times must be valid date/time values.');
    }

    if (end <= start) {
      throw new Error('Scheduled end time must be strictly after the scheduled start time.');
    }

    // Minimum meeting duration of 5 minutes
    if (end - start < 5 * 60 * 1000) {
      throw new Error('Meeting duration must be at least 5 minutes.');
    }

    if (isNew) {
      // Allow 2-minute buffer for request latency
      const now = Date.now() - 2 * 60 * 1000;
      if (start < now) {
        throw new Error('Cannot schedule a new meeting in the past.');
      }
    }
  }

  /**
   * Validates if the meeting status transition is permitted.
   * @param {string} currentStatus - Current status.
   * @param {string} nextStatus - Desired target status.
   * @throws {Error} If transition is illegal.
   */
  checkStatusTransition(currentStatus, nextStatus) {
    if (currentStatus === nextStatus) {
      return;
    }
    const allowed = this.allowedStatusTransitions[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      throw new Error(`Invalid meeting status transition from '${currentStatus}' to '${nextStatus}'.`);
    }
  }

  /**
   * Checks that the meeting is active and not concluded or cancelled.
   * @param {object} meeting - Meeting entity or record.
   * @throws {Error} If meeting is locked/concluded.
   */
  checkMeetingNotConcluded(meeting) {
    if (!meeting) {
      throw new Error('Meeting does not exist.');
    }
    if (meeting.status === 'CONCLUDED') {
      throw new Error('This meeting has been concluded and ratified. Modifying attendees or agenda is locked.');
    }
    if (meeting.status === 'CANCELLED') {
      throw new Error('This meeting has been cancelled.');
    }
  }

  /**
   * Verifies that citizen is registered if citizen repository is available.
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
}

module.exports = MeetingRule;

