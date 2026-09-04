/**
 * Provides operator support for the System package.
 * @class
 */
class OperatorService {
  /**
   * Creates an operator service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Creates an operator entity.
   * @param {Object} payload - Operator payload.
   * @returns {Object} Operator record.
   */
  create(payload) {
    const item = Object.assign({ id: `op-${Date.now()}` }, payload);
    this.items.set(item.id, item);
    return item;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OperatorService };
}
