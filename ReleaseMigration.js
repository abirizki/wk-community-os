/**
 * @class ReleaseMigration
 * @description Handles database schema migrations for the Release Center module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class ReleaseMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Release Center module migration: up()');
    const dbAdapter = WK.database();
    const tableName = 'release_history'; // To store a log of all releases

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      dbAdapter.addColumns(tableName, ['id', 'version', 'releaseDate', 'releaseManagerId', 'notes', 'packageManifest']);
      dbAdapter.ensureIndex(tableName, 'releaseDate');
      WK.logger().info(`Created table: ${tableName}`);
    }
    WK.logger().info('Release Center module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Release Center module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('release_history');
  }
}