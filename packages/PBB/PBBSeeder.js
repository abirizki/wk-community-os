/**
 * @file PBBSeeder.js
 * @description Idempotent seeder for PBB module reference data (object category and SPPT status).
 * @domain PublicFinance
 * @package PBB (Epic PBB / P90)
 */

const { PBBConstants } = require('./PBBEntity.js');

class PBBSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PBBSeeder') : console;
  }

  _seedLookupGroup(groupName, items) {
    if (!this.db) return;

    // Idempotent: check or create group
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

    // Ensure lookup base tables exist
    if (!this.db.hasTable('lookup_groups')) this.db.createTable('lookup_groups', {});
    if (!this.db.hasTable('lookup_items')) this.db.createTable('lookup_items', {});

    // Seed 2 groups from PBBConstants
    this._seedLookupGroup('PBB_OBJECT_CATEGORY', PBBConstants.PBB_OBJECT_CATEGORIES);
    this._seedLookupGroup('PBB_STATUS', PBBConstants.PBB_STATUSES);

    if (this.logger && this.logger.info) {
      this.logger.info('PBB lookup reference data seeded successfully (PBB_OBJECT_CATEGORY, PBB_STATUS).');
    }
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'PBB_OBJECT_CATEGORY' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('pbb_objects')) return false;
    const records = db.search('pbb_objects', {});
    return records && records.length > 0;
  }
}

module.exports = { PBBSeeder };

