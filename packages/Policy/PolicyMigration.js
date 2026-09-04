class PolicyMigration {
  static migrationVersion() { return '1.0.0'; }
  static seedRequired() { return true; }
  static up() {
    const db = typeof WK !== 'undefined' && typeof WK.database === 'function' ? WK.database() : null;
    if (db) {
      if (!db.hasTable('policies')) db.createTable('policies', {});
      if (!db.hasTable('policy_procedures')) db.createTable('policy_procedures', {});
    }
  }
  static down() {}
}
module.exports = { PolicyMigration };
