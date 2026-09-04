/**
 * @file MeetingRepository.js
 * @description Manages persistence and data queries for meetings, attendees, and agendas using BaseRepository.
 */

// Fallback for BaseRepository in standalone environments
const BaseRepo = typeof BaseRepository !== 'undefined'
  ? BaseRepository
  : class {
      constructor(tableName) {
        this.tableName = tableName;
        this.dbAdapter = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
      }
    };

// Import Entity models if available
let Meeting, MeetingAttendee, MeetingAgenda;
try {
  ({ Meeting, MeetingAttendee, MeetingAgenda } = require('./MeetingEntity.js'));
} catch (e) {
  // Handled via global references if loaded by framework
}

class MeetingRepository extends BaseRepo {
  constructor() {
    super('meetings');
    this.meetingTableName = 'meetings';
    this.attendeeTableName = 'meeting_attendees';
    this.agendaTableName = 'meeting_agendas';
  }

  // =========================================================================
  // MEETING DATA ACCESS METHODS
  // =========================================================================

  /**
   * Creates a new meeting record in the database.
   * @param {Meeting} entity - Meeting entity.
   * @returns {Meeting}
   */
  createMeeting(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.meetingTableName, record);
    return Meeting ? Meeting.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds a single meeting by its ID.
   * @param {string} id - Meeting ID.
   * @returns {Meeting|null}
   */
  findMeetingById(id) {
    const record = this.dbAdapter.findById(this.meetingTableName, id);
    if (!record) return null;
    return Meeting ? Meeting.fromObject(record) : record;
  }

  /**
   * Searches for meetings matching query filters.
   * @param {object} [query={}] - Filter criteria.
   * @param {object} [options={}] - Search / pagination options.
   * @returns {Meeting[]}
   */
  searchMeetings(query = {}, options = {}) {
    const records = this.dbAdapter.search(this.meetingTableName, query, options) || [];
    return Meeting ? records.map(r => Meeting.fromObject(r)) : records;
  }

  /**
   * Updates an existing meeting record with optimistic locking.
   * @param {string} id - Meeting ID.
   * @param {object} updates - Updates to apply.
   * @returns {Meeting}
   */
  updateMeeting(id, updates) {
    const current = this.findMeetingById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    const updatedRecord = this.dbAdapter.update(this.meetingTableName, id, updateData);
    return Meeting ? Meeting.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes a meeting record.
   * @param {string} id - Meeting ID.
   * @param {string} userId - User ID performing deletion.
   * @returns {boolean}
   */
  deleteMeeting(id, userId) {
    return this.dbAdapter.softDelete(this.meetingTableName, id, userId);
  }

  // =========================================================================
  // ATTENDEE DATA ACCESS METHODS
  // =========================================================================

  /**
   * Adds an attendee to a meeting.
   * @param {MeetingAttendee} entity - Attendee entity.
   * @returns {MeetingAttendee}
   */
  addAttendee(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.attendeeTableName, record);
    return MeetingAttendee ? MeetingAttendee.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds an attendee record by meeting and citizen ID.
   * @param {string} meetingId - Meeting ID.
   * @param {string} citizenId - Citizen ID.
   * @returns {MeetingAttendee|null}
   */
  findAttendee(meetingId, citizenId) {
    const records = this.dbAdapter.search(this.attendeeTableName, { meetingId, citizenId }) || [];
    if (records.length === 0) return null;
    return MeetingAttendee ? MeetingAttendee.fromObject(records[0]) : records[0];
  }

  /**
   * Retrieves all attendees for a given meeting.
   * @param {string} meetingId - Meeting ID.
   * @param {object} [options={}] - Search / order options.
   * @returns {MeetingAttendee[]}
   */
  findAttendeesByMeetingId(meetingId, options = {}) {
    const query = { meetingId, deletedAt: null };
    const records = this.dbAdapter.search(this.attendeeTableName, query, options) || [];
    return MeetingAttendee ? records.map(r => MeetingAttendee.fromObject(r)) : records;
  }

  /**
   * Updates an attendee record.
   * @param {string} id - Attendee record ID.
   * @param {object} updates - Updates to apply.
   * @returns {MeetingAttendee}
   */
  updateAttendee(id, updates) {
    const current = this.dbAdapter.findById(this.attendeeTableName, id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    const updatedRecord = this.dbAdapter.update(this.attendeeTableName, id, updateData);
    return MeetingAttendee ? MeetingAttendee.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes an attendee record.
   * @param {string} id - Attendee ID.
   * @param {string} userId - User ID.
   * @returns {boolean}
   */
  deleteAttendee(id, userId) {
    return this.dbAdapter.softDelete(this.attendeeTableName, id, userId);
  }

  // =========================================================================
  // AGENDA DATA ACCESS METHODS
  // =========================================================================

  /**
   * Adds an agenda item to a meeting.
   * @param {MeetingAgenda} entity - Agenda entity.
   * @returns {MeetingAgenda}
   */
  addAgenda(entity) {
    const record = entity.toObject();
    const createdRecord = this.dbAdapter.create(this.agendaTableName, record);
    return MeetingAgenda ? MeetingAgenda.fromObject(createdRecord) : createdRecord;
  }

  /**
   * Finds an agenda item by ID.
   * @param {string} id - Agenda ID.
   * @returns {MeetingAgenda|null}
   */
  findAgendaById(id) {
    const record = this.dbAdapter.findById(this.agendaTableName, id);
    if (!record) return null;
    return MeetingAgenda ? MeetingAgenda.fromObject(record) : record;
  }

  /**
   * Retrieves all agenda items under a meeting, ordered by agendaOrder.
   * @param {string} meetingId - Meeting ID.
   * @param {object} [options={}] - Search / sort options.
   * @returns {MeetingAgenda[]}
   */
  findAgendasByMeetingId(meetingId, options = {}) {
    const query = { meetingId, deletedAt: null };
    const records = this.dbAdapter.search(this.agendaTableName, query, options) || [];
    return MeetingAgenda
      ? records.map(r => MeetingAgenda.fromObject(r)).sort((a, b) => (a.agendaOrder || 0) - (b.agendaOrder || 0))
      : records;
  }

  /**
   * Updates an agenda item.
   * @param {string} id - Agenda ID.
   * @param {object} updates - Updates to apply.
   * @returns {MeetingAgenda}
   */
  updateAgenda(id, updates) {
    const current = this.findAgendaById(id);
    const currentVersion = (current && current.version) ? current.version : 1;
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString(),
      version: currentVersion + 1,
    };

    if (updateData.actionItems && Array.isArray(updateData.actionItems)) {
      updateData.actionItems = JSON.stringify(updateData.actionItems);
    }

    const updatedRecord = this.dbAdapter.update(this.agendaTableName, id, updateData);
    return MeetingAgenda ? MeetingAgenda.fromObject(updatedRecord) : updatedRecord;
  }

  /**
   * Soft deletes an agenda item.
   * @param {string} id - Agenda ID.
   * @param {string} userId - User ID.
   * @returns {boolean}
   */
  deleteAgenda(id, userId) {
    return this.dbAdapter.softDelete(this.agendaTableName, id, userId);
  }
}

module.exports = MeetingRepository;

