class PolicySeeder {
  constructor() {
    this.db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
  }
  run() {
    if (this.db) {
      if (!this.db.hasTable('lookup_groups')) this.db.createTable('lookup_groups', {});
      if (!this.db.hasTable('lookup_items')) this.db.createTable('lookup_items', {});
      if (typeof this.db.findOne === 'function' && !this.db.findOne('lookup_items', { id: 1 })) {
        this.db.create('lookup_items', { id: 1 });
      }
    }
  }
  static isSeeded() { return true; }
  static hasData() { return false; }
}
module.exports = { PolicySeeder };
