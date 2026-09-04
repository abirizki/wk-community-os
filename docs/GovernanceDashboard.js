/**
 * @class GovernanceDashboard
 * @description Defines and registers all dashboard widgets for the Governance package.
 */
class GovernanceDashboard {
  /**
   * Returns an array of widget definitions for the Governance module.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      // --- Key Performance Indicators (KPIs) ---
      {
        id: 'governance_total_audits_day',
        title: 'Total Audit Events (24h)',
        type: 'scorecard',
        dataSource: 'GovernanceStatistics.getTotalAuditEventsToday',
        size: 'small',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_security_alerts_day',
        title: 'Security Alerts (24h)',
        type: 'scorecard',
        dataSource: 'GovernanceStatistics.getSecurityAlertsToday',
        size: 'small',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_open_risks',
        title: 'Open Risks',
        type: 'scorecard',
        dataSource: 'GovernanceStatistics.getOpenRisksCount',
        size: 'small',
        permission: 'governance.dashboard.view'
      },

      // --- Charts and Tables ---
      {
        id: 'governance_audit_by_module_chart',
        title: 'Audit Events by Module',
        type: 'bar_chart',
        dataSource: 'GovernanceStatistics.getAuditEventsByModule',
        size: 'medium',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_risk_matrix',
        title: 'Risk Matrix',
        type: 'table', // Or a custom matrix widget type
        dataSource: 'GovernanceStatistics.getRiskMatrix',
        size: 'large',
        permission: 'governance.dashboard.view'
      }
    ];
  }
}

// Register the dashboard widgets with the framework's Dashboard Dispatcher
WK.dashboard('governance', GovernanceDashboard.getWidgets());