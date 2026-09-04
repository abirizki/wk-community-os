/**
 * Provides authentication operations for the System package.
 * @class
 */
class SystemAuthenticationService {
  /**
   * Creates an authentication service.
   * @param {Object} sessionStore - Session storage.
   * @param {Object} userService - User service.
   */
  constructor(sessionStore, userService) {
    this.sessionStore = sessionStore || { items: new Map() };
    this.userService = userService || new UserService();
  }

  /**
   * Logs in a user.
   * @param {string} username - Username.
   * @param {string} password - Password.
   * @returns {Object} Authentication result.
   */
  login(username, password) {
    const user = this.userService.read(username);
    if (!user) {
      return { success: false, message: 'User not found' };
    }
    const token = `token-${Date.now()}`;
    this.sessionStore.items.set(token, { userId: user.id, username: user.username });
    return { success: true, token, user };
  }

  /**
   * Logs out a user.
   * @param {string} token - Session token.
   * @returns {boolean} True when removed.
   */
  logout(token) {
    return this.sessionStore.items.delete(token);
  }

  /**
   * Returns the current user for a token.
   * @param {string} token - Session token.
   * @returns {Object|null} Session payload.
   */
  currentUser(token) {
    return this.sessionStore.items.get(token) || null;
  }

  /**
   * Creates a token.
   * @param {Object} payload - Token payload.
   * @returns {string} Token identifier.
   */
  createToken(payload) {
    const token = `token-${Date.now()}`;
    this.sessionStore.items.set(token, payload);
    return token;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemAuthenticationService };
}
