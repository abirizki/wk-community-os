/**
 * @class IntegrationPermission
 * @description Defines all permissions related to the Integration Hub module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class IntegrationPermission {
  /**
   * Returns an array of permission definitions for the Integration Hub module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'integrationhub.email.send', description: 'Send emails via external gateway' },
      { id: 'integrationhub.sms.send', description: 'Send SMS via external gateway' },
      { id: 'integrationhub.whatsapp.send', description: 'Send WhatsApp messages via external gateway' },
      { id: 'integrationhub.payment.initiate', description: 'Initiate payment transactions via gateway' },
      { id: 'integrationhub.webhook.receive', description: 'Internal permission for receiving webhooks' },
      { id: 'integrationhub.restapi.call', description: 'Internal permission for making generic REST API calls' },
      { id: 'integrationhub.queue.publish', description: 'Publish messages to external queues' },
      { id: 'integrationhub.import.run', description: 'Run data import operations' },
      { id: 'integrationhub.export.run', description: 'Run data export operations' },
      { id: 'integrationhub.gov.dukcapil.fetch', description: 'Fetch citizen data from Dukcapil' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('integrationhub', IntegrationPermission.getPermissions());