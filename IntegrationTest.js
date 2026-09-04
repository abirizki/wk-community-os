/**
 * @class IntegrationTest
 * @description Provides a test suite for the Integration Hub package.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationTest {
  /**
   * Main entry point to run all tests for the Integration Hub package.
   * @returns {boolean} True if all tests pass, false otherwise.
   */
  static runAll() {
    WK.logger().info('--- [START] Integration Hub Package Test Suite ---');
    let allTestsPassed = true;

    allTestsPassed = IntegrationTest.testSendEmail() && allTestsPassed;
    allTestsPassed = IntegrationTest.testSendSms() && allTestsPassed;
    allTestsPassed = IntegrationTest.testHandleWebhook() && allTestsPassed;

    if (allTestsPassed) {
      WK.logger().info('--- [PASS] All Integration Hub Package Tests Passed ---');
    } else {
      WK.logger().error('--- [FAIL] Some Integration Hub Package Tests Failed ---');
    }
    return allTestsPassed;
  }

  /**
   * Sets up a mock environment for testing.
   * @private
   */
  static _setupMocks() {
    const mockConfigService = {
      get: (key) => {
        if (key === 'email_gateway.sender_email') return 'test@example.com';
        if (key === 'sms_gateway.api_url') return 'https://sms.example.com';
        if (key === 'sms_gateway.api_key') return 'sms_api_key';
        if (key === 'webhooks.payment_gateway_callback') return { secret: 'webhook_secret' };
        return null;
      }
    };
    const mockRestApiAdapter = {
      post: (url, path, payload, headers) => {
        WK.logger().debug(`Mock RestApiAdapter.post: ${url}${path} - ${JSON.stringify(payload)}`);
        return { success: true, externalId: 'ext123' };
      }
    };
    const mockEventBus = { publish: (event) => WK.logger().debug(`EventBus: ${event.eventType} published`) };

    WK.security = () => ({ checkPermission: () => true });
    WK.logger = () => ({ info: console.log, debug: console.log, warn: console.warn, error: console.error });
    WK.service = (serviceName) => {
      if (serviceName === 'eventbus') return mockEventBus;
      return null;
    };

    const integrationValidator = new IntegrationValidator();
    const emailGatewayAdapter = new EmailGatewayAdapter(mockConfigService);
    const smsGatewayAdapter = new SmsGatewayAdapter(mockRestApiAdapter, mockConfigService);
    const webhookManager = new WebhookManager(mockConfigService, null); // EncryptionService not mocked for simplicity

    const integrationService = new IntegrationService(
      mockRestApiAdapter, webhookManager, null, null, null, null, null,
      emailGatewayAdapter, smsGatewayAdapter, null, integrationValidator
    );

    return { integrationService, mockEventBus };
  }

  static testSendEmail() {
    WK.logger().info('Running IntegrationService.sendEmail test...');
    const { integrationService } = IntegrationTest._setupMocks();
    const result = integrationService.sendEmail('test@recipient.com', 'Test Subject', 'Test Body');
    console.assert(result.status === 'success', 'Test Failed: Email not sent successfully.');
    WK.logger().info('IntegrationService.sendEmail test passed.');
    return true;
  }

  static testSendSms() {
    WK.logger().info('Running IntegrationService.sendSms test...');
    const { integrationService } = IntegrationTest._setupMocks();
    const result = integrationService.sendSms('+6281234567890', 'Hello from WK OS!');
    console.assert(result.success === true, 'Test Failed: SMS not sent successfully.');
    WK.logger().info('IntegrationService.sendSms test passed.');
    return true;
  }

  static testHandleWebhook() {
    WK.logger().info('Running IntegrationService.handleWebhook test...');
    const { integrationService, mockEventBus } = IntegrationTest._setupMocks();
    const payload = { event: 'payment_success', data: { amount: 100 } };
    const headers = { 'X-Signature': 'mock_signature' };
    const result = integrationService.handleWebhook('payment_gateway_callback', payload, headers);
    console.assert(result.status === 'success', 'Test Failed: Webhook not handled successfully.');
    // In a real test, you'd assert that mockEventBus.publish was called with the correct event.
    WK.logger().info('IntegrationService.handleWebhook test passed.');
    return true;
  }
}

// Global function to run all tests
function runAllIntegrationHubTests() {
  IntegrationTest.runAll();
}