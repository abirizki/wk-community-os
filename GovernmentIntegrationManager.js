/**
 * @class GovernmentIntegrationManager
 * @description Manages specific integrations with national or regional government systems (e.g., Dukcapil).
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class GovernmentIntegrationManager {
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
   * Fetches citizen data from a government identity system (e.g., Dukcapil).
   * @param {string} nik - The National Identity Number (NIK) of the citizen.
   * @returns {object} Citizen data from the external system.
   */
  fetchCitizenData(nik) {
    WK.security().checkPermission('integrationhub.gov.dukcapil.fetch');
    const dukcapilConfigKey = 'government_integrations.dukcapil_api_url';
    const dukcapilApiKey = this.configurationService.get('government_integrations.dukcapil_api_key');

    if (!dukcapilApiKey) {
      throw new Error('Dukcapil API key not configured.');
    }

    WK.logger().info(`GovernmentIntegrationManager: Fetching citizen data for NIK: ${nik} from Dukcapil.`);
    return this.restApiAdapter.get(dukcapilConfigKey, `/citizen/${nik}`, {}, {
      'X-API-Key': dukcapilApiKey
    });
  }
}