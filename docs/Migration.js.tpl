/**
 * @class <<migrationName>>
 * @description Handles database schema migrations for the <<packageName>> module.
 * @author <<author>>
 * @version 1.0.0
 * @date <<currentDate>>
 */
class <<migrationName>> {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running <<packageName>> module migration: up()');
    const dbAdapter = WK.database();
    const tableName = '<<tableName>>';

    if (!dbAdapter.hasTable(tableName)) {
      dbAdapter.createTable(tableName);
      // [TODO: Add columns for your table]
      // Example: dbAdapter.addColumns(tableName, ['id', 'name', 'createdAt']);
      WK.logger().info(`Created table: ${tableName}`);
    }

    WK.logger().info('<<packageName>> module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running <<packageName>> module migration: down() - This is a destructive operation!');
    // const dbAdapter = WK.database();
    // dbAdapter.dropTable('<<tableName>>');
  }
}