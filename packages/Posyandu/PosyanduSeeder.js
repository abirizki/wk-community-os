/**
 * @file PosyanduSeeder.js
 * @description Idempotent seeder for Posyandu module reference data (target group, nutrition, stunting, visit status, immunization).
 * @domain CommunityHealth
 * @package Posyandu (Epic Posyandu / P80)
 */

const { PosyanduConstants } = require('./PosyanduEntity.js');

class PosyanduSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('PosyanduSeeder') : console;
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

    // Seed 5 groups from PosyanduConstants
    this._seedLookupGroup('POSYANDU_TARGET_GROUP', PosyanduConstants.TARGET_GROUPS);
    this._seedLookupGroup('POSYANDU_NUTRITION_STATUS', PosyanduConstants.NUTRITION_STATUSES);
    this._seedLookupGroup('POSYANDU_STUNTING_STATUS', PosyanduConstants.STUNTING_STATUSES);
    this._seedLookupGroup('POSYANDU_VISIT_STATUS', PosyanduConstants.VISIT_STATUSES);
    this._seedLookupGroup('POSYANDU_IMMUNIZATION_TYPE', PosyanduConstants.IMMUNIZATION_TYPES);

    if (this.logger && this.logger.info) {
      this.logger.info('Posyandu lookup reference data seeded successfully (TARGET_GROUP, NUTRITION, STUNTING, VISIT_STATUS, IMMUNIZATION).');
    }
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'POSYANDU_TARGET_GROUP' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('posyandu_members')) return false;
    const records = db.search('posyandu_members', {});
    return records && records.length > 0;
  }
}

module.exports = { PosyanduSeeder };

