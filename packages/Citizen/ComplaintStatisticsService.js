/**
 * @class ComplaintStatisticsService
 * @description Provides various statistical calculations and aggregations
 * based on the complaint data. This service is the data source for many
 * dashboard widgets and reports.
 */
class ComplaintStatisticsService {
  /**
   * @param {ComplaintRepository} complaintRepository - The repository for complaint data access.
   * @param {ComplaintCategoryService} categoryService - The service for complaint categories.
   */
  constructor(complaintRepository, categoryService) {
    /** @private */
    this.complaintRepository = complaintRepository;
    /** @private */
    this.categoryService = categoryService;
  }

  /**
   * Retrieves the total number of complaints that are currently open (not resolved or closed).
   * @returns {number} The count of open complaints.
   */
  getTotalOpenComplaints() {
    WK.security().checkPermission('complaint.view.statistics');
    return this.complaintRepository.count({ status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] } });
  }

  /**
   * Retrieves the total number of complaints resolved in the current month.
   * @returns {number} The count of resolved complaints this month.
   */
  getTotalResolvedThisMonth() {
    WK.security().checkPermission('complaint.view.statistics');
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    return this.complaintRepository.count({ status: 'RESOLVED', resolvedAt: { $gte: startOfMonth } });
  }

  /**
   * Retrieves the number of critical complaints that are still pending.
   * @returns {number} The count of critical pending complaints.
   */
  getCriticalPendingComplaints() {
    WK.security().checkPermission('complaint.view.statistics');
    return this.complaintRepository.count({
      priority: 'CRITICAL',
      status: { $nin: ['RESOLVED', 'CLOSED', 'REJECTED'] }
    });
  }

  /**
   * Calculates the average resolution time for complaints.
   * @returns {string} The average resolution time (e.g., "3 days, 5 hours").
   */
  getAverageResolutionTime() {
    WK.security().checkPermission('complaint.view.statistics');
    const resolvedComplaints = this.complaintRepository.findAll({ status: 'RESOLVED' });
    if (resolvedComplaints.length === 0) return 'N/A';

    let totalDurationMs = 0;
    resolvedComplaints.forEach(complaint => {
      if (complaint.submittedAt && complaint.resolvedAt) {
        const submitted = new Date(complaint.submittedAt).getTime();
        const resolved = new Date(complaint.resolvedAt).getTime();
        totalDurationMs += (resolved - submitted);
      }
    });

    const averageMs = totalDurationMs / resolvedComplaints.length;
    return WK.helper().formatDuration(averageMs); // Assuming a helper for duration formatting
  }

  /**
   * Aggregates complaints by category.
   * @returns {object} An object where keys are categories and values are counts.
   */
  getComplaintsByCategory() {
    WK.security().checkPermission('complaint.view.statistics');
    return this.complaintRepository.statistics({ groupBy: 'category', operation: 'count' });
  }

  /**
   * Aggregates complaints by RT (Rukun Tetangga).
   * @returns {object} An object where keys are RT numbers and values are counts.
   */
  getComplaintsByRT() {
    WK.security().checkPermission('complaint.view.statistics');
    // This requires joining with Citizen/Household data or storing RT directly in complaint.
    // Assuming complaint entity stores citizen's RT at submission time or can be joined.
    return this.complaintRepository.statistics({ groupBy: 'citizen.address.rt', operation: 'count' });
  }

  /**
   * Aggregates complaints by RW (Rukun Warga).
   * @returns {object} An object where keys are RW numbers and values are counts.
   */
  getComplaintsByRW() {
    WK.security().checkPermission('complaint.view.statistics');
    return this.complaintRepository.statistics({ groupBy: 'citizen.address.rw', operation: 'count' });
  }

  /**
   * Retrieves the monthly trend of complaints over the last 12 months.
   * @returns {object[]} An array of objects { month: 'YYYY-MM', count: N }.
   */
  getMonthlyComplaintTrend() {
    WK.security().checkPermission('complaint.view.statistics');
    // This requires date-based aggregation support from the repository.
    return this.complaintRepository.statistics({ groupBy: { $month: 'createdAt', $year: 'createdAt' }, operation: 'count', query: { createdAt: { $gte: 'now-12M' } } });
  }
}