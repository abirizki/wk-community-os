/**
 * @file LetterSeeder.js
 * @description Idempotent seeder for Letter module lookup references (groups & items).
 * @domain CommunityAdministration
 * @package Letter (Epic Letter / P50)
 */

const { LetterConstants } = require('./LetterEntity.js');

class LetterSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('LetterSeeder') : console;
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

    // Seed groups from LetterConstants
    this._seedLookupGroup('LETTER_TYPE', LetterConstants.LETTER_TYPES);
    this._seedLookupGroup('LETTER_STATUS', LetterConstants.LETTER_STATUSES);

    if (this.logger && this.logger.info) {
      this.logger.info('Letter lookup reference data seeded successfully (LETTER_TYPE, LETTER_STATUS).');
    }
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'LETTER_TYPE' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('letters')) return false;
    const records = db.search('letters', {});
    return records && records.length > 0;
  }
}

module.exports = { LetterSeeder };

