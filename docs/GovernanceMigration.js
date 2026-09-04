/**
 * @class GovernanceMigration
 * @description Handles database schema migrations for the Governance module.
 */
class GovernanceMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Governance module migration: up()');
    const dbAdapter = WK.database();

    // 1. Create 'audit_logs' table
    const auditTable = 'audit_logs';
    if (!dbAdapter.hasTable(auditTable)) {
      dbAdapter.createTable(auditTable);
      dbAdapter.addColumns(auditTable, ['id', 'timestamp', 'userId', 'userRole', 'ipAddress', 'action', 'module', 'entityId', 'details']);
      dbAdapter.ensureIndex(auditTable, 'userId');
      dbAdapter.ensureIndex(auditTable, 'action');
      dbAdapter.ensureIndex(auditTable, 'entityId');
      WK.logger().info(`Created table: ${auditTable}`);
    }

    // 2. Create 'risk_register' table
    const riskTable = 'risk_register';
    if (!dbAdapter.hasTable(riskTable)) {
      dbAdapter.createTable(riskTable);
      dbAdapter.addColumns(riskTable, ['id', 'description', 'likelihood', 'impact', 'riskScore', 'riskLevel', 'owner', 'mitigationStrategy', 'status', 'createdAt']);
      WK.logger().info(`Created table: ${riskTable}`);
    }

    // 3. Create 'user_consent' table
    const consentTable = 'user_consent';
    if (!dbAdapter.hasTable(consentTable)) {
      dbAdapter.createTable(consentTable);
      dbAdapter.addColumns(consentTable, ['id', 'userId', 'consentType', 'version', 'timestamp', 'ipAddress']);
      dbAdapter.ensureIndex(consentTable, 'userId');
      WK.logger().info(`Created table: ${consentTable}`);
    }

    WK.logger().info('Governance module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Governance module migration: down() - This is a destructive operation!');
    const dbAdapter = WK.database();
    // dbAdapter.dropTable('audit_logs');
    // dbAdapter.dropTable('risk_register');
    // dbAdapter.dropTable('user_consent');
    WK.logger().info("'down' migration for Governance executed (conceptual).");
  }
}