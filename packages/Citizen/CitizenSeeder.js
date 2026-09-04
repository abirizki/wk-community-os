/**
 * @file CitizenSeeder.js
 * @description Idempotent seeder for Citizen demographics reference data.
 */

const { CitizenConstants } = require('./CitizenEntity.js');

class CitizenSeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    this.logger = typeof WK !== 'undefined' && typeof WK.logger === 'function' ? WK.logger('CitizenSeeder') : console;
  }

  _seedLookupGroup(groupName, items) {
    if (!this.db) return;
    let group = this.db.findOne('lookup_groups', { name: groupName });
    if (!group) {
      group = { id: `group_${groupName.toLowerCase()}`, name: groupName };
      this.db.create('lookup_groups', group);
    }
    items.forEach(itemName => {
      const existing = this.db.findOne('lookup_items', { groupId: group.id, code: itemName });
      if (!existing) {
        this.db.create('lookup_items', {
          id: `item_${group.id}_${itemName.toLowerCase()}`,
          groupId: group.id,
          code: itemName,
          label: itemName.replace(/_/g, ' ')
        });
      }
    });
  }

  run() {
    if (!this.db) return;
    if (!this.db.hasTable('lookup_groups')) this.db.createTable('lookup_groups', {});
    if (!this.db.hasTable('lookup_items')) this.db.createTable('lookup_items', {});

    this._seedLookupGroup('GENDER', CitizenConstants.GENDERS);
    this._seedLookupGroup('MARITAL_STATUS', CitizenConstants.MARITAL_STATUSES);
    this._seedLookupGroup('FAMILY_RELATION', CitizenConstants.FAMILY_RELATIONS);
    this._seedLookupGroup('RESIDENCY_STATUS', CitizenConstants.RESIDENCY_STATUSES);
    this._seedLookupGroup('REGION_LEVEL', CitizenConstants.REGION_LEVELS);

    if (this.logger && this.logger.info) this.logger.info('Citizen demographic lookup data seeded.');
  }

  static isSeeded() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('lookup_groups')) return false;
    return !!db.findOne('lookup_groups', { name: 'RESIDENCY_STATUS' });
  }

  static hasData() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (!db || !db.hasTable('citizens')) return false;
    const records = db.search('citizens', {});
    return records && records.length > 0;
  }
}

module.exports = { CitizenSeeder };

