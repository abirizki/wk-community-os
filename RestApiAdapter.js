/**
 * @class RestApiAdapter
 * @description Provides a generic client for making outbound REST API calls to external services.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class RestApiAdapter {
  /**
   * @param {ConfigurationService} configurationService
   * @param {EncryptionService} encryptionService
   */
  constructor(configurationService, encryptionService) {
    /** @private */
    this.configurationService = configurationService;
    /** @private */
    this.encryptionService = encryptionService;
  }

  /**
   * Makes a generic HTTP GET request to an external API.
   * @param {string} endpointKey - Key to retrieve the base URL from ConfigurationCenter (e.g., 'external_api.user_service_url').
   * @param {string} path - The specific path for the API call (e.g., '/users/123').
   * @param {object} [params] - Query parameters.
   * @param {object} [headers] - Additional headers.
   * @returns {object} The parsed JSON response.
   */
  get(endpointKey, path, params = {}, headers = {}) {
    WK.security().checkPermission('integrationhub.restapi.call');
    const baseUrl = this.configurationService.get(endpointKey);
    if (!baseUrl) {
      throw new Error(`REST API endpoint configuration missing for key: ${endpointKey}`);
    }

    const url = `${baseUrl}${path}?${Object.keys(params).map(key => `${key}=${params[key]}`).join('&')}`;
    WK.logger().debug(`RestApiAdapter: Making GET request to ${url}`);

    // In Apps Script, use UrlFetchApp.fetch
    const response = UrlFetchApp.fetch(url, { headers: headers, method: 'get' });
    return JSON.parse(response.getContentText());
  }
}