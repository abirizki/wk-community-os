/**
 * @file MeetingService.js
 * @description Core business service orchestrating the lifecycle of governance meetings, agendas, attendance, and minutes.
 */

// Import Entity models if available
let Meeting, MeetingAttendee, MeetingAgenda;
try {
  ({ Meeting, MeetingAttendee, MeetingAgenda } = require('./MeetingEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class MeetingService {
  /**
   * @param {MeetingRepository} meetingRepository
   * @param {MeetingValidator} meetingValidator
   * @param {MeetingPermission} meetingPermission
   * @param {MeetingRule} meetingRule
   * @param {object} [eventBus=null]
   * @param {object} [analyticsService=null]
   */
  constructor(
    meetingRepository,
    meetingValidator,
    meetingPermission,
    meetingRule,
    eventBus = null,
    analyticsService = null
  ) {
    /** @private */
    this.repository = meetingRepository;
    /** @private */
    this.validator = meetingValidator;
    /** @private */
    this.permission = meetingPermission;
    /** @private */
    this.rule = meetingRule;
    /** @private */
    this.eventBus = eventBus || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('eventbus') : null);
    /** @private */
    this.analyticsService = analyticsService || (typeof WK !== 'undefined' && typeof WK.service === 'function' ? WK.service('AnalyticsService') : null);
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('MeetingService') : console;
  }

  // =========================================================================
  // MEETING LIFECYCLE OPERATIONS
  // =========================================================================

  /**
   * Creates a draft meeting.
   * @param {object} payload - Meeting creation payload.
   * @returns {Meeting}
   */
  createMeeting(payload) {
    this.permission.checkCreateMeeting();
    if (this.logger && typeof this.logger.info === 'function') {
      this.logger.info(`Creating meeting: '${payload.title}'`);
    }

    this.validator.validateMeetingCreate(payload);

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : { id: payload.organizerCitizenId };
    const entityData = {
      ...payload,
      status: 'DRAFT',
      createdBy: currentUser ? currentUser.id : payload.organizerCitizenId,
      updatedBy: currentUser ? currentUser.id : payload.organizerCitizenId,
    };

    const meetingEntity = Meeting ? new Meeting(entityData) : entityData;
    const createdMeeting = this.repository.createMeeting(meetingEntity);

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('MeetingCreated', {
        source: 'MeetingService',
        payload: createdMeeting,
      });
    }

    return createdMeeting;
  }

  /**
   * Retrieves a single meeting by ID.
   * @param {string} id - Meeting ID.
   * @returns {Meeting}
   */
  getMeeting(id) {
    this.permission.checkReadOwnScope();
    const meeting = this.repository.findMeetingById(id);
    if (!meeting) {
      throw new Error(`Meeting with ID '${id}' not found.`);
    }
    return meeting;
  }

  /**
   * Searches for meetings.
   * @param {object} [query={}] - Search criteria.
   * @param {object} [options={}] - Options.
   * @returns {Meeting[]}
   */
  searchMeetings(query = {}, options = {}) {
    this.permission.checkReadOwnScope();
    return this.repository.searchMeetings(query, options);
  }

  /**
   * Updates an existing meeting.
   * @param {string} id - Meeting ID.
   * @param {object} updates - Updates to apply.
   * @returns {Meeting}
   */
  updateMeeting(id, updates) {
    this.permission.checkCreateMeeting();
    this.validator.validateMeetingUpdate(updates);

    const meeting = this.repository.findMeetingById(id);
    if (!meeting) {
      throw new Error(`Meeting with ID '${id}' not found.`);
    }

    this.rule.checkMeetingNotConcluded(meeting);

    if (updates.status && updates.status !== meeting.status) {
      this.rule.checkStatusTransition(meeting.status, updates.status);
    }

    const currentUser = (typeof WK !== 'undefined' && typeof WK.user === 'function') ? WK.user() : null;
    const updatePayload = {
      ...updates,
      updatedBy: currentUser ? currentUser.id : meeting.updatedBy,
    };

    return this.repository.updateMeeting(id, updatePayload);
  }

  /**
   * Schedules and publishes a meeting (transitions from DRAFT to SCHEDULED).
   * @param {string} meetingId - Meeting ID.
   * @returns {Meeting}
   */
  scheduleMeeting(meetingId) {
    this.permission.checkScheduleMeeting();
    const meeting = this.repository.findMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID '${meetingId}' not found.`);
    }

    this.rule.checkStatusTransition(meeting.status, 'SCHEDULED');

    const updated = this.repository.updateMeeting(meetingId, { status: 'SCHEDULED' });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('MeetingScheduled', {
        source: 'MeetingService',
        payload: updated,
      });
    }

    return updated;
  }

  /**
   * Starts an official meeting session (transitions from SCHEDULED to ONGOING).
   * @param {string} meetingId - Meeting ID.
   * @returns {Meeting}
   */
  startMeeting(meetingId) {
    this.permission.checkStartMeeting();
    const meeting = this.repository.findMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID '${meetingId}' not found.`);
    }

    this.rule.checkStatusTransition(meeting.status, 'ONGOING');

    const updated = this.repository.updateMeeting(meetingId, {
      status: 'ONGOING',
      actualStartTime: new Date().toISOString(),
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('MeetingStarted', {
        source: 'MeetingService',
        payload: updated,
      });
    }

    return updated;
  }

  /**
   * Concludes a meeting, ratifies minutes and decision summaries.
   * @param {string} meetingId - Meeting ID.
   * @param {string} [notes=null] - Final closing notes or summary.
   * @returns {Meeting}
   */
  concludeMeeting(meetingId, notes = null) {
    this.permission.checkConcludeMeeting();
    const meeting = this.repository.findMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID '${meetingId}' not found.`);
    }

    this.rule.checkStatusTransition(meeting.status, 'CONCLUDED');

    const updated = this.repository.updateMeeting(meetingId, {
      status: 'CONCLUDED',
      actualEndTime: new Date().toISOString(),
      description: notes ? `${meeting.description}\n\n[Notulensi Akhir]: ${notes}` : meeting.description,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('MeetingConcluded', {
        source: 'MeetingService',
        payload: updated,
      });
    }

    if (this.analyticsService && typeof this.analyticsService.track === 'function') {
      this.analyticsService.track('meeting_concluded', {
        meetingId: updated.id,
        meetingType: updated.meetingType,
        totalAttended: updated.totalAttended,
        scopeId: updated.scopeId,
      });
    }

    return updated;
  }

  /**
   * Cancels a scheduled or draft meeting.
   * @param {string} meetingId - Meeting ID.
   * @param {string} [reason=null] - Cancellation reason.
   * @returns {Meeting}
   */
  cancelMeeting(meetingId, reason = null) {
    this.permission.checkCancelMeeting();
    const meeting = this.repository.findMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting with ID '${meetingId}' not found.`);
    }

    this.rule.checkStatusTransition(meeting.status, 'CANCELLED');

    const updated = this.repository.updateMeeting(meetingId, {
      status: 'CANCELLED',
      description: reason ? `${meeting.description}\n\n[Alasan Pembatalan]: ${reason}` : meeting.description,
    });

    if (this.eventBus && typeof this.eventBus.publish === 'function') {
      this.eventBus.publish('MeetingCancelled', {
        source: 'MeetingService',
        payload: updated,
      });
    }

    return updated;
  }

  // =========================================================================
  // ATTENDEE & ATTENDANCE OPERATIONS
  // =========================================================================

  /**
   * Adds an attendee / invitee to a meeting.
   * @param {object} payload - { meetingId, citizenId, role, invitationStatus }.
   * @returns {MeetingAttendee}
   */
  addAttendee(payload) {
    this.permission.checkScheduleMeeting();
    this.validator.validateAttendeeAdd(payload);

    const meeting = this.repository.findMeetingById(payload.meetingId);
    if (!meeting) {
      throw new Error(`Meeting '${payload.meetingId}' not found.`);
    }

    this.rule.checkMeetingNotConcluded(meeting);

    const existing = this.repository.findAttendee(payload.meetingId, payload.citizenId);
    if (existing) {
      return existing; // Already invited
    }

    const attendeeEntity = MeetingAttendee ? new MeetingAttendee(payload) : payload;
    const createdAttendee = this.repository.addAttendee(attendeeEntity);

    // Increment totalInvited on meeting
    this.repository.updateMeeting(payload.meetingId, {
      totalInvited: (meeting.totalInvited || 0) + 1,
    });

    return createdAttendee;
  }

  /**
   * Records attendance or check-in for a citizen.
   * @param {string} meetingId - Meeting ID.
   * @param {string} citizenId - Citizen ID.
   * @param {string} [attendanceStatus='PRESENT'] - 'PRESENT' | 'EXCUSED' | 'LATE'.
   * @param {string} [checkInTime=null] - ISO datetime.
   * @returns {MeetingAttendee}
   */
  recordAttendance(meetingId, citizenId, attendanceStatus = 'PRESENT', checkInTime = null) {
    this.permission.checkRecordAttendance();

    const meeting = this.repository.findMeetingById(meetingId);
    if (!meeting) {
      throw new Error(`Meeting '${meetingId}' not found.`);
    }

    this.rule.checkMeetingNotConcluded(meeting);

    let attendee = this.repository.findAttendee(meetingId, citizenId);
    if (!attendee) {
      // Walk-in attendee: auto-create record
      const newAttendee = MeetingAttendee
        ? new MeetingAttendee({ meetingId, citizenId, role: 'MEMBER', invitationStatus: 'CONFIRMED' })
        : { meetingId, citizenId, role: 'MEMBER', invitationStatus: 'CONFIRMED' };
      attendee = this.repository.addAttendee(newAttendee);
      this.repository.updateMeeting(meetingId, { totalInvited: (meeting.totalInvited || 0) + 1 });
    }

    const updatedAttendee = this.repository.updateAttendee(attendee.id, {
      attendanceStatus: attendanceStatus,
      checkInTime: checkInTime || new Date().toISOString(),
    });

    // Recalculate totalAttended
    const allAttendees = this.repository.findAttendeesByMeetingId(meetingId);
    const totalAttended = allAttendees.filter(a => a.attendanceStatus === 'PRESENT' || a.attendanceStatus === 'LATE').length;
    this.repository.updateMeeting(meetingId, { totalAttended });

    return updatedAttendee;
  }

  // =========================================================================
  // AGENDA & MINUTES OPERATIONS
  // =========================================================================

  /**
   * Adds an agenda item to a meeting.
   * @param {object} payload - { meetingId, title, agendaOrder, description, allocatedMinutes }.
   * @returns {MeetingAgenda}
   */
  addAgenda(payload) {
    this.permission.checkManageAgenda();
    this.validator.validateAgendaAdd(payload);

    const meeting = this.repository.findMeetingById(payload.meetingId);
    if (!meeting) {
      throw new Error(`Meeting '${payload.meetingId}' not found.`);
    }

    this.rule.checkMeetingNotConcluded(meeting);

    const agendaEntity = MeetingAgenda ? new MeetingAgenda(payload) : payload;
    return this.repository.addAgenda(agendaEntity);
  }

  /**
   * Updates discussion notes and decisions for an agenda item.
   * @param {string} agendaId - Agenda ID.
   * @param {string} discussionNotes - Notes recorded during discussion.
   * @param {string} decisionSummary - Final agreed decision.
   * @param {object[]} [actionItems=[]] - Array of action item tasks.
   * @returns {MeetingAgenda}
   */
  updateAgendaDiscussion(agendaId, discussionNotes, decisionSummary, actionItems = []) {
    this.permission.checkManageAgenda();

    const agenda = this.repository.findAgendaById(agendaId);
    if (!agenda) {
      throw new Error(`Agenda item with ID '${agendaId}' not found.`);
    }

    const meeting = this.repository.findMeetingById(agenda.meetingId);
    if (meeting) {
      this.rule.checkMeetingNotConcluded(meeting);
    }

    return this.repository.updateAgenda(agendaId, {
      discussionNotes,
      decisionSummary,
      actionItems,
      status: 'CONCLUDED',
    });
  }

  /**
   * Retrieves complete meeting bundle (meeting, attendees, and agendas).
   * @param {string} meetingId - Meeting ID.
   * @returns {object}
   */
  getMeetingDetails(meetingId) {
    const meeting = this.getMeeting(meetingId);
    const attendees = this.repository.findAttendeesByMeetingId(meetingId);
    const agendas = this.repository.findAgendasByMeetingId(meetingId);

    return {
      meeting,
      attendees,
      agendas,
    };
  }
}

module.exports = MeetingService;

