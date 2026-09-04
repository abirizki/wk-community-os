/**
 * @class TenantMigration
 * @description Handles database schema migrations for the SaaS module.
 */
class TenantMigration {
  /**
   * Applies the migration changes.
   */
  static up() {
    WK.logger().info('Running SaaS module migration: up()');
    const dbAdapter = WK.database();

    // 1. Create 'tenants' table
    const tenantsTable = 'tenants';
    if (!dbAdapter.hasTable(tenantsTable)) {
      dbAdapter.createTable(tenantsTable);
      dbAdapter.addColumns(tenantsTable, ['id', 'name', 'domain', 'status', 'createdAt']);
      dbAdapter.ensureIndex(tenantsTable, 'domain', { unique: true });
      WK.logger().info(`Created table: ${tenantsTable}`);
    }

    // 2. Create 'subscriptions' table
    const subsTable = 'subscriptions';
    if (!dbAdapter.hasTable(subsTable)) {
      dbAdapter.createTable(subsTable);
      dbAdapter.addColumns(subsTable, ['id', 'tenantId', 'planId', 'status', 'startDate', 'endDate', 'createdAt']);
      dbAdapter.ensureIndex(subsTable, 'tenantId');
      WK.logger().info(`Created table: ${subsTable}`);
    }

    // 3. Create 'tenant_configurations' table
    const configTable = 'tenant_configurations';
    if (!dbAdapter.hasTable(configTable)) {
      dbAdapter.createTable(configTable);
      dbAdapter.addColumns(configTable, ['tenantId', 'key', 'value']);
      // A composite unique index on (tenantId, key) would be ideal.
      dbAdapter.ensureIndex(configTable, 'tenantId');
      WK.logger().info(`Created table: ${configTable}`);
    }

    WK.logger().info('SaaS module migration: up() completed successfully.');
    WK.logger().warn('IMPORTANT: Manual migration required to add `tenantId` column to all other data tables.');
  }

  /**
   * Reverts the migration changes.
   */
  static down() {
    // Destructive operation, typically not run in production.
  }
}