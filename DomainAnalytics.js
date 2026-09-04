/**
 * @class DomainAnalytics
 * @description Provides high-level analytical data for the Community Governance Domain.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DomainAnalytics {
  /**
   * @param {AnalyticsService} analyticsService - The core platform Analytics Service.
   * @param {object} context - An object containing all instantiated repositories from the domain.
   */
  constructor(analyticsService, context) {
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.context = context;
  }

  /**
   * Fetches the count of upcoming official meetings.
   * @returns {number}
   */
  getUpcomingMeetingsCount() {
    const metricName = 'governance.domain.upcoming_meetings_count';
    return this.analyticsService.getDashboardData(metricName);
  }

  /**
   * Fetches the total number of decisions that are pending final approval.
   * @returns {number}
   */
  getPendingDecisionsCount() {
    const metricName = 'governance.domain.pending_decisions_count';
    return this.analyticsService.getDashboardData(metricName);
  }

  /**
   * Fetches the total number of active internal audits.
   * @returns {number}
   */
  getActiveAuditsCount() {
    const metricName = 'governance.domain.active_audits_count';
    return this.analyticsService.getDashboardData(metricName);
  }

  /**
   * Fetches the distribution of regulations by their status.
   * @returns {object}
   */
  getRegulationStatusDistribution() {
    const metricName = 'governance.domain.regulation_status_distribution';
    return this.analyticsService.getDashboardData(metricName);
  }
}