/**
 * @class PerformanceMonitor
 * @description Monitors the performance of key application functions.
 */
class PerformanceMonitor {
  constructor() {
    /** @private */
    this.perfCache = WK.cache().getCache('performance_metrics');
  }

  /**
   * Logs the execution time of a specific function.
   * This should be called by the function being monitored.
   * @param {string} functionName - The name of the function (e.g., 'LetterService.requestLetter').
   * @param {number} executionTimeMs - The time taken in milliseconds.
   */
  logExecutionTime(functionName, executionTimeMs) {
    // This is a simplified implementation. A real one would use a more robust
    // time-series data structure to calculate averages, p95, p99, etc.
    const currentData = JSON.parse(this.perfCache.get(functionName) || '{"total":0,"count":0}');
    currentData.total += executionTimeMs;
    currentData.count++;
    this.perfCache.put(functionName, JSON.stringify(currentData), 21600); // Cache for 6 hours
  }

  /**
   * Gets the average execution time for a monitored function.
   * @param {string} functionName - The name of the function.
   * @returns {number} The average execution time in milliseconds, or 0 if no data.
   */
  getAverageExecutionTime(functionName) {
    WK.security().checkPermission('operations.performance.view');
    const data = JSON.parse(this.perfCache.get(functionName) || 'null');
    if (!data || data.count === 0) {
      return 0;
    }
    return data.total / data.count;
  }
}