/**
 * @class SchemaMigration
 * @description Handles database schema migrations for the Schema Registry module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-06
 */
class SchemaMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running Schema Registry module migration: up()');
    const dbAdapter = WK.database();
    const tableName = 'schemaregistry_schemas'; // To store persistent schema metadata if needed

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      dbAdapter.addColumns(tableName, ['id', 'type', 'packageId', 'version', 'description', 'definition', 'dependencies', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(tableName, 'id', { unique: true });
      WK.logger().info(`Created table: ${tableName}`);
    }
    WK.logger().info('Schema Registry module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running Schema Registry module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('schemaregistry_schemas');
  }
}