/**
 * @class ReferralDashboard
 * @description Defines the widgets for the main Referral dashboard.
 */
class ReferralDashboard {
  /**
   * Returns an array of widget definitions for the Referral dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    const permission = 'referral.dashboard.view';
    return [
      // Summary Cards
      {
        id: 'referral_total',
        title: 'Total Referrals',
        type: 'summary_card',
        dataSource: 'ReferralStatistics.getSummary',
        dataKey: 'total',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'referral_pending',
        title: 'Pending',
        type: 'summary_card',
        dataSource: 'ReferralStatistics.getSummary',
        dataKey: 'pending',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'referral_active',
        title: 'Active',
        type: 'summary_card',
        dataSource: 'ReferralStatistics.getSummary',
        dataKey: 'active',
        size: '1x1',
        permission: permission,
      },
      {
        id: 'referral_overdue_followup',
        title: 'Overdue Follow-up',
        type: 'summary_card',
        dataSource: 'ReferralStatistics.getFollowUpOverview',
        dataKey: 'overdue',
        size: '1x1',
        permission: permission,
      },

      // Charts
      {
        id: 'referral_creation_trend',
        title: 'Referral Trend (Last 12 Months)',
        type: 'line_chart',
        dataSource: 'ReferralStatistics.getTrend',
        size: '4x2',
        permission: permission,
      },
      {
        id: 'referral_status_distribution',
        title: 'Status Distribution',
        type: 'pie_chart',
        dataSource: 'ReferralStatistics.getStatusDistribution',
        size: '2x2',
        permission: permission,
      },
      {
        id: 'referral_type_distribution',
        title: 'Type Distribution',
        type: 'donut_chart',
        dataSource: 'ReferralStatistics.getTypeDistribution',
        size: '2x2',
        permission: permission,
      },

      // Tables
      {
        id: 'referral_pending_queue',
        title: 'Pending Referrals',
        type: 'table',
        dataSource: 'ReferralService.getPending',
        options: { limit: 10, sortBy: 'referralDate', order: 'asc' },
        columns: ['citizenId', 'referralDate', 'reason', 'destinationReference', 'priority'],
        size: '4x3',
        permission: 'referral.record.accept', // Only show to users who can act on them
      },
      {
        id: 'referral_recent_activity',
        title: 'Recent Activity',
        type: 'table',
        dataSource: 'ReferralService.getRecentActivity',
        options: { limit: 5 },
        columns: ['citizenId', 'referralDate', 'referralStatus', 'updatedAt'],
        size: '4x3',
        permission: permission,
      },
      {
        id: 'referral_quick_actions',
        title: 'Quick Actions',
        type: 'action_list',
        size: '1x2',
        permission: permission,
        actions: [
          {
            id: 'create_referral',
            label: 'Create New Referral',
            route: '/referrals/new',
            permission: 'referral.record.create',
          },
          {
            id: 'view_pending',
            label: 'View Pending Queue',
            route: '/referrals?status=PENDING',
            permission: 'referral.record.read.all',
          },
          {
            id: 'view_active',
            label: 'View Active Referrals',
            route: '/referrals?status=ACTIVE',
            permission: 'referral.record.read.all',
          },
        ],
      },
    ];
  }
}

/**
 * Registers the dashboard with the framework's Dashboard Engine.
 * This makes the dashboard available to users with the appropriate permissions.
 */
function registerReferralDashboard() {
  WK.dashboard('referral_main', ReferralDashboard.getWidgets());
}