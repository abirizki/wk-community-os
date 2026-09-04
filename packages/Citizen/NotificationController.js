/**
 * @class NotificationController
 * @description Handles API requests for managing user notifications, such as the inbox.
 */
class NotificationController {
  /**
   * @param {InboxService} inboxService
   * @param {BroadcastService} broadcastService
   */
  constructor(inboxService, broadcastService) {
    /** @private */
    this.inboxService = inboxService;
    /** @private */
    this.broadcastService = broadcastService;
  }

  /**
   * Gets the notifications for the currently logged-in user's inbox.
   * @param {object} request - The request object, may contain pagination in `request.query`.
   * @returns {object} Standard API response with an array of notifications.
   */
  getInbox(request) {
    try {
      const user = WK.session().getUser();
      if (!user) throw new Error('Authentication required.');
      
      const options = request.query || {}; // e.g., { limit: 20, offset: 0 }
      const notifications = this.inboxService.getInboxForUser(user.id, options);
      
      return { success: true, data: notifications };
    } catch (error) {
      WK.logger().error(`Error in NotificationController.getInbox: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Marks a specific notification as read.
   * @param {object} request - Expects { params: { id } }.
   * @returns {object} Standard API response.
   */
  markAsRead(request) {
    try {
      const user = WK.session().getUser();
      const notificationId = request.params.id;
      if (!notificationId) throw new Error('Notification ID is required.');

      const success = this.inboxService.markAsRead(user.id, notificationId);
      return { success: success, message: success ? 'Notification marked as read.' : 'Failed to mark as read.' };
    } catch (error) {
      WK.logger().error(`Error in NotificationController.markAsRead: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }

  /**
   * Creates and sends a broadcast message.
   * @param {object} request - Expects { body: { title, body, targets, channels } }.
   * @returns {object} Standard API response.
   */
  sendBroadcast(request) {
    try {
      WK.security().checkPermission('notification.broadcast');
      const { title, body, targets, channels } = request.body;
      if (!title || !body || !targets || !channels) {
        throw new Error('Title, body, targets, and channels are required for a broadcast.');
      }

      const summary = this.broadcastService.send({ title, body, targets, channels });
      return { success: true, data: summary, message: 'Broadcast has been queued for delivery.' };
    } catch (error) {
      WK.logger().error(`Error in NotificationController.sendBroadcast: ${error.message}`, error.stack);
      return { success: false, message: error.message };
    }
  }
}