/**
 * Provides structured logging for the Core Platform.
 * @class
 */
class LoggerService {
  /**
   * Creates a logger instance.
   */
  constructor() {
    this.entries = [];
  }

  /**
   * Writes a log entry.
   * @param {string} level - Log level.
   * @param {string} message - Message body.
   * @param {Object} context - Optional context.
   * @returns {Object} The created log entry.
   */
  log(level, message, context) {
    const entry = {
      level,
      message,
      context: context || {},
      timestamp: new Date().toISOString()
    };
    this.entries.push(entry);
    return entry;
  }

  /**
   * Writes a debug message.
   * @param {string} message - Message body.
   * @param {Object} context - Optional context.
   * @returns {Object} The created log entry.
   */
  debug(message, context) {
    return this.log('debug', message, context);
  }

  /**
   * Writes an informational message.
   * @param {string} message - Message body.
   * @param {Object} context - Optional context.
   * @returns {Object} The created log entry.
   */
  info(message, context) {
    return this.log('info', message, context);
  }

  /**
   * Writes a warning message.
   * @param {string} message - Message body.
   * @param {Object} context - Optional context.
   * @returns {Object} The created log entry.
   */
  warn(message, context) {
    return this.log('warn', message, context);
  }

  /**
   * Writes an error message.
   * @param {string} message - Message body.
   * @param {Object} context - Optional context.
   * @returns {Object} The created log entry.
   */
  error(message, context) {
    return this.log('error', message, context);
  }

  /**
   * Returns the latest log entries.
   * @param {number} count - Number of entries to return.
   * @returns {Array} Log entries.
   */
  getRecent(count) {
    return this.entries.slice(-count);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LoggerService
  };
}
