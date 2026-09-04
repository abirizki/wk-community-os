/**
 * @class TenantManager
 * @description Manages the lifecycle and context of tenants in the multi-tenant system.
 */
class TenantManager {
  /**
   * @param {object} dbAdapter - The database adapter instance.
   */
  constructor(dbAdapter) {
    /** @private */
    this.db = dbAdapter.setTable('tenants');
    WK.logger().info('TenantManager initialized for table: tenants');
  }

  /**
   * Creates a new tenant.
   * @param {string} name - The display name of the tenant (e.g., 'Kelurahan Kebonjati').
   * @param {string} domain - The unique subdomain for the tenant (e.g., 'kebonjati').
   * @returns {object} The newly created tenant object.
   */
  createTenant(name, domain) {
    WK.security().checkPermission('saas.tenant.create');
    WK.logger().info(`Creating new tenant: ${name} with domain ${domain}`);

    const existing = this.db.findOne({ domain: domain });
    if (existing) {
      throw new Error(`Tenant with domain '${domain}' already exists.`);
    }

    const newTenant = {
      id: WK.helper().generateUuid(),
      name: name,
      domain: domain,
      status: 'ACTIVE', // 'ACTIVE', 'SUSPENDED', 'DISABLED'
      createdAt: new Date().toISOString()
    };

    return this.db.create(newTenant);
  }

  /**
   * Finds a tenant by their unique domain.
   * @param {string} domain - The tenant's domain.
   * @returns {object|null} The tenant object or null if not found.
   */
  getTenantByDomain(domain) {
    return this.db.findOne({ domain: domain });
  }

  /**
   * Sets the current tenant context for the active session.
   * This is a critical step in the request lifecycle to ensure data isolation.
   * @param {string} tenantId - The ID of the current tenant.
   */
  setCurrentTenant(tenantId) {
    const session = WK.session();
    if (session) {
      session.set('tenantId', tenantId);
      WK.logger().debug(`Current tenant context set to: ${tenantId}`);
    } else {
      WK.logger().error('Could not set tenant context: Session service not available.');
    }
  }

  /**
   * Retrieves the current tenant ID from the session.
   * The core dbAdapter will use this to scope all queries.
   * @returns {string|null} The current tenant ID.
   */
  getCurrentTenantId() {
    const session = WK.session();
    return session ? session.get('tenantId') : null;
  }
}