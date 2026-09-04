/**
 * @file MeetingValidator.js
 * @description Provides payload validation for meetings, attendees, and agenda items.
 */

class MeetingValidator {
  /**
   * @param {MeetingRule} [meetingRule=null]
   */
  constructor(meetingRule = null) {
    /** @private */
    this.rule = meetingRule;
  }

  /**
   * Validates the payload for creating a new meeting.
   * @param {object} payload - Meeting creation payload.
   * @throws {Error} If validation fails.
   */
  validateMeetingCreate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Meeting payload is required and must be an object.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Meeting title is required.');
    }
    if (!payload.meetingType || typeof payload.meetingType !== 'string') {
      throw new Error('Meeting type is required.');
    }
    if (!payload.scopeType || typeof payload.scopeType !== 'string') {
      throw new Error('Meeting scopeType (RT/RW/KELURAHAN) is required.');
    }
    if (!payload.scopeId || typeof payload.scopeId !== 'string' || payload.scopeId.trim() === '') {
      throw new Error('Meeting scopeId is required.');
    }
    if (!payload.venue || typeof payload.venue !== 'string' || payload.venue.trim() === '') {
      throw new Error('Meeting venue or location is required.');
    }
    if (!payload.scheduledStartTime) {
      throw new Error('Meeting scheduled start time is required.');
    }
    if (!payload.scheduledEndTime) {
      throw new Error('Meeting scheduled end time is required.');
    }

    if (this.rule) {
      if (typeof this.rule.checkValidMeetingType === 'function') {
        this.rule.checkValidMeetingType(payload.meetingType);
      }
      if (typeof this.rule.checkValidScopeType === 'function') {
        this.rule.checkValidScopeType(payload.scopeType);
      }
      if (typeof this.rule.checkScheduleValidity === 'function') {
        this.rule.checkScheduleValidity(payload.scheduledStartTime, payload.scheduledEndTime, true);
      }
      if (payload.organizerCitizenId && typeof this.rule.checkCitizenExists === 'function') {
        this.rule.checkCitizenExists(payload.organizerCitizenId);
      }
    }
  }

  /**
   * Validates the payload for updating an existing meeting.
   * @param {object} payload - Meeting update payload.
   * @throws {Error} If validation fails.
   */
  validateMeetingUpdate(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Update payload is required.');
    }

    const immutableFields = ['scopeId', 'scopeType', 'createdAt'];
    for (const field of immutableFields) {
      if (payload[field] !== undefined) {
        throw new Error(`Field '${field}' cannot be modified during an update.`);
      }
    }

    if (payload.meetingType && this.rule && typeof this.rule.checkValidMeetingType === 'function') {
      this.rule.checkValidMeetingType(payload.meetingType);
    }

    if (payload.scheduledStartTime && payload.scheduledEndTime && this.rule && typeof this.rule.checkScheduleValidity === 'function') {
      this.rule.checkScheduleValidity(payload.scheduledStartTime, payload.scheduledEndTime, false);
    }
  }

  /**
   * Validates the payload for adding an attendee.
   * @param {object} payload - Attendee payload { meetingId, citizenId, role }.
   * @throws {Error} If validation fails.
   */
  validateAttendeeAdd(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Attendee payload is required.');
    }
    if (!payload.meetingId || typeof payload.meetingId !== 'string') {
      throw new Error('Meeting ID is required to add an attendee.');
    }
    if (!payload.citizenId || typeof payload.citizenId !== 'string') {
      throw new Error('Citizen ID is required to add an attendee.');
    }

    if (payload.role && this.rule && typeof this.rule.checkValidRole === 'function') {
      this.rule.checkValidRole(payload.role);
    }
    if (this.rule && typeof this.rule.checkCitizenExists === 'function') {
      this.rule.checkCitizenExists(payload.citizenId);
    }
  }

  /**
   * Validates the payload for adding an agenda item.
   * @param {object} payload - Agenda payload { meetingId, title, agendaOrder }.
   * @throws {Error} If validation fails.
   */
  validateAgendaAdd(payload) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Agenda payload is required.');
    }
    if (!payload.meetingId || typeof payload.meetingId !== 'string') {
      throw new Error('Meeting ID is required to add an agenda item.');
    }
    if (!payload.title || typeof payload.title !== 'string' || payload.title.trim() === '') {
      throw new Error('Agenda title is required.');
    }
    if (payload.agendaOrder !== undefined && typeof payload.agendaOrder !== 'number') {
      throw new Error('Agenda order must be a number.');
    }
  }
}

module.exports = MeetingValidator;

