/**
 * @file RegulationSeeder.js
 * @description Seeds initial lookup groups and metadata items for the Regulation module with idempotency.
 */

// Import or fallback to RegulationConstants
let RegulationConstants;
try {
  ({ RegulationConstants } = require('./RegulationEntity.js'));
} catch (e) {
  RegulationConstants = {
    CATEGORIES: ['TATA_TERTIB', 'KETERTIBAN_KEAMANAN', 'PENGELOLAAN_SAMPAH_LINGKUNGAN', 'PEMANFAATAN_FASUM', 'ADMINISTRASI_WARGA', 'LAINNYA'],
    SCOPE_TYPES: ['RT', 'RW', 'KELURAHAN'],
    STATUSES: ['DRAFT', 'UNDER_REVIEW', 'ENACTED', 'SUPERSEDED', 'REVOKED'],
  };
}

class RegulationSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('RegulationSeeder') : console;
  }

  /**
   * Executes all seeding operations for the Regulation package.
   */
  run() {
    if (!this.db) {
      if (this.logger.warn) this.logger.warn('Database adapter not available. Skipping RegulationSeeder.run.');
      return;
    }

    if (this.logger.info) this.logger.info('Running Regulation package seeder...');

    try {
      this._seedRegulationCategories();
      this._seedRegulationScopes();
      this._seedRegulationStatuses();

      if (this.logger.info) this.logger.info('Regulation package seeder completed successfully.');
    } catch (e) {
      if (this.logger.error) this.logger.error(`Regulation seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * Checks if the regulation lookup groups have already been seeded.
   * @returns {boolean}
   */
  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('lookup_groups') && typeof db.findOne === 'function') {
      const existing = db.findOne('lookup_groups', { name: 'REGULATION_CATEGORY' });
      return !!existing;
    }

    if (db.hasTable('system_lookups') && typeof db.search === 'function') {
      const items = db.search('system_lookups', { lookupType: 'REGULATION_CATEGORY' });
      return Array.isArray(items) && items.length > 0;
    }

    return false;
  }

  /**
   * Checks if any data exists in regulation tables.
   * @returns {boolean}
   */
  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('regulations')) {
      if (typeof db.count === 'function') {
        return db.count('regulations', {}) > 0;
      }
      if (typeof db.search === 'function') {
        const records = db.search('regulations', {});
        return Array.isArray(records) && records.length > 0;
      }
    }

    return false;
  }

  // =========================================================================
  // PRIVATE SEEDING HELPERS (IDEMPOTENT)
  // =========================================================================

  /** @private */
  _seedRegulationCategories() {
    const categories = (RegulationConstants && RegulationConstants.CATEGORIES) || [];
    const items = categories.map((cat, idx) => ({
      name: cat,
      code: cat,
      value: this._formatLabel(cat),
      displayOrder: idx + 1,
      description: `Kategori peraturan: ${this._formatLabel(cat)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('REGULATION_CATEGORY', 'Kategori bidang peraturan dan norma ketertiban warga', items);
  }

  /** @private */
  _seedRegulationScopes() {
    const scopes = (RegulationConstants && RegulationConstants.SCOPE_TYPES) || [];
    const items = scopes.map((scope, idx) => ({
      name: scope,
      code: scope,
      value: scope,
      displayOrder: idx + 1,
      description: `Lingkup wilayah peraturan: ${scope}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('REGULATION_SCOPE', 'Lingkup wilayah keberlakuan lembaran peraturan', items);
  }

  /** @private */
  _seedRegulationStatuses() {
    const statuses = (RegulationConstants && RegulationConstants.STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status siklus hukum peraturan: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('REGULATION_STATUS', 'Status siklus pengundangan peraturan', items);
  }

  /**
   * Idempotently seeds lookup group and items across available schema variants.
   * @private
   * @param {string} groupName
   * @param {string} description
   * @param {object[]} items
   */
  _seedLookupGroup(groupName, description, items) {
    // 1. Variant: lookup_groups & lookup_items
    if (this.db.hasTable('lookup_groups') && typeof this.db.create === 'function') {
      let group = typeof this.db.findOne === 'function' ? this.db.findOne('lookup_groups', { name: groupName }) : null;
      if (!group) {
        group = this.db.create('lookup_groups', {
          name: groupName,
          description: description,
          createdAt: new Date().toISOString(),
        });
      }

      if (group && this.db.hasTable('lookup_items')) {
        items.forEach(item => {
          let existingItem = null;
          if (typeof this.db.findOne === 'function') {
            existingItem = this.db.findOne('lookup_items', { groupId: group.id, name: item.name });
          }
          if (!existingItem) {
            this.db.create('lookup_items', {
              groupId: group.id,
              name: item.name,
              displayOrder: item.displayOrder,
              description: item.description,
              createdAt: item.createdAt,
            });
          }
        });
      }
    }

    // 2. Variant: system_lookups
    if (this.db.hasTable('system_lookups') && typeof this.db.create === 'function') {
      items.forEach(item => {
        let existing = null;
        if (typeof this.db.findOne === 'function') {
          existing = this.db.findOne('system_lookups', { lookupType: groupName, code: item.code });
        }
        if (!existing) {
          this.db.create('system_lookups', {
            lookupType: groupName,
            code: item.code,
            value: item.value,
            displayOrder: item.displayOrder,
            createdAt: item.createdAt,
          });
        }
      });
    }
  }

  /**
   * Converts SNAKE_CASE string to Title Case.
   * @private
   */
  _formatLabel(str) {
    if (!str) return '';
    return str.split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}

module.exports = RegulationSeeder;

