/**
 * @class EmailGatewayAdapter
 * @description Manages sending emails via an external email service.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class EmailGatewayAdapter {
  /**
   * @param {ConfigurationService} configurationService
   */
  constructor(configurationService) {
    /** @private */
    this.configurationService = configurationService;
  }

  /**
   * Sends an email.
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The HTML or plain text body of the email.
   * @returns {object} Result of the email sending operation.
   */
  sendEmail(recipient, subject, body) {
    WK.security().checkPermission('integrationhub.email.send');
    const senderEmail = this.configurationService.get('email_gateway.sender_email');
    if (!senderEmail) {
      throw new Error('Sender email not configured in ConfigurationCenter.');
    }

    WK.logger().info(`EmailGatewayAdapter: Sending email from ${senderEmail} to ${recipient}.`);

    // In Apps Script, use MailApp or GmailApp
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      htmlBody: body
    });
    return { status: 'success', message: 'Email sent.' };
  }
}