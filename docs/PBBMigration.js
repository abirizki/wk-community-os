/**
 * @class PBBMigration
 * @description Handles database schema migrations for the PBB module.
 * @author Gemini Code Assist
 * @version 1.0.0
 * @date 2026-08-03
 */
class PBBMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running PBB module migration: up()');
    const dbAdapter = WK.database();

    // 1. Create 'pbb_tax_objects' table
    const taxObjectsTable = 'pbb_tax_objects';
    if (!dbAdapter.hasTable(taxObjectsTable)) {
      dbAdapter.createTable(taxObjectsTable);
      dbAdapter.addColumns(taxObjectsTable, ['id', 'nop', 'address', 'landArea', 'buildingArea', 'ownerCitizenId', 'status', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(taxObjectsTable, 'nop', { unique: true });
      dbAdapter.ensureIndex(taxObjectsTable, 'ownerCitizenId');
      WK.logger().info(`Created table: ${taxObjectsTable}`);
    }

    // 2. Create 'pbb_taxpayers' table
    const taxpayersTable = 'pbb_taxpayers';
    if (!dbAdapter.hasTable(taxpayersTable)) {
      dbAdapter.createTable(taxpayersTable);
      dbAdapter.addColumns(taxpayersTable, ['id', 'citizenId', 'taxpayerNumber', 'status', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(taxpayersTable, 'citizenId', { unique: true });
      dbAdapter.ensureIndex(taxpayersTable, 'taxpayerNumber', { unique: true });
      WK.logger().info(`Created table: ${taxpayersTable}`);
    }

    // 3. Create 'pbb_sppt' table
    const spptTable = 'pbb_sppt';
    if (!dbAdapter.hasTable(spptTable)) {
      dbAdapter.createTable(spptTable);
      dbAdapter.addColumns(spptTable, ['id', 'taxpayerId', 'taxObjectId', 'spptNumber', 'taxYear', 'taxAmount', 'dueDate', 'status', 'createdAt', 'updatedAt']);
      dbAdapter.ensureIndex(spptTable, 'taxpayerId');
      dbAdapter.ensureIndex(spptTable, 'taxObjectId');
      dbAdapter.ensureIndex(spptTable, 'spptNumber', { unique: true });
      WK.logger().info(`Created table: ${spptTable}`);
    }

    // 4. Create 'pbb_payment_history' table
    const paymentHistoryTable = 'pbb_payment_history';
    if (!dbAdapter.hasTable(paymentHistoryTable)) {
      dbAdapter.createTable(paymentHistoryTable);
      dbAdapter.addColumns(paymentHistoryTable, ['id', 'spptId', 'paymentDate', 'paymentAmount', 'paymentMethod', 'status', 'transactionId', 'createdAt']);
      dbAdapter.ensureIndex(paymentHistoryTable, 'spptId');
      WK.logger().info(`Created table: ${paymentHistoryTable}`);
    }

    WK.logger().info('PBB module migration: up() completed successfully.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    WK.logger().warn('Running PBB module migration: down() - This is a destructive operation!');
    const dbAdapter = WK.database();
    // dbAdapter.dropTable('pbb_tax_objects');
    // dbAdapter.dropTable('pbb_taxpayers');
    // dbAdapter.dropTable('pbb_sppt');
    // dbAdapter.dropTable('pbb_payment_history');
    WK.logger().info("'down' migration for PBB executed (conceptual).");
  }
}