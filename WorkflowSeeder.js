/**
 * @class WorkflowSeeder
 * @description Seeds the database with initial lookup data for the Workflow package.
 */
class WorkflowSeeder {
  constructor() {
    this.db = WK.database();
    this.logger = WK.logger('WorkflowSeeder');
    this.lookupTableName = 'system_lookups';
  }

  /**
   * Runs all seeding operations for the Workflow package.
   */
  run() {
    this.logger.info('Running seeder for Workflow package...');
    try {
      this._seedWorkflowStatuses();
      this._seedAssigneeTypes();
      this.logger.info('Workflow package seeder completed successfully.');
    } catch (e) {
      this.logger.error(`Workflow seeder failed: ${e.message}`);
      throw e;
    }
  }

  /** @private */
  _seedWorkflowStatuses() {
    const values = [
      { code: 'IN_PROGRESS', value: 'In Progress' },
      { code: 'COMPLETED', value: 'Completed' },
      { code: 'CANCELLED', value: 'Cancelled' },
      { code: 'FAILED', value: 'Failed' },
    ];
    this._seedLookup('WORKFLOW_STATUS', values);
  }

  /** @private */
  _seedAssigneeTypes() {
    const values = [
      { code: 'USER', value: 'User' },
      { code: 'ROLE', value: 'Role' },
    ];
    this._seedLookup('WORKFLOW_ASSIGNEE_TYPE', values);
  }

  /**
   * @private
   * @param {string} lookupType
   * @param {object[]} values
   */
  _seedLookup(lookupType, values) {
    this.logger.debug(`Seeding ${lookupType} lookups...`);
    values.forEach(item => {
      // Check if the lookup already exists to ensure idempotency
      if (!this.db.exists(this.lookupTableName, { type: lookupType, code: item.code })) {
        this.db.create(this.lookupTableName, { id: Utilities.getUuid(), type: lookupType, code: item.code, value: item.value, isActive: true });
        this.logger.info(`Seeded ${lookupType}: ${item.code}`);
      }
    });
  }
}