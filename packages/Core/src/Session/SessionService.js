/**
 * Manages platform sessions for authenticated principals.
 * @class
 */
class SessionService {
  /**
   * Creates a session service.
   * @param {StorageService} storageService - Storage service.
   * @param {LoggerService} loggerService - Logger service.
   * @param {ConfigurationManager} configuration - Configuration manager.
   */
  constructor(storageService, loggerService, configuration) {
    this.storage = storageService;
    this.logger = loggerService || new LoggerService();
    this.configuration = configuration;
  }

  /**
   * Creates a session for a principal.
   * @param {Object} principal - Principal object.
   * @param {string} credential - Credential string.
   * @returns {string} Session identifier.
   */
  createSession(principal, credential) {
    const sessionId = `session-${Date.now()}`;
    this.storage.set(sessionId, { principal, credential });
    this.logger.info('Session created', { sessionId, principalId: principal.id });
    return sessionId;
  }

  /**
   * Retrieves a session by identifier.
   * @param {string} sessionId - Session identifier.
   * @returns {Object|null} Session payload.
   */
  getSession(sessionId) {
    return this.storage.get(sessionId, null);
  }

  /**
   * Destroys a session.
   * @param {string} sessionId - Session identifier.
   */
  destroySession(sessionId) {
    this.storage.remove(sessionId);
    this.logger.info('Session removed', { sessionId });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SessionService
  };
}
