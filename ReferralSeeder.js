/**
 * @class ReferralSeeder
 * @description Seeds the database with initial lookup data for the Referral package.
 */
class ReferralSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('ReferralSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Referral package.
   */
  run() {
    this.logger.info('Running seeder for Referral package...');
    try {
      this._seedReferralTypes();
      this._seedReferralStatuses();
      this._seedReferralPriorities();
      this._seedFollowUpStatuses();
      this.logger.info('Referral package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Referral seeder failed: ${e.message}`);
      throw e;
    }
  }

  /**
   * @private
   */
  _seedReferralTypes() {
    const values = [
      { code: 'INTERNAL', value: 'Internal' },
      { code: 'EXTERNAL', value: 'External' },
      { code: 'EMERGENCY', value: 'Emergency' },
      { code: 'SPECIALIST', value: 'Specialist' },
      { code: 'FOLLOW_UP', value: 'Follow-up' },
      { code: 'DIAGNOSTIC', value: 'Diagnostic' },
      { code: 'OTHER', value: 'Other' },
    ];
    this._seedLookup('REFERRAL_TYPE', values);
  }

  /**
   * @private
   */
  _seedReferralStatuses() {
    const values = [
      { code: 'DRAFT', value: 'Draft' },
      { code: 'PENDING', value: 'Pending' },
      { code: 'ACCEPTED', value: 'Accepted' },
      { code: 'IN_PROGRESS', value: 'In Progress' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'REJECTED', value: 'Rejected' },
      { code: 'CANCELLED', value: 'Cancelled' },
      { code: 'EXPIRED', value: 'Expired' },
    ];
    this._seedLookup('REFERRAL_STATUS', values);
  }

  /**
   * @private
   */
  _seedReferralPriorities() {
    const values = [
      { code: 'NORMAL', value: 'Normal' },
      { code: 'URGENT', value: 'Urgent' },
      { code: 'EMERGENCY', value: 'Emergency' },
    ];
    this._seedLookup('REFERRAL_PRIORITY', values);
  }

  /**
   * @private
   */
  _seedFollowUpStatuses() {
    const values = [
      { code: 'PENDING', value: 'Pending' },
      { code: 'SCHEDULED', value: 'Scheduled' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'CANCELLED', value: 'Cancelled' },
    ];
    this._seedLookup('REFERRAL_FOLLOW_UP_STATUS', values);
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