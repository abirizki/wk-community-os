/**
 * Provides organization-level data for the System package.
 * @class
 */
class OrganizationService {
  /**
   * Creates an organization service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates an organization entity.
   * @param {Object} payload - Organization payload.
   * @returns {Object} Organization record.
   */
  create(payload) {
    const item = Object.assign({ id: `org-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }

  /**
   * Reads an organization entity.
   * @param {string} id - Organization identifier.
   * @returns {Object|null} Organization record.
   */
  read(id) {
    return this.items.get(id) || null;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OrganizationService };
}
