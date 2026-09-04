/**
 * @class SecurityService
 * @description The main service facade for all security operations.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SecurityService {
  /**
   * @param {PermissionScanner} permissionScanner
   * @param {AuditScanner} auditScanner
   * @param {ThreatDetector} threatDetector
   * @param {EncryptionService} encryptionService
   */
  constructor(permissionScanner, auditScanner, threatDetector, encryptionService) {
    /** @private */
    this.permissionScanner = permissionScanner;
    /** @private */
    this.auditScanner = auditScanner;
    /** @private */
    this.threatDetector = threatDetector;
    /** @private */
    this.encryptionService = encryptionService;
  }

  /**
   * Runs a comprehensive, system-wide security scan.
   * @returns {object} A summary report of all security findings.
   */
  runFullSystemScan() {
    WK.security().checkPermission('securitycenter.scan.run');
    WK.logger().info('Starting full system security scan...');

    const permissionFindings = this.permissionScanner.scan();
    const auditFindings = this.auditScanner.scan();
    const threatFindings = this.threatDetector.scanAccessLogs();

    const report = {
      scanTimestamp: new Date().toISOString(),
      permissionIssues: permissionFindings,
      auditIssues: auditFindings,
      potentialThreats: threatFindings,
      summary: {
        permissionIssueCount: permissionFindings.length,
        auditIssueCount: auditFindings.length,
        potentialThreatCount: threatFindings.length,
      }
    };

    WK.logger().info('Full system security scan completed.');
    return report;
  }

  /**
   * Provides access to the encryption service for other core services.
   * @returns {EncryptionService}
   */
  getEncryptionService() {
    // This provides a controlled gateway to the encryption service.
    WK.security().checkPermission('securitycenter.encryption.use');
    return this.encryptionService;
  }
}