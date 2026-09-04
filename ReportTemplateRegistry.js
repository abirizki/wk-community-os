/**
 * @class ReportTemplateRegistry
 * @description A registry that holds the definitions for all available reports.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportTemplateRegistry {
  constructor() {
    /** @private @type {Map<string, object>} */
    this.templates = new Map();
    this._loadTemplates();
  }

  /**
   * @private
   */
  _loadTemplates() {
    // In a real system, this would load from a database or configuration files.
    const healthReportTemplate = {
      id: 'health_monthly_summary',
      name: 'Monthly Health Summary',
      description: 'A summary of key health indicators for the last month.',
      dataSources: ['HealthStatistics.getMonthlySummary'],
      fileName: 'Health_Summary',
      htmlContent: '<h1><?= data.title ?></h1><p>Stunting Rate: <?= data.stats.stunting_rate ?></p>'
    };

    this.templates.set(healthReportTemplate.id, healthReportTemplate);

    // [TODO: Add templates for all other report types: Education, PBB, Complaint, etc.]
  }

  /**
   * Retrieves a report template by its ID.
   * @param {string} reportId - The unique ID of the report template.
   * @returns {object|undefined}
   */
  getTemplate(reportId) {
    return this.templates.get(reportId);
  }
}