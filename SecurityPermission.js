/**
 * @class SecurityPermission
 * @description Defines all permissions related to the Security Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SecurityPermission {
  /**
   * Returns an array of permission definitions for the Security Center module.
   * @returns {object[]} An array of permission objects { id, description }.
   */
  static getPermissions() {
    return [
      { id: 'securitycenter.scan.run', description: 'Run a full system security scan' },
      { id: 'securitycenter.report.view', description: 'View security scan reports' },
      { id: 'securitycenter.threat.scan', description: 'Run a threat detection scan' },
      { id: 'securitycenter.permission.scan', description: 'Run a permission scan' },
      { id: 'securitycenter.audit.scan', description: 'Run an audit log scan' },
      { id: 'securitycenter.encryption.use', description: 'Internal permission for services to use encryption' },
      { id: 'securitycenter.key.get', description: 'Internal permission for services to retrieve encryption keys' },
    ];
  }
}

// Register the permissions with the framework's security service
WK.permission('securitycenter', SecurityPermission.getPermissions());