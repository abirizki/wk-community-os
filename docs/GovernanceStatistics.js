/**
 * @class GovernanceStatistics
 * @description Provides statistical data for the Governance Dashboard.
 * This service acts as a facade to the Analytics package and other governance repositories.
 */
class GovernanceStatistics {
  /**
   * @param {AnalyticsService} analyticsService
   * @param {AuditLogService} auditLogService
   * @param {RiskAssessmentService} riskAssessmentService
   */
  constructor(analyticsService, auditLogService, riskAssessmentService) {
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.auditLogService = auditLogService;
    /** @private */
    this.riskAssessmentService = riskAssessmentService;
  }

  /**
   * Fetches the total number of audit events in the last 24 hours.
   * @returns {number}
   */
  getTotalAuditEventsToday() {
    // This would ideally come from the Analytics package for performance.
    // For simplicity, we query the audit log directly here.
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.auditLogService.db.count({ timestamp: { $gte: yesterday.toISOString() } });
  }

  /**
   * Fetches the number of security alerts in the last 24 hours.
   * @returns {number}
   */
  getSecurityAlertsToday() {
    return this.analyticsService.getDashboardData('governance.security_alerts.today');
  }

  /**
   * Fetches the count of open risks.
   * @returns {number}
   */
  getOpenRisksCount() {
    return this.riskAssessmentService.db.count({ status: 'Open' });
  }

  getAuditEventsByModule() {
    return this.analyticsService.getDashboardData('governance.audit_events.by_module');
  }

  getRiskMatrix() {
    return this.riskAssessmentService.getRiskRegister();
  }
}