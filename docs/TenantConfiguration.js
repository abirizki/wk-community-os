/**
 * @class TenantConfiguration
 * @description Manages tenant-specific configurations that can override global settings.
 */
class TenantConfiguration {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('tenant_configurations');
    WK.logger().info('TenantConfiguration initialized for table: tenant_configurations');
  }

  /**
   * Sets a specific configuration value for a tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} key - The configuration key (e.g., 'theme.color.primary').
   * @param {any} value - The value to set.
   * @returns {object} The saved configuration record.
   */
  set(tenantId, key, value) {
    WK.security().checkPermission('saas.tenant.configure');
    const record = {
      tenantId: tenantId,
      key: key,
      value: value
    };
    // Use a composite key of tenantId and key for uniqueness
    return this.db.save(record, ['tenantId', 'key']);
  }

  /**
   * Gets a configuration value for a tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @param {string} key - The configuration key.
   * @returns {any|null} The value if found, otherwise null.
   */
  get(tenantId, key) {
    const record = this.db.findOne({ tenantId: tenantId, key: key });
    return record ? record.value : null;
  }

  /**
   * Gets all configuration overrides for a specific tenant.
   * @param {string} tenantId - The ID of the tenant.
   * @returns {object} An object representing the tenant's configuration.
   */
  getAllForTenant(tenantId) {
    const records = this.db.findAll({ tenantId: tenantId });
    return records.reduce((config, record) => {
      config[record.key] = record.value;
      return config;
    }, {});
  }
}