/**
 * @class IntegrationService
 * @description The main service facade for orchestrating all integration activities.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationService {
  /**
   * @param {RestApiAdapter} restApiAdapter
   * @param {WebhookManager} webhookManager
   * @param {QueueAdapter} queueAdapter
   * @param {ImportService} importService
   * @param {ExportService} exportService
   * @param {GovernmentIntegrationManager} governmentIntegrationManager
   * @param {PaymentGatewayAdapter} paymentGatewayAdapter
   * @param {EmailGatewayAdapter} emailGatewayAdapter
   * @param {SmsGatewayAdapter} smsGatewayAdapter
   * @param {WhatsAppGatewayAdapter} whatsAppGatewayAdapter
   * @param {IntegrationValidator} integrationValidator
   */
  constructor(
    restApiAdapter,
    webhookManager,
    queueAdapter,
    importService,
    exportService,
    governmentIntegrationManager,
    paymentGatewayAdapter,
    emailGatewayAdapter,
    smsGatewayAdapter,
    whatsAppGatewayAdapter,
    integrationValidator
  ) {
    /** @private */
    this.restApiAdapter = restApiAdapter;
    /** @private */
    this.webhookManager = webhookManager;
    /** @private */
    this.queueAdapter = queueAdapter;
    /** @private */
    this.importService = importService;
    /** @private */
    this.exportService = exportService;
    /** @private */
    this.governmentIntegrationManager = governmentIntegrationManager;
    /** @private */
    this.paymentGatewayAdapter = paymentGatewayAdapter;
    /** @private */
    this.emailGatewayAdapter = emailGatewayAdapter;
    /** @private */
    this.smsGatewayAdapter = smsGatewayAdapter;
    /** @private */
    this.whatsAppGatewayAdapter = whatsAppGatewayAdapter;
    /** @private */
    this.integrationValidator = integrationValidator;
    /** @private */
    this.eventBus = WK.service('eventbus');
  }

  /**
   * Sends an email using the configured email gateway.
   * @param {string} recipient - The email address of the recipient.
   * @param {string} subject - The subject of the email.
   * @param {string} body - The HTML or plain text body of the email.
   * @returns {object} Result of the email sending operation.
   */
  sendEmail(recipient, subject, body) {
    WK.security().checkPermission('integrationhub.email.send');
    this.integrationValidator.validateEmailPayload({ recipient, subject, body });
    WK.logger().info(`IntegrationService: Sending email to ${recipient} with subject "${subject}".`);
    return this.emailGatewayAdapter.sendEmail(recipient, subject, body);
  }

  /**
   * Sends an SMS message using the configured SMS gateway.
   * @param {string} phoneNumber - The recipient's phone number.
   * @param {string} message - The SMS message content.
   * @returns {object} Result of the SMS sending operation.
   */
  sendSms(phoneNumber, message) {
    WK.security().checkPermission('integrationhub.sms.send');
    this.integrationValidator.validateSmsPayload({ phoneNumber, message });
    WK.logger().info(`IntegrationService: Sending SMS to ${phoneNumber}.`);
    return this.smsGatewayAdapter.sendMessage(phoneNumber, message);
  }

  /**
   * Processes an incoming webhook request.
   * This method is typically called by a web app endpoint.
   * @param {string} webhookType - Identifier for the type of webhook (e.g., 'payment_gateway_callback').
   * @param {object} payload - The raw payload from the webhook.
   * @param {object} headers - The request headers, potentially containing signatures.
   * @returns {object} A response to the webhook sender.
   */
  handleWebhook(webhookType, payload, headers) {
    WK.logger().info(`IntegrationService: Handling incoming webhook of type "${webhookType}".`);
    const processedEvent = this.webhookManager.processWebhook(webhookType, payload, headers);
    this.eventBus.publish(processedEvent); // Publish the processed event to the internal EventBus
    return { status: 'success', message: 'Webhook received and processed.' };
  }
}