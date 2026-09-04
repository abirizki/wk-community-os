/**
 * Provides profile operations for a user.
 * @class
 */
class ProfileService {
  /**
   * Creates a profile service.
   * @param {Object} repository - Profile repository.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates or updates a profile.
   * @param {string} userId - User identifier.
   * @param {Object} payload - Profile payload.
   * @returns {Object} Profile record.
   */
  save(userId, payload) {
    const profile = Object.assign({ userId, photo: null, contact: null }, payload);
    this.items.set(userId, profile);
    return profile;
  }

  /**
   * Reads a profile.
   * @param {string} userId - User identifier.
   * @returns {Object|null} Profile record.
   */
  read(userId) {
    return this.items.get(userId) || null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProfileService };
}
