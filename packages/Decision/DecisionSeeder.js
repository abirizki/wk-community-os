/**
 * @file DecisionSeeder.js
 * @description Seeds initial lookup groups and metadata items for the Decision module with idempotency.
 */

// Import or fallback to DecisionConstants
let DecisionConstants;
try {
  ({ DecisionConstants } = require('./DecisionEntity.js'));
} catch (e) {
  DecisionConstants = {
    CATEGORIES: ['ANGGARAN_KEUANGAN', 'TATA_TERTIB_LINGKUNGAN', 'KEAMANAN_RONDA', 'KEBERSIHAN_INFRASTRUKTUR', 'KEGIATAN_SOSIAL', 'LAINNYA'],
    SCOPE_TYPES: ['RT', 'RW', 'KELURAHAN'],
    STATUSES: ['DRAFT', 'RATIFIED', 'SUPERSEDED', 'REVOKED'],
    TARGET_TYPES: ['ALL_CITIZENS', 'FAMILY_HEADS', 'SPECIFIC_RT', 'MERCHANTS', 'COMMITTEE'],
  };
}

class DecisionSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('DecisionSeeder') : console;
  }

  /**
   * Executes all seeding operations for the Decision package.
   */
  run() {
    if (!this.db) {
      if (this.logger.warn) this.logger.warn('Database adapter not available. Skipping DecisionSeeder.run.');
      return;
    }

    if (this.logger.info) this.logger.info('Running Decision package seeder...');

    try {
      this._seedDecisionCategories();
      this._seedDecisionScopes();
      this._seedDecisionStatuses();
      this._seedDecisionTargetTypes();

      if (this.logger.info) this.logger.info('Decision package seeder completed successfully.');
    } catch (e) {
      if (this.logger.error) this.logger.error(`Decision seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * Checks if the decision lookup groups have already been seeded.
   * @returns {boolean}
   */
  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('lookup_groups') && typeof db.findOne === 'function') {
      const existing = db.findOne('lookup_groups', { name: 'DECISION_CATEGORY' });
      return !!existing;
    }

    if (db.hasTable('system_lookups') && typeof db.search === 'function') {
      const items = db.search('system_lookups', { lookupType: 'DECISION_CATEGORY' });
      return Array.isArray(items) && items.length > 0;
    }

    return false;
  }

  /**
   * Checks if any data exists in decision tables.
   * @returns {boolean}
   */
  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db) return false;

    if (db.hasTable('decisions')) {
      if (typeof db.count === 'function') {
        return db.count('decisions', {}) > 0;
      }
      if (typeof db.search === 'function') {
        const records = db.search('decisions', {});
        return Array.isArray(records) && records.length > 0;
      }
    }

    return false;
  }

  // =========================================================================
  // PRIVATE SEEDING HELPERS (IDEMPOTENT)
  // =========================================================================

  /** @private */
  _seedDecisionCategories() {
    const categories = (DecisionConstants && DecisionConstants.CATEGORIES) || [];
    const items = categories.map((cat, idx) => ({
      name: cat,
      code: cat,
      value: this._formatLabel(cat),
      displayOrder: idx + 1,
      description: `Kategori ketetapan: ${this._formatLabel(cat)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('DECISION_CATEGORY', 'Kategori bidang ketetapan keputusan musyawarah', items);
  }

  /** @private */
  _seedDecisionScopes() {
    const scopes = (DecisionConstants && DecisionConstants.SCOPE_TYPES) || [];
    const items = scopes.map((scope, idx) => ({
      name: scope,
      code: scope,
      value: scope,
      displayOrder: idx + 1,
      description: `Lingkup ketetapan: ${scope}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('DECISION_SCOPE', 'Lingkup wilayah keberlakuan ketetapan', items);
  }

  /** @private */
  _seedDecisionStatuses() {
    const statuses = (DecisionConstants && DecisionConstants.STATUSES) || [];
    const items = statuses.map((status, idx) => ({
      name: status,
      code: status,
      value: this._formatLabel(status),
      displayOrder: idx + 1,
      description: `Status ketetapan: ${status}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('DECISION_STATUS', 'Status siklus hukum ketetapan keputusan', items);
  }

  /** @private */
  _seedDecisionTargetTypes() {
    const targets = (DecisionConstants && DecisionConstants.TARGET_TYPES) || [];
    const items = targets.map((target, idx) => ({
      name: target,
      code: target,
      value: this._formatLabel(target),
      displayOrder: idx + 1,
      description: `Sasaran penerima dampak kebijakan: ${this._formatLabel(target)}`,
      createdAt: new Date().toISOString(),
    }));

    this._seedLookupGroup('DECISION_TARGET_TYPE', 'Kelompok sasaran dampak ketetapan musyawarah', items);
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

module.exports = DecisionSeeder;

