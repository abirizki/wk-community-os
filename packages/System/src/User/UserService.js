/**
 * Provides user lifecycle operations for the System package.
 * @class
 */
class UserService {
  /**
   * Creates a user service.
   * @param {Object} repository - Storage-like repository.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates a user record.
   * @param {Object} payload - User payload.
   * @returns {Object} Created user.
   */
  create(payload) {
    const user = {
      id: payload.id || `user-${Date.now()}`,
      username: payload.username,
      email: payload.email,
      status: payload.status || 'inactive',
      activated: Boolean(payload.activated),
      passwordPolicy: payload.passwordPolicy || 'default',
      profile: payload.profile || null,
      createdAt: new Date().toISOString()
    };
    this.items.set(user.id, user);
    return user;
  }

  /**
   * Reads a user by identifier.
   * @param {string} id - User identifier.
   * @returns {Object|null} User record.
   */
  read(id) {
    return this.items.get(id) || null;
  }

  /**
   * Updates a user record.
   * @param {string} id - User identifier.
   * @param {Object} payload - Partial user update.
   * @returns {Object|null} Updated user.
   */
  update(id, payload) {
    const current = this.items.get(id);
    if (!current) {
      return null;
    }
    const updated = Object.assign(current, payload);
    this.items.set(id, updated);
    return updated;
  }

  /**
   * Deletes a user record.
   * @param {string} id - User identifier.
   * @returns {boolean} True when deleted.
   */
  delete(id) {
    return this.items.delete(id);
  }

  /**
   * Activates a user.
   * @param {string} id - User identifier.
   * @returns {Object|null} Updated user.
   */
  activate(id) {
    const current = this.items.get(id);
    if (!current) {
      return null;
    }
    current.status = 'active';
    current.activated = true;
    this.items.set(id, current);
    return current;
  }

  /**
   * Sets a user status.
   * @param {string} id - User identifier.
   * @param {string} status - User status.
   * @returns {Object|null} Updated user.
   */
  setStatus(id, status) {
    const current = this.items.get(id);
    if (!current) {
      return null;
    }
    current.status = status;
    this.items.set(id, current);
    return current;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { UserService };
}
