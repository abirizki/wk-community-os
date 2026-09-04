/**
 * @file MeetingEntity.js
 * @description Core Entity Layer for Meeting Module (Epic Governance / Package P20) in Warga Kebonjati (WK COMMUNITY OS).
 * Encapsulates domain models for Meetings, Attendees, and Agendas with serialization, deserialization, and audit trail support.
 */

// Helper to generate UUID compatible with Google Apps Script Utilities and standard Node environments
function generateMeetingUuid() {
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
 * @class MeetingConstants
 * @classdesc Enumerations, statuses, and lookup constants for the Meeting module.
 */
class MeetingConstants {
  static get MEETING_TYPES() {
    return [
      'RUTIN_RT',
      'RUTIN_RW',
      'MUSRENBANG_KELURAHAN',
      'RAPAT_DARURAT',
      'KOORDINASI_PENGURUS',
      'SOSIALISASI_WARGA',
    ];
  }

  static get SCOPE_TYPES() {
    return ['RT', 'RW', 'KELURAHAN'];
  }

  static get MEETING_STATUSES() {
    return ['DRAFT', 'SCHEDULED', 'ONGOING', 'CONCLUDED', 'CANCELLED', 'ADJOURNED'];
  }

  static get ATTENDEE_ROLES() {
    return ['CHAIRPERSON', 'SECRETARY', 'SPEAKER', 'MEMBER', 'INVITED_GUEST', 'OBSERVER'];
  }

  static get INVITATION_STATUSES() {
    return ['INVITED', 'CONFIRMED', 'DECLINED', 'TENTATIVE'];
  }

  static get ATTENDANCE_STATUSES() {
    return ['PRESENT', 'ABSENT', 'EXCUSED', 'LATE'];
  }

  static get AGENDA_STATUSES() {
    return ['PENDING', 'IN_DISCUSSION', 'CONCLUDED', 'SKIPPED'];
  }
}

/**
 * @class Meeting
 * @classdesc Represents an official community or governance meeting, session, or musyawarah.
 */
class Meeting {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateMeetingUuid();
    this.title = data.title || '';
    this.description = data.description || '';
    this.meetingType = data.meetingType || 'RUTIN_RT';
    this.scopeType = data.scopeType || 'RT';
    this.scopeId = data.scopeId || '';
    this.venue = data.venue || '';
    this.meetingUrl = data.meetingUrl || null;

    // Schedule Times
    this.scheduledStartTime = data.scheduledStartTime || null;
    this.scheduledEndTime = data.scheduledEndTime || null;
    this.actualStartTime = data.actualStartTime || null;
    this.actualEndTime = data.actualEndTime || null;

    // Leadership and Attendance
    this.organizerCitizenId = data.organizerCitizenId || null;
    this.chairpersonCitizenId = data.chairpersonCitizenId || null;
    this.secretaryCitizenId = data.secretaryCitizenId || null;
    this.quorumCount = typeof data.quorumCount === 'number' ? data.quorumCount : 0;
    this.totalInvited = typeof data.totalInvited === 'number' ? data.totalInvited : 0;
    this.totalAttended = typeof data.totalAttended === 'number' ? data.totalAttended : 0;

    // Lifecycle & Visibility
    this.status = data.status || 'DRAFT';
    this.isPublic = typeof data.isPublic === 'boolean' ? data.isPublic : true;

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
      title: this.title,
      description: this.description,
      meetingType: this.meetingType,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      venue: this.venue,
      meetingUrl: this.meetingUrl,
      scheduledStartTime: this.scheduledStartTime,
      scheduledEndTime: this.scheduledEndTime,
      actualStartTime: this.actualStartTime,
      actualEndTime: this.actualEndTime,
      organizerCitizenId: this.organizerCitizenId,
      chairpersonCitizenId: this.chairpersonCitizenId,
      secretaryCitizenId: this.secretaryCitizenId,
      quorumCount: this.quorumCount,
      totalInvited: this.totalInvited,
      totalAttended: this.totalAttended,
      status: this.status,
      isPublic: this.isPublic,
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
   * Deserializes a raw database record into a Meeting entity instance.
   * @param {object} record - Database record.
   * @returns {Meeting|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new Meeting({ ...record });
  }

  /**
   * Returns a sanitized object for public or citizen display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      meetingType: this.meetingType,
      scopeType: this.scopeType,
      scopeId: this.scopeId,
      venue: this.venue,
      meetingUrl: this.meetingUrl,
      scheduledStartTime: this.scheduledStartTime,
      scheduledEndTime: this.scheduledEndTime,
      actualStartTime: this.actualStartTime,
      actualEndTime: this.actualEndTime,
      organizerCitizenId: this.organizerCitizenId,
      chairpersonCitizenId: this.chairpersonCitizenId,
      secretaryCitizenId: this.secretaryCitizenId,
      totalInvited: this.totalInvited,
      totalAttended: this.totalAttended,
      status: this.status,
      isPublic: this.isPublic,
      createdAt: this.createdAt,
    };
  }
}

/**
 * @class MeetingAttendee
 * @classdesc Represents an invited citizen, official, or participant for a meeting.
 */
class MeetingAttendee {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateMeetingUuid();
    this.meetingId = data.meetingId || '';
    this.citizenId = data.citizenId || '';
    this.role = data.role || 'MEMBER';
    this.invitationStatus = data.invitationStatus || 'INVITED';
    this.attendanceStatus = data.attendanceStatus || 'ABSENT';
    this.checkInTime = data.checkInTime || null;
    this.checkOutTime = data.checkOutTime || null;
    this.signatureUrl = data.signatureUrl || null;
    this.notes = data.notes || null;

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
      meetingId: this.meetingId,
      citizenId: this.citizenId,
      role: this.role,
      invitationStatus: this.invitationStatus,
      attendanceStatus: this.attendanceStatus,
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      signatureUrl: this.signatureUrl,
      notes: this.notes,
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
   * Deserializes a raw database record into a MeetingAttendee entity instance.
   * @param {object} record - Database record.
   * @returns {MeetingAttendee|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    return new MeetingAttendee({ ...record });
  }

  /**
   * Returns a sanitized object for display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      meetingId: this.meetingId,
      citizenId: this.citizenId,
      role: this.role,
      invitationStatus: this.invitationStatus,
      attendanceStatus: this.attendanceStatus,
      checkInTime: this.checkInTime,
      notes: this.notes,
    };
  }
}

/**
 * @class MeetingAgenda
 * @classdesc Represents an agenda item, discussion note, or conclusion under a meeting.
 */
class MeetingAgenda {
  /**
   * @param {object} [data={}] - Initial data payload.
   */
  constructor(data = {}) {
    this.id = data.id || generateMeetingUuid();
    this.meetingId = data.meetingId || '';
    this.agendaOrder = typeof data.agendaOrder === 'number' ? data.agendaOrder : 1;
    this.title = data.title || '';
    this.description = data.description || '';
    this.allocatedMinutes = typeof data.allocatedMinutes === 'number' ? data.allocatedMinutes : 15;
    this.status = data.status || 'PENDING';
    this.discussionNotes = data.discussionNotes || null;
    this.decisionSummary = data.decisionSummary || null;
    this.actionItems = Array.isArray(data.actionItems) ? data.actionItems : [];

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
      meetingId: this.meetingId,
      agendaOrder: this.agendaOrder,
      title: this.title,
      description: this.description,
      allocatedMinutes: this.allocatedMinutes,
      status: this.status,
      discussionNotes: this.discussionNotes,
      decisionSummary: this.decisionSummary,
      actionItems: JSON.stringify(this.actionItems),
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
   * Deserializes a raw database record into a MeetingAgenda entity instance.
   * @param {object} record - Database record.
   * @returns {MeetingAgenda|null}
   */
  static fromObject(record) {
    if (!record) {
      return null;
    }
    const data = { ...record };
    if (typeof record.actionItems === 'string') {
      try {
        data.actionItems = JSON.parse(record.actionItems);
      } catch (e) {
        data.actionItems = [];
      }
    } else if (!Array.isArray(record.actionItems)) {
      data.actionItems = [];
    }

    return new MeetingAgenda(data);
  }

  /**
   * Returns a sanitized object for display.
   * @returns {object}
   */
  toDisplay() {
    return {
      id: this.id,
      meetingId: this.meetingId,
      agendaOrder: this.agendaOrder,
      title: this.title,
      description: this.description,
      allocatedMinutes: this.allocatedMinutes,
      status: this.status,
      discussionNotes: this.discussionNotes,
      decisionSummary: this.decisionSummary,
      actionItems: this.actionItems,
    };
  }
}

module.exports = {
  MeetingConstants,
  Meeting,
  MeetingAttendee,
  MeetingAgenda,
};

