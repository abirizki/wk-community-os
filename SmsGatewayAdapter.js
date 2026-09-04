/**
 * @class SmsGatewayAdapter
 * @description Manages sending SMS messages via an external SMS provider.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SmsGatewayAdapter {
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
   * Sends an SMS message.
   * @param {string} phoneNumber - The recipient's phone number.
   * @param {string} message - The SMS message content.
   * @returns {object} Result of the SMS sending operation.
   */
  sendMessage(phoneNumber, message) {
    WK.security().checkPermission('integrationhub.sms.send');
    const smsGatewayConfig = this.configurationService.get('sms_gateway');
    if (!smsGatewayConfig || !smsGatewayConfig.api_url || !smsGatewayConfig.api_key) {
      throw new Error('SMS Gateway configuration missing.');
    }

    WK.logger().info(`SmsGatewayAdapter: Sending SMS to ${phoneNumber}.`);

    // [TODO: Map message and phoneNumber to specific gateway's payload format]
    const payload = { to: phoneNumber, text: message, api_key: smsGatewayConfig.api_key };
    return this.restApiAdapter.post(smsGatewayConfig.api_url, '/send', payload);
  }
}