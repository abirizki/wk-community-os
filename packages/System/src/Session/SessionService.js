/**
 * Manages session lifecycle for the System package.
 * @class
 */
class SessionService {
  /**
   * Creates a session service.
   * @param {Object} store - Session store.
   */
  constructor(store) {
    this.store = store || { items: new Map() };
  }

  /**
   * Creates a session entry.
   * @param {string} token - Session token.
   * @param {Object} payload - Session payload.
   */
  create(token, payload) {
    this.store.items.set(token, payload);
  }

  /**
   * Validates a session.
   * @param {string} token - Session token.
   * @returns {Object|null} Session payload.
   */
  validate(token) {
    return this.store.items.get(token) || null;
  }

  /**
   * Invalidates a session.
   * @param {string} token - Session token.
   */
  invalidate(token) {
    this.store.items.delete(token);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SessionService };
}
