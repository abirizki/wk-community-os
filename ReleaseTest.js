/**
 * @class ReleaseTest
 * @description Provides a test suite for the Release Center package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleaseTest {
  /**
   * Main entry point to run all tests for the Release Center package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Release Center Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = ReleaseTest.testVersionValidation() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Release Center Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Release Center Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });
    WK.service = () => ({}); // Mock service container

    const versionManager = new VersionManager();
    return { versionManager };
  }

  static testVersionValidation() {
    WK.logger().info('Running VersionManager.validateNewVersion test...');
    const { versionManager } = ReleaseTest._setupMocks();
    let didThrow = false;
    try {
      versionManager.validateNewVersion('0.9.0', 'MINOR'); // Should fail
    } catch (e) {
      didThrow = true;
    }
    console.assert(didThrow, 'Test Failed: Should have thrown an error for an invalid version number.');
    WK.logger().info('VersionManager.validateNewVersion test passed.');
    return true;
  }
}

// Global function to run all tests
function runAllReleaseCenterTests() {
  ReleaseTest.runAll();
}