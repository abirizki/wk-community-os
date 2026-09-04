/**
 * @class AuditLogService
 * @description The core service for logging all significant system and user activities.
 * It subscribes to all events on the EventBus to create an immutable audit trail.
 */
class AuditLogService {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('audit_logs');
    WK.logger().info('AuditLogService initialized for table: audit_logs');
    this._subscribeToEvents();
  }

  /**
   * Subscribes to all events on the EventBus.
   * @private
   */
  _subscribeToEvents() {
    const eventBus = WK.service('eventbus');
    if (eventBus) {
      eventBus.subscribe('*', (event) => this.logEvent(event));
      WK.logger().info('AuditLogService subscribed to all EventBus events (*).');
    } else {
      WK.logger().error('AuditLogService could not subscribe to EventBus because the service was not found.');
    }
  }

  /**
   * Creates an audit log entry from an EventBus event.
   * @param {EventEntity} event - The event object from the EventBus.
   */
  logEvent(event) {
    // Avoid logging the audit event itself to prevent an infinite loop
    if (event.eventType.startsWith('Audit.')) {
      return;
    }

    const auditEntry = {
      id: WK.helper().generateUuid(),
      timestamp: event.timestamp,
      userId: event.user ? event.user.id : 'SYSTEM',
      userRole: event.user ? event.user.role : 'SYSTEM',
      ipAddress: event.sourceContext ? event.sourceContext.ip : 'N/A', // Assuming event source context is added
      action: event.eventType,
      module: event.module,
      entityId: event.referenceId,
      details: {
        payload: event.payload,
        // In a real implementation, we would compute a diff for 'oldValue' and 'newValue'
        oldValue: event.payload.oldData || null,
        newValue: event.payload.newData || null
      }
    };

    try {
      this.db.create(auditEntry);
    } catch (e) {
      WK.logger().error(`Failed to write to audit log: ${e.message}`, e.stack);
    }
  }

  /**
   * Retrieves audit logs based on a filter query.
   * @param {object} [query={}] - An object containing key-value pairs for filtering (e.g., { userId: '...' }).
   * @param {object} [options={}] - Options for pagination and sorting.
   * @returns {object[]} An array of audit log records.
   */
  getLogs(query = {}, options = {}) {
    WK.security().checkPermission('governance.audit.view');
    WK.logger().info(`Audit log query received: ${JSON.stringify(query)}`);
    const effectiveOptions = { sortBy: 'timestamp', order: 'desc', ...options };
    return this.db.findAll(query, effectiveOptions);
  }
}