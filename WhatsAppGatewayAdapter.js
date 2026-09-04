/**
 * @class WhatsAppGatewayAdapter
 * @description Manages sending and receiving messages via the WhatsApp Business API.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class WhatsAppGatewayAdapter {
  /**
   * @param {RestApiAdapter} restApiAdapter
   * @param {ConfigurationService} configurationService
   */
  constructor(restApiAdapter, configurationService) {
    /** @private */
    this.restApiAdapter = restApiAdapter;
    /** @private */
    this.configurationService = configurationService;
  }

  /**
   * Sends a WhatsApp message (e.g., a template message).
   * @param {string} recipientNumber - The recipient's WhatsApp number.
   * @param {string} templateName - The name of the pre-approved WhatsApp template.
   * @param {object} [templateParams] - Parameters to populate the template.
   * @returns {object} Result of the WhatsApp message sending operation.
   */
  sendMessage(recipientNumber, templateName, templateParams = {}) {
    WK.security().checkPermission('integrationhub.whatsapp.send');
    const whatsappConfig = this.configurationService.get('whatsapp_gateway');
    if (!whatsappConfig || !whatsappConfig.api_url || !whatsappConfig.api_token) {
      throw new Error('WhatsApp Gateway configuration missing.');
    }

    WK.logger().info(`WhatsAppGatewayAdapter: Sending template "${templateName}" to ${recipientNumber}.`);

    // [TODO: Map parameters to specific WhatsApp API payload format]
    const payload = { to: recipientNumber, template: { name: templateName, components: templateParams } };
    return this.restApiAdapter.post(whatsappConfig.api_url, '/messages', payload, { 'Authorization': `Bearer ${whatsappConfig.api_token}` });
  }
}