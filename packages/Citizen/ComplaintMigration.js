/**
 * @class ComplaintMigration
 * @description Handles database schema migrations for the Complaint module.
 * This class contains methods to apply (up) and revert (down) schema changes.
 */
class ComplaintMigration {
  /**
   * Applies the migration changes.
   * This method is called when the module is installed or updated. It is designed
   * to be idempotent, meaning it can be run multiple times without causing issues.
   */
  static up() {
    WK.logger().info('Running Complaint module migration: up()');
    try {
      const dbAdapter = WK.database(); // Get the main database adapter
      const tableName = 'complaints';

      // 1. Ensure the 'complaints' table/sheet exists
      if (!dbAdapter.hasTable(tableName)) {
        dbAdapter.createTable(tableName);
        WK.logger().info(`Created new table/sheet: ${tableName}`);
      }

      // 2. Define the canonical list of headers/columns
      const expectedColumns = [
        'id', 'trackingNumber', 'citizenId', 'householdId', 'category', 'subCategory',
        'title', 'description', 'location', 'coordinates', 'priority', 'status',
        'attachments', 'assignedToUserId', 'assignedToRoleId', 'resolutionDetails',
        'citizenConfirmation', 'rejectionReason', 'createdAt', 'updatedAt',
        'submittedAt', 'resolvedAt', 'closedAt', 'timeline' // timeline as a JSON string or array
      ];

      // 3. Add any missing columns
      const currentColumns = dbAdapter.getColumns(tableName);
      const missingColumns = expectedColumns.filter(col => !currentColumns.includes(col));

      if (missingColumns.length > 0) {
        WK.logger().warn(`Missing columns in '${tableName}': ${missingColumns.join(', ')}. Adding them.`);
        dbAdapter.addColumns(tableName, missingColumns);
      }

      // 4. Ensure indexes are created for performance
      dbAdapter.ensureIndex(tableName, 'trackingNumber', { unique: true });
      dbAdapter.ensureIndex(tableName, 'citizenId');
      dbAdapter.ensureIndex(tableName, 'status');
      dbAdapter.ensureIndex(tableName, 'category');
      dbAdapter.ensureIndex(tableName, 'assignedToUserId');

      WK.logger().info('Complaint module migration: up() completed successfully.');
    } catch (e) {
      WK.logger().error(`Complaint module migration: up() failed: ${e.message}`, e.stack);
      throw new Error(`Migration 'up' for Complaint module failed. See logs for details.`);
    }
  }

  /**
   * Reverts the migration changes.
   * This is a destructive operation and should be used with extreme caution.
   */
  static down() {
    WK.logger().warn('Running Complaint module migration: down() - This is a destructive operation!');
    try {
      const dbAdapter = WK.database();
      const tableName = 'complaints';
      // In a real scenario, you might drop specific columns or indexes.
      // For dev/test, dropping the table might be acceptable.
      // dbAdapter.dropTable(tableName);
      WK.logger().info(`'down' migration for ${tableName} executed (conceptual).`);
    } catch (e) {
      WK.logger().error(`Complaint module migration: down() failed: ${e.message}`, e.stack);
      throw e;
    }
  }
}