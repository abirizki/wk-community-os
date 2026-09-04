/**
 * Basic smoke test for the Core Platform package.
 */
class CorePlatformSmokeTest {
  /**
   * Runs the smoke test.
   * @returns {Object} Test result.
   */
  run() {
    const context = new PlatformContext();
    const authResult = context.authentication.authenticate({ id: 'citizen-1' }, 'secret');
    const authorized = context.authorization.authorize('admin', 'core.read');
    context.permission.register('core.read');
    context.role.register('admin', ['core.read']);
    const permissionResult = context.authorization.authorize('admin', 'core.read');
    return {
      success: authResult.success && permissionResult,
      authenticated: authResult.success,
      authorized: permissionResult,
      snapshot: context.createRuntimeSnapshot()
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CorePlatformSmokeTest
  };
}
