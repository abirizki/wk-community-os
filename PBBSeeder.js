/**
 * @class PBBSeeder
 * @description Seeds database with PBB lookup reference data.
 */
class PBBSeeder {
  /**
   * Runs the seeder to populate initial PBB lookup data.
   */
  run() {
    const logger = WK.logger('PBBSeeder.run');
    const db = WK.database();
    
    logger.info('Running PBB seed data...');

    // Create master data groups for lookups if they don't exist
    this._seedObjectCategoryData(db);
    this._seedPaymentStatusData(db);

    logger.info('PBB seed data completed.');
  }

  /**
   * Seeds object category lookup data.
   * @private
   */
  _seedObjectCategoryData(db) {
    const existing = db.findOne('lookup_groups', { name: 'PBB_OBJECT_CATEGORY' });
    if (existing) {
      return; // Already seeded
    }

    db.create('lookup_groups', {
      name: 'PBB_OBJECT_CATEGORY',
      description: 'PBB object categories for taxable properties',
      createdAt: new Date().toISOString(),
    });

    const categories = PBBConstants.OBJECT_CATEGORIES;
    const items = categories.map((cat, index) => ({
      name: cat,
      displayOrder: index,
      description: `PBB object category: ${cat}`,
      createdAt: new Date().toISOString(),
    }));

    if (items.length > 0) {
      // Create a lookup group for individual categories
      const group = db.findOne('lookup_groups', { name: 'PBB_OBJECT_CATEGORY' });
      if (group?.id) {
        items.forEach(item => {
          item.groupId = group.id;
          db.create('lookup_items', item);
        });
      }
    }
  }

  /**
   * Seeds payment status lookup data.
   * @private
   */
  _seedPaymentStatusData(db) {
    const existing = db.findOne('lookup_groups', { name: 'PBB_PAYMENT_STATUS' });
    if (existing) {
      return; // Already seeded
    }

    db.create('lookup_groups', {
      name: 'PBB_PAYMENT_STATUS',
      description: 'Payment statuses for SPPT',
      createdAt: new Date().toISOString(),
    });

    const statuses = PBBConstants.PAYMENT_STATUSES;
    const items = statuses.map((status, index) => ({
      name: status,
      displayOrder: index,
      description: `Payment status: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    if (items.length > 0) {
      const group = db.findOne('lookup_groups', { name: 'PBB_PAYMENT_STATUS' });
      if (group?.id) {
        items.forEach(item => {
          item.groupId = group.id;
          db.create('lookup_items', item);
        });
      }
    }
  }

  /**
   * Seeds sample SPPT data for testing purposes (optional).
   * This uses a local approach for demo data without cluttering global state.
   * @param {object} [sampleCitizenId] - Citizen ID to associate sample SPPT with.
   */
  seedSampleData(sampleCitizenId = null) {
    const logger = WK.logger('PBBSeeder.seedSampleData');

    // This is a lightweight sample seeder that doesn't create persistent entries.
    // Real sample data should be managed through the application layer.
    logger.info('Sample SPPT data seeding skipped (real sample data should be managed by application).');
  }

  /**
   * Check if seeder has already run.
   * @returns {boolean}
   */
  static isSeeded() {
    const db = WK.database();
    // Check for lookup groups if they're properly aligned with your DB structure
    // For this implementation, we check if the tables exist and contain expected lookups
    try {
      const categoryGroup = db.findOne('lookup_groups', { name: 'PBB_OBJECT_CATEGORY' });
      const statusGroup = db.findOne('lookup_groups', { name: 'PBB_PAYMENT_STATUS' });
      return !!(categoryGroup && statusGroup);
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if lookup data has been seeded.
   * @returns {boolean}
   */
  static hasData() {
    const db = WK.database();
    try {
      const categoryItems = db.search('lookup_items', { inGroup: 'PBB_OBJECT_CATEGORY' });
      const statusItems = db.search('lookup_items', { inGroup: 'PBB_PAYMENT_STATUS' });
      return categoryItems.length > 0 && statusItems.length > 0;
    } catch (e) {
      return false;
    }
  }
}

module.exports = PBBSeeder;
