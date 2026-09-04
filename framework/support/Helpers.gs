/**
 * Shared helper utilities for WK Framework.
 */
const Helpers = {
  isEmpty(value) {
    return value === null || value === undefined || value === '';
  },

  isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  },

  isArray(value) {
    return Array.isArray(value);
  },

  clone(value) {
    return JSON.parse(JSON.stringify(value));
  },

  uuid() {
    return Utilities.getUuid();
  },

  timestamp() {
    return new Date().toISOString();
  }
};
