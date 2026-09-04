/**
 * @class PermissionScanner
 * @description Scans the system for permission-related vulnerabilities.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class PermissionScanner {
  /**
   * @param {APIRegistry} apiRegistry - From APIRegistry package
   */
  constructor(apiRegistry) {
    /** @private */
    this.apiRegistry = apiRegistry;
  }

  /**
   * Scans all registered API endpoints for missing permission assignments.
   * @returns {Array<object>} A list of endpoints that have no permission assigned.
   */
  scan() {
    WK.security().checkPermission('securitycenter.permission.scan');
    WK.logger().info('Scanning API endpoints for missing permissions...');

    const allEndpoints = this.apiRegistry.getAllEndpoints();
    const findings = [];

    for (const endpoint of allEndpoints) {
      if (!endpoint.permission) {
        findings.push({ endpoint: endpoint.path, message: 'API endpoint is not protected by a permission.' });
      }
    }

    WK.logger().info(`Permission scan complete. Found ${findings.length} issues.`);
    return findings;
  }
}