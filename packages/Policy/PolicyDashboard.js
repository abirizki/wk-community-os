/**
 * @file PolicyDashboard.js
 * @description Dashboard presentation definitions for the Policy module.
 */

class PolicyDashboard {
  /**
   * Registers and returns visual widgets for the Policy Analytics Dashboard.
   * @returns {object[]} Array of widget configuration objects
   */
  static getWidgets() {
    return [
      {
        id: 'policy_total_count',
        type: 'summary_card',
        title: 'Total SOP',
        dataSource: 'PolicyStatistics.getSummary',
        dataKey: 'totalPolicies',
        icon: 'folder-open',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_active_count',
        type: 'summary_card',
        title: 'SOP Aktif',
        dataSource: 'PolicyStatistics.getSummary',
        dataKey: 'activePolicies',
        icon: 'check-circle',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_draft_count',
        type: 'summary_card',
        title: 'Draf SOP',
        dataSource: 'PolicyStatistics.getSummary',
        dataKey: 'draftPolicies',
        icon: 'edit',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_pending_count',
        type: 'summary_card',
        title: 'Menunggu Persetujuan',
        dataSource: 'PolicyStatistics.getSummary',
        dataKey: 'pendingApprovalPolicies',
        icon: 'clock',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_category_distribution',
        type: 'pie_chart',
        title: 'Distribusi Kategori SOP',
        dataSource: 'PolicyStatistics.getCategoryDistribution',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_target_distribution',
        type: 'donut_chart',
        title: 'Distribusi Peran Petugas',
        dataSource: 'PolicyStatistics.getTargetRoleDistribution',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_trend',
        type: 'line_chart',
        title: 'Tren Pengesahan SOP',
        dataSource: 'PolicyStatistics.getPolicyTrend',
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_recent_table',
        type: 'table',
        title: 'Daftar SOP Aktif Terbaru',
        dataSource: 'PolicyStatistics.getRecentPolicies',
        columns: [
          { field: 'policyNumber', label: 'Nomor SOP' },
          { field: 'title', label: 'Judul' },
          { field: 'category', label: 'Kategori' },
          { field: 'targetRole', label: 'Sasaran Peran' },
          { field: 'effectiveDate', label: 'Tanggal Berlaku' }
        ],
        permission: 'policy.statistics.view'
      },
      {
        id: 'policy_quick_actions',
        type: 'quick_actions',
        title: 'Aksi Cepat',
        actions: [
          { label: 'Draf SOP Baru', event: 'UI:Policy:Create', permission: 'policy.create' },
          { label: 'Tinjau SOP', event: 'UI:Policy:Revise', permission: 'policy.revise' },
          { label: 'Pengesahan SOP', event: 'UI:Policy:Approve', permission: 'policy.approve' }
        ],
        permission: 'policy.statistics.view'
      }
    ];
  }
}

module.exports = { PolicyDashboard };

