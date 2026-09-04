/**
 * @file ForumDashboard.js
 * @description Defines UI widget configurations and analytics presentation mapping for the Forum module.
 */

class ForumDashboard {
  /**
   * Returns an array of widget definitions registered for the Forum dashboard.
   * @returns {object[]}
   */
  static getWidgets() {
    const permission = 'forum.statistics.view';

    return [
      // =====================================================================
      // 1. SUMMARY CARDS
      // =====================================================================
      {
        id: 'forum_total_topics',
        title: 'Total Diskusi Warga',
        type: 'summary_card',
        dataSource: 'ForumStatistics.getSummary',
        dataKey: 'totalTopics',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'forum_total_comments',
        title: 'Total Komentar & Tanggapan',
        type: 'summary_card',
        dataSource: 'ForumStatistics.getSummary',
        dataKey: 'totalComments',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'forum_active_topics',
        title: 'Diskusi Aktif (Terbuka)',
        type: 'summary_card',
        dataSource: 'ForumStatistics.getSummary',
        dataKey: 'publishedTopics',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'forum_pinned_topics',
        title: 'Pengumuman Disematkan',
        type: 'summary_card',
        dataSource: 'ForumStatistics.getSummary',
        dataKey: 'pinnedTopics',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'forum_total_upvotes',
        title: 'Total Dukungan (Upvotes)',
        type: 'summary_card',
        dataSource: 'ForumStatistics.getSummary',
        dataKey: 'totalUpvotes',
        size: '1x1',
        permission: permission,
      },

      // =====================================================================
      // 2. VISUAL CHARTS
      // =====================================================================
      {
        id: 'forum_category_distribution',
        title: 'Distribusi Topik per Kategori',
        type: 'pie_chart',
        dataSource: 'ForumStatistics.getCategoryDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'forum_status_distribution',
        title: 'Status Siklus Hidup Topik',
        type: 'donut_chart',
        dataSource: 'ForumStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'forum_engagement_trend',
        title: 'Tren Keaktifan & Pembuatan Topik (12 Bulan)',
        type: 'line_chart',
        dataSource: 'ForumStatistics.getEngagementTrend',
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 3. DATA TABLES
      // =====================================================================
      {
        id: 'forum_top_topics',
        title: 'Topik Terpopuler & Teraktif',
        type: 'table',
        dataSource: 'ForumStatistics.getTopTopics',
        columns: [
          { key: 'title', label: 'Judul Diskusi' },
          { key: 'category', label: 'Kategori' },
          { key: 'upvotes', label: 'Dukungan' },
          { key: 'commentCount', label: 'Komentar' },
          { key: 'viewCount', label: 'Dilihat' },
          { key: 'score', label: 'Skor Engagement' },
        ],
        size: '4x2',
        permission: permission,
      },
      {
        id: 'forum_recent_topics',
        title: 'Topik Diskusi Terbaru',
        type: 'table',
        dataSource: 'ForumStatistics.getRecentTopics',
        columns: [
          { key: 'title', label: 'Judul Diskusi' },
          { key: 'category', label: 'Kategori' },
          { key: 'status', label: 'Status' },
          { key: 'commentCount', label: 'Komentar' },
          { key: 'createdAt', label: 'Tanggal Dibuat' },
        ],
        size: '4x2',
        permission: permission,
      },

      // =====================================================================
      // 4. QUICK ACTIONS
      // =====================================================================
      {
        id: 'forum_quick_actions',
        title: 'Aksi Cepat Forum',
        type: 'quick_actions',
        size: '2x1',
        permission: permission,
        items: [
          { label: 'Mulai Diskusi Baru', action: 'forum.topic.create', icon: 'chat-plus' },
          { label: 'Moderasi Konten', action: 'forum.topic.moderate', icon: 'shield-check' },
        ],
      },
    ];
  }
}

module.exports = ForumDashboard;

