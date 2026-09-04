/**
 * @class ReportingMigration
 * @description Handles database schema migrations for the Reporting Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReportingMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Reporting Center module migration: up()');
    const dbAdapter = WK.database();
    const tableName = 'reporting_history'; // To store a log of generated reports

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      dbAdapter.addColumns(tableName, ['id', 'timestamp', 'reportId', 'generatedByUserId', 'format', 'parameters']);
      dbAdapter.ensureIndex(tableName, 'timestamp');
      WK.logger().info(`Created table: ${tableName}`);
    }
    WK.logger().info('Reporting Center module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Reporting Center module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('reporting_history');
  }
}