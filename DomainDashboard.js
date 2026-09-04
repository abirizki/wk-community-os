/**
 * @class DomainDashboard
 * @description Defines the main dashboard for the Community Governance Domain.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DomainDashboard {
  /**
   * Returns an array of widget definitions for the main domain dashboard.
   * @returns {object[]} An array of widget configuration objects.
   */
  static getWidgets() {
    return [
      {
        id: 'governance_domain_upcoming_meetings',
        title: 'Upcoming Meetings',
        type: 'scorecard',
        dataSource: 'DomainAnalytics.getUpcomingMeetingsCount',
        size: 'small',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_domain_pending_decisions',
        title: 'Decisions Pending Approval',
        type: 'scorecard',
        dataSource: 'DomainAnalytics.getPendingDecisionsCount',
        size: 'small',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_domain_active_audits',
        title: 'Active Internal Audits',
        type: 'scorecard',
        dataSource: 'DomainAnalytics.getActiveAuditsCount',
        size: 'small',
        permission: 'governance.dashboard.view'
      },
      {
        id: 'governance_domain_regulation_status',
        title: 'Regulation Status Overview',
        type: 'pie_chart',
        dataSource: 'DomainAnalytics.getRegulationStatusDistribution',
        size: 'large',
        permission: 'governance.dashboard.view'
      }
    ];
  }
}

// Register the domain dashboard with the framework
WK.dashboard('domain_governance', DomainDashboard.getWidgets());