/**
 * @file MeetingStatistics.js
 * @description Provides aggregated statistical and analytical metrics for the Meeting module.
 */

// Import or fallback to MeetingConstants
let MeetingConstants;
try {
  ({ MeetingConstants } = require('./MeetingEntity.js'));
} catch (e) {
  MeetingConstants = {
    MEETING_TYPES: ['RUTIN_RT', 'RUTIN_RW', 'MUSRENBANG_KELURAHAN', 'RAPAT_DARURAT', 'KOORDINASI_PENGURUS', 'SOSIALISASI_WARGA'],
    MEETING_STATUSES: ['DRAFT', 'SCHEDULED', 'ONGOING', 'CONCLUDED', 'CANCELLED', 'ADJOURNED'],
  };
}

class MeetingStatistics {
  /**
   * @param {MeetingRepository} repository
   * @param {object} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = typeof WK !== 'undefined' && typeof WK.cache === 'function' ? WK.cache('meeting_stats') : null;
    /** @private */
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('MeetingStatistics') : console;
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes cache for operational meeting metrics
  }

  /**
   * Retrieves high-level operational summary metrics for meetings.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getSummary(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const cacheKey = `summary_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const meetings = this.repository.searchMeetings(filters) || [];

    const totalInvited = meetings.reduce((sum, m) => sum + (Number(m.totalInvited) || 0), 0);
    const totalAttended = meetings.reduce((sum, m) => sum + (Number(m.totalAttended) || 0), 0);
    const overallAttendanceRate = totalInvited > 0 ? Number(((totalAttended / totalInvited) * 100).toFixed(1)) : 0;

    const summary = {
      totalMeetings: meetings.length,
      draftMeetings: meetings.filter(m => m.status === 'DRAFT').length,
      scheduledMeetings: meetings.filter(m => m.status === 'SCHEDULED').length,
      ongoingMeetings: meetings.filter(m => m.status === 'ONGOING').length,
      concludedMeetings: meetings.filter(m => m.status === 'CONCLUDED').length,
      cancelledMeetings: meetings.filter(m => m.status === 'CANCELLED').length,
      adjournedMeetings: meetings.filter(m => m.status === 'ADJOURNED').length,
      totalInvited: totalInvited,
      totalAttended: totalAttended,
      attendanceRate: `${overallAttendanceRate}%`,
      attendanceRateValue: overallAttendanceRate,
    };

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    }

    return summary;
  }

  /**
   * Calculates the distribution of meetings by meeting type.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getTypeDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const cacheKey = `type_dist_${JSON.stringify(filters)}`;
    if (this.cache && typeof this.cache.get === 'function') {
      const cached = this.cache.get(cacheKey);
      if (cached) return cached;
    }

    const meetings = this.repository.searchMeetings(filters) || [];
    const types = (MeetingConstants && MeetingConstants.MEETING_TYPES) || [];

    const distribution = types.map(type => {
      const count = meetings.filter(m => m.meetingType === type).length;
      return {
        name: this._formatLabel(type),
        code: type,
        value: count,
      };
    });

    if (this.cache && typeof this.cache.set === 'function') {
      this.cache.set(cacheKey, distribution, this.defaultCacheTTL);
    }

    return distribution;
  }

  /**
   * Calculates the distribution of meetings by lifecycle status.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getStatusDistribution(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const meetings = this.repository.searchMeetings(filters) || [];
    const statuses = (MeetingConstants && MeetingConstants.MEETING_STATUSES) || [];

    return statuses.map(status => ({
      name: this._formatLabel(status),
      code: status,
      value: meetings.filter(m => m.status === status).length,
    }));
  }

  /**
   * Calculates citizen attendance rates and participation metrics.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getAttendanceRate(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const summary = this.getSummary(filters);
    return {
      totalInvited: summary.totalInvited,
      totalAttended: summary.totalAttended,
      attendanceRate: summary.attendanceRate,
      rateValue: summary.attendanceRateValue,
    };
  }

  /**
   * Retrieves upcoming meetings with SCHEDULED status.
   * @param {number} [limit=5] - Number of meetings.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getUpcomingMeetings(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const meetings = this.repository.searchMeetings({ ...filters, status: 'SCHEDULED' }) || [];

    return meetings
      .slice()
      .sort((a, b) => new Date(a.scheduledStartTime || 0) - new Date(b.scheduledStartTime || 0))
      .slice(0, limit)
      .map(m => ({
        id: m.id,
        title: m.title,
        meetingType: m.meetingType,
        scopeId: m.scopeId,
        venue: m.venue,
        scheduledStartTime: m.scheduledStartTime,
        scheduledEndTime: m.scheduledEndTime,
        totalInvited: m.totalInvited || 0,
      }));
  }

  /**
   * Retrieves recently concluded meetings with final minutes.
   * @param {number} [limit=5] - Number of meetings.
   * @param {object} [filters={}] - Query filters.
   * @returns {object[]}
   */
  getRecentConcludedMeetings(limit = 5, filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    const meetings = this.repository.searchMeetings({ ...filters, status: 'CONCLUDED' }) || [];

    return meetings
      .slice()
      .sort((a, b) => new Date(b.actualEndTime || b.updatedAt || 0) - new Date(a.actualEndTime || a.updatedAt || 0))
      .slice(0, limit)
      .map(m => ({
        id: m.id,
        title: m.title,
        meetingType: m.meetingType,
        scopeId: m.scopeId,
        venue: m.venue,
        actualEndTime: m.actualEndTime,
        totalAttended: m.totalAttended || 0,
      }));
  }

  /**
   * Retrieves governance meeting execution trend from AnalyticsService.
   * @param {object} [filters={}] - Query filters.
   * @returns {object}
   */
  getMeetingTrend(filters = {}) {
    if (typeof WK !== 'undefined' && typeof WK.security === 'function') {
      WK.security().checkPermission('meeting.statistics.view');
    }

    if (this.analyticsService && typeof this.analyticsService.getTimeSeries === 'function') {
      return this.analyticsService.getTimeSeries({
        metric: 'meeting_concluded',
        aggregation: 'count',
        period: 'monthly',
        dateRange: filters.dateRange || 'last_12_months',
        filters: filters,
      });
    }

    return { success: true, data: [] };
  }

  /**
   * Converts CONSTANT string to readable label.
   * @private
   */
  _formatLabel(str) {
    if (!str) return '';
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

module.exports = MeetingStatistics;

