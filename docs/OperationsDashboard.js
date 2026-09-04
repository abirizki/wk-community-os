/**
 * @class OperationsDashboard
 * @description Defines and registers the widgets for the main Operations Center dashboard.
 */
class OperationsDashboard {
  /**
   * Returns an array of widget definitions for the Operations Center.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'ops_system_health',
        title: 'System Health Status',
        type: 'table', // Or a custom health grid widget
        dataSource: 'OperationsStatistics.getSystemHealth',
        size: 'large',
        permission: 'operations.health.view'
      },
      {
        id: 'ops_queue_status',
        title: 'Queue Status',
        type: 'table',
        dataSource: 'OperationsStatistics.getQueueStatuses',
        size: 'medium',
        permission: 'operations.queues.view'
      },
      {
        id: 'ops_scheduler_status',
        title: 'Scheduler Status',
        type: 'table',
        dataSource: 'OperationsStatistics.getSchedulerStatuses',
        size: 'medium',
        permission: 'operations.scheduler.view'
      },
      {
        id: 'ops_quota_metrics',
        title: 'Google Apps Script Quotas',
        type: 'table', // Or key-value pairs
        dataSource: 'OperationsStatistics.getQuotaMetrics',
        size: 'medium',
        permission: 'operations.metrics.view'
      },
      {
        id: 'ops_recent_logs',
        title: 'Recent Activity Logs',
        type: 'table',
        dataSource: 'OperationsStatistics.getRecentLogs',
        size: 'large',
        permission: 'operations.logs.view'
      },
      {
        id: 'ops_security_alerts',
        title: 'Security Alerts',
        type: 'table',
        dataSource: 'OperationsStatistics.getSecurityAlerts',
        size: 'large',
        permission: 'operations.alerts.view'
      }
    ];
  }
}

// Register the dashboard layout with the generic Dashboard package
WK.dashboard('operationscenter', {
  id: 'DASHBOARD_OPERATIONS',
  title: 'Operations Center',
  description: 'Real-time monitoring of system health, performance, and operations.',
  allowedRoles: ['ADMINISTRATOR'], // Only for admins
  layout: OperationsDashboard.getWidgets()
});