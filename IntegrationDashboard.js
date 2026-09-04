/**
 * @class IntegrationDashboard
 * @description Defines the dashboard for the Integration Hub.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationDashboard {
  /**
   * Returns an array of widget definitions for the dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'integration_total_api_calls',
        title: 'Total API Calls (24h)',
        type: 'scorecard',
        dataSource: 'IntegrationStatistics.getTotalApiCalls24h',
        size: 'small',
        permission: 'integrationhub.dashboard.view'
      },
      {
        id: 'integration_failed_webhooks',
        title: 'Failed Webhooks (24h)',
        type: 'scorecard',
        dataSource: 'IntegrationStatistics.getFailedWebhooks24h',
        size: 'small',
        permission: 'integrationhub.dashboard.view'
      },
      {
        id: 'integration_email_sent_rate',
        title: 'Emails Sent (24h)',
        type: 'scorecard',
        dataSource: 'IntegrationStatistics.getEmailsSent24h',
        size: 'small',
        permission: 'integrationhub.dashboard.view'
      },
      {
        id: 'integration_traffic_by_type',
        title: 'Integration Traffic by Type',
        type: 'pie_chart',
        dataSource: 'IntegrationStatistics.getTrafficByType',
        size: 'large',
        permission: 'integrationhub.dashboard.view'
      }
    ];
  }
}

// Register the dashboard with the framework
WK.dashboard('integration_hub', IntegrationDashboard.getWidgets());