/**
 * @class WorkflowStatistics
 * @description Provides aggregated statistical data for the Workflow package.
 */
class WorkflowStatistics {
  /**
   * @param {WorkflowRepository} repository
   * @param {AnalyticsService} analyticsService
   */
  constructor(repository, analyticsService) {
    /** @private */
    this.repository = repository;
    /** @private */
    this.analyticsService = analyticsService;
    /** @private */
    this.cache = WK.cache('workflow_stats');
    /** @private */
    this.logger = WK.logger('WorkflowStatistics');
    /** @private */
    this.defaultCacheTTL = 300; // 5 minutes for operational workflow data
  }

  /**
   * Retrieves a high-level summary of workflow instance statistics.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object containing summary statistics.
   */
  getSummary(filters = {}) {
    WK.security().checkPermission('workflow.statistics.view');
    const cacheKey = `summary_${JSON.stringify(filters)}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const summary = {
      totalWorkflows: this.repository.count({ ...filters }),
      inProgressWorkflows: this.repository.count({ ...filters, status: 'IN_PROGRESS' }),
      completedWorkflows: this.repository.count({ ...filters, status: 'COMPLETED' }),
      failedWorkflows: this.repository.count({ ...filters, status: 'FAILED' }),
      cancelledWorkflows: this.repository.count({ ...filters, status: 'CANCELLED' }),
    };

    this.cache.set(cacheKey, summary, this.defaultCacheTTL);
    return summary;
  }

  /**
   * Retrieves the monthly trend of new workflow starts.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} Time-series data suitable for a line chart.
   */
  getStartedTrend(filters = {}) {
    WK.security().checkPermission('workflow.statistics.view');
    return this.analyticsService.getTimeSeries({
      metric: 'workflow_started',
      aggregation: 'count',
      period: 'monthly',
      dateRange: filters.dateRange || 'last_12_months',
      filters: filters,
    });
  }

  /**
   * Calculates the distribution of workflows by their definition ID.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getDefinitionDistribution(filters = {}) {
    WK.security().checkPermission('workflow.statistics.view');
    // In a real system, this list would come from the WorkflowDefinitionProvider.
    const definitions = ['LETTER_APPROVAL_V1', 'COMPLAINT_RESOLUTION_V1'];
    const distribution = definitions.map(defId => ({
      name: defId.replace(/_V\d+$/, '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: this.repository.count({ ...filters, definitionId: defId }),
    }));
    return distribution.filter(d => d.value > 0);
  }

  /**
   * Calculates the distribution of workflows by their current state, identifying bottlenecks.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object[]} An array of objects with { name, value }.
   */
  getCurrentStateDistribution(filters = {}) {
    WK.security().checkPermission('workflow.statistics.view');
    // This is a heavy operation if not supported by a proper DB.
    // For now, we assume the analytics service can provide this via a GROUP BY query.
    return this.analyticsService.getDistribution({
      metric: 'workflow_current_state',
      filters: { ...filters, status: 'IN_PROGRESS' },
    });
  }

  /**
   * Calculates the average cycle time for completed workflows.
   * @param {object} [filters={}] - Optional filters for the query.
   * @returns {object} An object with average time in days/hours.
   */
  getAverageCycleTime(filters = {}) {
    WK.security().checkPermission('workflow.statistics.view');
    // This complex calculation is delegated to the AnalyticsService.
    // It would measure the time from createdAt to completedAt.
    return this.analyticsService.getAverage({
      metric: 'workflow_cycle_time',
      unit: 'hours',
      filters: { ...filters, status: 'COMPLETED' },
    });
  }
}