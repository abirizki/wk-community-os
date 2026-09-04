/**
 * @class MonitoringDashboard
 * @description Defines the main dashboard for the Monitoring Center.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class MonitoringDashboard {
  /**
   * Returns an array of widget definitions for the monitoring dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'monitoring_system_status',
        title: 'Overall System Status',
        type: 'status_indicator', // e.g., Green/Yellow/Red
        dataSource: 'MonitoringStatistics.getOverallSystemStatus',
        size: 'small',
        permission: 'monitoringcenter.dashboard.view'
      },
      {
        id: 'monitoring_cpu_usage',
        title: 'CPU Usage',
        type: 'gauge',
        dataSource: 'MonitoringStatistics.getCpuUsage',
        size: 'small',
        permission: 'monitoringcenter.dashboard.view'
      },
      {
        id: 'monitoring_memory_usage',
        title: 'Memory Usage',
        type: 'gauge',
        dataSource: 'MonitoringStatistics.getMemoryUsage',
        size: 'small',
        permission: 'monitoringcenter.dashboard.view'
      },
      {
        id: 'monitoring_queue_lengths',
        title: 'Queue Depths (Event/Notification)',
        type: 'bar_chart',
        dataSource: 'MonitoringStatistics.getQueueDepths',
        size: 'medium',
        permission: 'monitoringcenter.dashboard.view'
      },
      {
        id: 'monitoring_subsystem_status',
        title: 'Subsystem Health',
        type: 'table',
        dataSource: 'MonitoringStatistics.getSubsystemHealth',
        size: 'large',
        permission: 'monitoringcenter.dashboard.view'
      }
    ];
  }
}

// Register the dashboard with the framework
WK.dashboard('monitoring_center', MonitoringDashboard.getWidgets());