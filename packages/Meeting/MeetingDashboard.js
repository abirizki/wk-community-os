/**
 * @file MeetingDashboard.js
 * @description Defines UI widget configurations and analytics presentation mapping for the Meeting module.
 */

class MeetingDashboard {
  /**
   * Returns an array of widget definitions registered for the Meeting dashboard.
   * @returns {object[]}
   */
  static getWidgets() {
    const permission = 'meeting.statistics.view';

    return [
      // =====================================================================
      // 1. SUMMARY CARDS
      // =====================================================================
      {
        id: 'meeting_total_count',
        title: 'Total Musyawarah & Rapat',
        type: 'summary_card',
        dataSource: 'MeetingStatistics.getSummary',
        dataKey: 'totalMeetings',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'meeting_concluded_count',
        title: 'Rapat Terlaksana (Selesai)',
        type: 'summary_card',
        dataSource: 'MeetingStatistics.getSummary',
        dataKey: 'concludedMeetings',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'meeting_scheduled_count',
        title: 'Rapat Terjadwal (Mendatang)',
        type: 'summary_card',
        dataSource: 'MeetingStatistics.getSummary',
        dataKey: 'scheduledMeetings',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'meeting_total_attended',
        title: 'Total Kehadiran Warga',
        type: 'summary_card',
        dataSource: 'MeetingStatistics.getSummary',
        dataKey: 'totalAttended',
        size: '1x1',
        permission: permission,
      },

      // =====================================================================
      // 2. PERFORMANCE & CARD GROUP
      // =====================================================================
      {
        id: 'meeting_attendance_performance',
        title: 'Tingkat Partisipasi Kehadiran',
        type: 'card_group',
        dataSource: 'MeetingStatistics.getAttendanceRate',
        dataKey: 'attendanceRate',
        size: '2x1',
        permission: permission,
      },

      // =====================================================================
      // 3. VISUAL CHARTS
      // =====================================================================
      {
        id: 'meeting_type_distribution',
        title: 'Distribusi Jenis Pertemuan & Musyawarah',
        type: 'pie_chart',
        dataSource: 'MeetingStatistics.getTypeDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'meeting_status_distribution',
        title: 'Status Siklus Hidup Rapat',
        type: 'donut_chart',
        dataSource: 'MeetingStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'meeting_trend',
        title: 'Tren Pelaksanaan Musyawarah Warga (12 Bulan)',
        type: 'line_chart',
        dataSource: 'MeetingStatistics.getMeetingTrend',
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 4. DATA TABLES
      // =====================================================================
      {
        id: 'meeting_upcoming_table',
        title: 'Jadwal Musyawarah & Rapat Mendatang',
        type: 'table',
        dataSource: 'MeetingStatistics.getUpcomingMeetings',
        columns: [
          { key: 'title', label: 'Nama Rapat' },
          { key: 'meetingType', label: 'Jenis' },
          { key: 'scopeId', label: 'Wilayah' },
          { key: 'venue', label: 'Lokasi' },
          { key: 'scheduledStartTime', label: 'Waktu Mulai' },
          { key: 'totalInvited', label: 'Undangan' },
        ],
        size: '4x2',
        permission: permission,
      },
      {
        id: 'meeting_recent_concluded_table',
        title: 'Notulensi Rapat Terakhir',
        type: 'table',
        dataSource: 'MeetingStatistics.getRecentConcludedMeetings',
        columns: [
          { key: 'title', label: 'Nama Rapat' },
          { key: 'meetingType', label: 'Jenis' },
          { key: 'scopeId', label: 'Wilayah' },
          { key: 'actualEndTime', label: 'Waktu Selesai' },
          { key: 'totalAttended', label: 'Hadir' },
        ],
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 5. QUICK ACTIONS
      // =====================================================================
      {
        id: 'meeting_quick_actions',
        title: 'Aksi Cepat Rapat',
        type: 'quick_actions',
        size: '2x1',
        permission: permission,
        items: [
          { label: 'Jadwalkan Rapat Baru', action: 'meeting.create', icon: 'calendar-plus' },
          { label: 'Catat Kehadiran', action: 'meeting.attendance.record', icon: 'account-check' },
          { label: 'Tulis Notulensi', action: 'meeting.agenda.manage', icon: 'file-document-edit' },
        ],
      },
    ];
  }
}

module.exports = MeetingDashboard;

