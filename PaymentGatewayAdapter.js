/**
 * @class PaymentGatewayAdapter
 * @description Provides a standardized interface for processing payments through various payment service providers.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class PaymentGatewayAdapter {
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
   * Initiates a payment transaction.
   * @param {string} gatewayKey - Configuration key for the payment gateway (e.g., 'payment_gateways.midtrans').
   * @param {object} transactionDetails - Details of the transaction (amount, orderId, customerInfo).
   * @returns {object} Payment initiation response (e.g., redirect URL, transaction token).
   */
  initiatePayment(gatewayKey, transactionDetails) {
    WK.security().checkPermission('integrationhub.payment.initiate');
    const gatewayConfig = this.configurationService.get(gatewayKey);
    if (!gatewayConfig || !gatewayConfig.api_url || !gatewayConfig.api_key) {
      throw new Error(`Payment gateway configuration missing for key: ${gatewayKey}`);
    }

    WK.logger().info(`PaymentGatewayAdapter: Initiating payment via ${gatewayKey} for order ${transactionDetails.orderId}.`);

    // [TODO: Map transactionDetails to specific gateway's payload format]
    const payload = { ...transactionDetails, api_key: gatewayConfig.api_key };

    // Assuming a POST request for payment initiation
    return this.restApiAdapter.post(gatewayConfig.api_url, '/payments/initiate', payload);
  }
}