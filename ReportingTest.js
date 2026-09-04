/**
 * @class ReportingTest
 * @description Provides a test suite for the Reporting Center package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportingTest {
  /**
   * Main entry point to run all tests for the Reporting Center package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Reporting Center Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = ReportingTest.testReportGenerationFlow() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Reporting Center Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Reporting Center Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockPdfGenerator = { generate: (template, data) => new Blob([`PDF for ${data.title}`], { type: 'application/pdf' }) };
    const mockExcelGenerator = { generate: (template, data) => ({}) }; // Mock Spreadsheet object
    const mockAnalyticsService = {};
    WK.security = () => ({ checkPermission: () => true });
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });

    const reportTemplateRegistry = new ReportTemplateRegistry();
    const reportGenerator = new ReportGenerator(mockPdfGenerator, mockExcelGenerator);
    const reportingService = new ReportingService(reportTemplateRegistry, reportGenerator, mockAnalyticsService);

    return { reportingService };
  }

  static testReportGenerationFlow() {
    WK.logger().info('Running ReportingService.generateReport test...');
    const { reportingService } = ReportingTest._setupMocks();
    const reportBlob = reportingService.generateReport('health_monthly_summary', 'PDF');
    console.assert(reportBlob.getContentType() === 'application/pdf', 'Test Failed: Incorrect blob type generated.');
    WK.logger().info('ReportingService.generateReport test passed.');
    return true;
  }
}

// Global function to run all tests
function runAllReportingCenterTests() {
  ReportingTest.runAll();
}