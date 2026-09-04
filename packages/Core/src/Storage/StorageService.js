/**
 * Provides a simple storage abstraction for platform data.
 * @class
 */
class StorageService {
  /**
   * Creates a storage service.
   * @param {ConfigurationManager} configuration - Configuration source.
   */
  constructor(configuration) {
    this.configuration = configuration;
    this.store = {};
  }

  /**
   * Stores a value under a key.
   * @param {string} key - Storage key.
   * @param {*} value - Value to store.
   */
  set(key, value) {
    this.store[key] = value;
  }

  /**
   * Gets a stored value.
   * @param {string} key - Storage key.
   * @param {*} defaultValue - Default value.
   * @returns {*} Stored value.
   */
  get(key, defaultValue) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : defaultValue;
  }

  /**
   * Removes a stored value.
   * @param {string} key - Storage key.
   */
  remove(key) {
    delete this.store[key];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StorageService
  };
}
