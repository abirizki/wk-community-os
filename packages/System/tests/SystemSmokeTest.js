/**
 * Smoke test for the System package.
 */
class SystemSmokeTest {
  /**
   * Runs the smoke test.
   * @returns {Object} Test result.
   */
  run() {
    const userService = new UserService();
    const user = userService.create({ id: 'u002', username: 'bob', email: 'bob@example.com' });
    const auth = new SystemAuthenticationService({ items: new Map() }, userService);
    const result = auth.login('bob', 'secret');
    return {
      success: Boolean(user && result.success),
      user,
      authResult: result
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemSmokeTest };
}
