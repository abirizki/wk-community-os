/**
 * @class DocumentationMigration
 * @description Handles database schema migrations for the Documentation Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class DocumentationMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Documentation Center module migration: up()');
    const dbAdapter = WK.database();
    const tableName = 'documentation_assets'; // To store a persistent cache of doc metadata

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      dbAdapter.addColumns(tableName, ['id', 'title', 'type', 'packageId', 'sourcePath', 'version', 'lastIndexedAt']);
      dbAdapter.ensureIndex(tableName, 'id', { unique: true });
      WK.logger().info(`Created table: ${tableName}`);
    }
    WK.logger().info('Documentation Center module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Documentation Center module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('documentation_assets');
  }
}