/**
 * Provides address-related operations.
 * @class
 */
class AddressService {
  /**
   * Creates an address service.
   * @param {Object} repository - Repository object.
   */
  constructor(repository) {
    this.repository = repository || { items: new Map() };
    this.items = this.repository.items || new Map();
  }

  /**
   * Saves an address.
   * @param {string} citizenId - Citizen identifier.
   * @param {Object} payload - Address payload.
   * @returns {Object} Address record.
   */
  save(citizenId, payload) {
    const address = Object.assign({ citizenId }, payload);
    this.items.set(citizenId, address);
    return address;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AddressService };
}
