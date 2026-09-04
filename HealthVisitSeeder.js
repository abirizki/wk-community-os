/**
 * @class HealthVisitSeeder
 * @description Seeds the database with initial lookup data for the HealthVisit package.
 */
class HealthVisitSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('HealthVisitSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the HealthVisit package.
   */
  run() {
    this.logger.info('Running seeder for HealthVisit package...');
    try {
      this._seedVisitTypes();
      this._seedVisitStatuses();
      this.logger.info('HealthVisit package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`HealthVisit seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   * Seeds operational types for health visits.
   */
  _seedVisitTypes() {
    const values = [
      { code: 'GENERAL', value: 'General Visit' },
      { code: 'POSYANDU', value: 'Posyandu Visit' },
      { code: 'FOLLOW_UP', value: 'Follow-up Visit' },
      { code: 'REFERRAL', value: 'Referral Visit' },
      { code: 'COMMUNITY', value: 'Community Program' },
      { code: 'HOME_VISIT', value: 'Home Visit' },
      { code: 'OTHER', value: 'Other' },
    ];
    this._seedLookup('HEALTH_VISIT_TYPE', values);
  }

  /**
   * @private
   * Seeds operational statuses for health visits.
   */
  _seedVisitStatuses() {
    const values = [
      { code: 'SCHEDULED', value: 'Scheduled' },
      { code: 'IN_PROGRESS', value: 'In Progress' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'CANCELLED', value: 'Cancelled' },
      { code: 'NO_SHOW', value: 'No Show' },
    ];
    this._seedLookup('HEALTH_VISIT_STATUS', values);
  }

  /**
   * @private
   * @param {string} lookupType
   * @param {object[]} values
   */
  _seedLookup(lookupType, values) {
    this.logger.debug(`Seeding ${lookupType} lookups...`);
    values.forEach(item => {
      if (!this.db.exists(this.lookupTableName, { type: lookupType, code: item.code })) {
        this.db.create(this.lookupTableName, { id: Utilities.getUuid(), type: lookupType, code: item.code, value: item.value, isActive: true });
        this.logger.info(`Seeded ${lookupType}: ${item.code}`);
      }
    });
  }
}