/**
 * @class MonitoringMigration
 * @description Handles database schema migrations for the Monitoring Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class MonitoringMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Monitoring Center module migration: up()');
    const dbAdapter = WK.database();
    const tableName = 'monitoring_alerts_history'; // To store a history of triggered alerts

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      dbAdapter.addColumns(tableName, ['id', 'timestamp', 'alertTitle', 'alertBody', 'metricName', 'metricValue', 'thresholdValue']);
      dbAdapter.ensureIndex(tableName, 'timestamp');
      WK.logger().info(`Created table: ${tableName}`);
    }
    WK.logger().info('Monitoring Center module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Monitoring Center module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('monitoring_alerts_history');
  }
}