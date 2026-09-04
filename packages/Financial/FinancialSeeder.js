/**
 * @file FinancialSeeder.js
 * @description Idempotent seeder for Financial module reference data (lookup groups & items).
 * @domain CommunityFinance
 * @package Financial (Epic Financial / P40)
 */

const { FinancialConstants } = require('./FinancialEntity.js');

class FinancialSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('FinancialSeeder') : console;
  }

  _seedLookupGroup(groupName, items) {
    if (!this.db) return;

    // Idempotent: find or create group
    let group = this.db.findOne('lookup_groups', { name: groupName });
    if (!group) {
      group = { id: `group_${groupName.toLowerCase()}`, name: groupName };
      this.db.create('lookup_groups', group);
    }

    // Idempotent: insert only missing items
    items.forEach(itemCode => {
      const existing = this.db.findOne('lookup_items', { groupId: group.id, code: itemCode });
      if (!existing) {
        this.db.create('lookup_items', {
          id: `item_${group.id}_${itemCode.toLowerCase()}`,
          groupId: group.id,
          code: itemCode,
          label: itemCode.replace(/_/g, ' '),
        });
      }
    });
  }

  run() {
    if (!this.db) return;

    // Ensure lookup tables exist (defensive)
    if (!this.db.hasTable('lookup_groups')) this.db.createTable('lookup_groups', {});
    if (!this.db.hasTable('lookup_items')) this.db.createTable('lookup_items', {});

    // Seed 3 groups from FinancialConstants
    this._seedLookupGroup('DUES_STATUS', FinancialConstants.DUES_STATUSES);
    this._seedLookupGroup('TRANSACTION_TYPE', FinancialConstants.TRANSACTION_TYPES);
    this._seedLookupGroup('TRANSACTION_CATEGORY', FinancialConstants.TRANSACTION_CATEGORIES);

    if (this.logger && this.logger.info) {
      this.logger.info('Financial lookup data seeded: DUES_STATUS, TRANSACTION_TYPE, TRANSACTION_CATEGORY');
    }
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'DUES_STATUS' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('dues_bills')) return false;
    const records = db.search('dues_bills', {});
    return records && records.length > 0;
  }
}

module.exports = { FinancialSeeder };

