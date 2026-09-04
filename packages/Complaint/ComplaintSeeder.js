/**
 * @file ComplaintSeeder.js
 * @description Idempotent seeder for Complaint module lookup references (category, priority, status).
 * @domain CommunitySocial
 * @package Complaint (Epic Complaint / P60)
 */

const { ComplaintConstants } = require('./ComplaintEntity.js');

class ComplaintSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('ComplaintSeeder') : console;
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

    // Seed 3 groups from ComplaintConstants
    this._seedLookupGroup('COMPLAINT_CATEGORY', ComplaintConstants.COMPLAINT_CATEGORIES);
    this._seedLookupGroup('COMPLAINT_PRIORITY', ComplaintConstants.COMPLAINT_PRIORITIES);
    this._seedLookupGroup('COMPLAINT_STATUS', ComplaintConstants.COMPLAINT_STATUSES);

    if (this.logger && this.logger.info) {
      this.logger.info('Complaint lookup reference data seeded successfully (CATEGORY, PRIORITY, STATUS).');
    }
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'COMPLAINT_CATEGORY' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('complaints')) return false;
    const records = db.search('complaints', {});
    return records && records.length > 0;
  }
}

module.exports = { ComplaintSeeder };

