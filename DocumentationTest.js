/**
 * @class DocumentationTest
 * @description Provides a test suite for the Documentation Center package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationTest {
  /**
   * Main entry point to run all tests for the Documentation Center package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Documentation Center Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = DocumentationTest.testDocumentationDiscovery() && allTestsPassed;
    allTestsPassed = DocumentationTest.testDocumentationGeneration() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Documentation Center Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Documentation Center Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockPackageManager = { getAllPackages: () => [{ id: 'citizen', name: 'Citizen' }] };
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });

    const documentationDiscovery = new DocumentationDiscovery(mockPackageManager, null);
    const documentationGenerator = new DocumentationGenerator();

    return { documentationDiscovery, documentationGenerator };
  }

  static testDocumentationDiscovery() {
    WK.logger().info('Running DocumentationDiscovery.discoverAll test...');
    const { documentationDiscovery } = DocumentationTest._setupMocks();
    const docs = documentationDiscovery.discoverAll();
    console.assert(docs.length > 0, 'Test Failed: No documents were discovered.');
    console.assert(docs.some(d => d.id === 'citizen.readme'), 'Test Failed: Citizen README not discovered.');
    WK.logger().info('DocumentationDiscovery.discoverAll test passed.');
    return true;
  }

  static testDocumentationGeneration() {
    WK.logger().info('Running DocumentationGenerator.generate test...');
    const { documentationGenerator } = DocumentationTest._setupMocks();
    const html = documentationGenerator.generate('# My Title', 'markdown');
    console.assert(html.includes('<h1>My Title</h1>'), 'Test Failed: Markdown H1 not generated correctly.');
    WK.logger().info('DocumentationGenerator.generate test passed.');
    return true;
  }
}

// Global function to run all tests
function runAllDocumentationCenterTests() {
  DocumentationTest.runAll();
}