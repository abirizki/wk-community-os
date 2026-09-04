/**
 * @class SecurityMonitoringService
 * @description Monitors system events for suspicious activities and triggers alerts.
 */
class SecurityMonitoringService {
  /**
   * @param {NotificationService} notificationService
   */
  constructor(notificationService) {
    /** @private */
    this.notificationService = notificationService;
    /** @private */
    this.failedLoginCache = WK.cache().getCache('failed_logins');
    this._subscribeToEvents();
  }

  /**
   * Subscribes to security-relevant events.
   * @private
   */
  _subscribeToEvents() {
    const eventBus = WK.service('eventbus');
    if (eventBus) {
      eventBus.subscribe('Auth.Login.Failed', (event) => this.handleFailedLogin(event));
      eventBus.subscribe('Permission.Changed', (event) => this.handlePermissionChange(event));
      eventBus.subscribe('User.Role.Changed', (event) => this.handleRoleChange(event));
      WK.logger().info('SecurityMonitoringService subscribed to security events.');
    } else {
      WK.logger().error('SecurityMonitoringService could not subscribe to EventBus.');
    }
  }

  /**
   * Handles a failed login event.
   * @param {EventEntity} event The failed login event.
   */
  handleFailedLogin(event) {
    const ipAddress = event.sourceContext ? event.sourceContext.ip : 'unknown_ip';
    const cacheKey = `ip_${ipAddress}`;
    let attempts = parseInt(this.failedLoginCache.get(cacheKey) || '0', 10);
    attempts++;

    WK.logger().warn(`Failed login attempt from IP: ${ipAddress}. Attempt count: ${attempts}`);

    // Policy: Alert admin after 5 failed attempts from the same IP in 1 hour.
    if (attempts >= 5) {
      this.notificationService.createAndQueue({
        recipientId: 'ADMIN_ROLE', // Special recipient ID for a role
        channel: 'EMAIL',
        priority: 'CRITICAL',
        type: 'SECURITY_ALERT',
        title: 'Security Alert: Multiple Failed Logins',
        body: `More than ${attempts} failed login attempts have been detected from the IP address: ${ipAddress}. Please investigate.`
      });
      this.failedLoginCache.remove(cacheKey); // Reset counter after alerting
    } else {
      this.failedLoginCache.put(cacheKey, attempts.toString(), 3600); // Cache for 1 hour
    }
  }

  /**
   * Handles an event where a role's permissions have changed.
   * @param {EventEntity} event The permission change event.
   */
  handlePermissionChange(event) {
    // For now, just log it. In the future, could trigger an access review.
    WK.logger().warn(`Security Event: Permissions changed for role '${event.referenceId}'. User: ${event.user.id}`);
  }

  handleRoleChange(event) {
    WK.logger().warn(`Security Event: Role changed for user '${event.referenceId}'. New role: ${event.payload.newRoleId}. Changed by: ${event.user.id}`);
  }
}