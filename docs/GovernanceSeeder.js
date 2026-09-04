/**
 * @class GovernanceSeeder
 * @description Seeds initial data for the Governance module, such as predefined risks.
 */
class GovernanceSeeder {
  /**
   * @param {RiskAssessmentService} riskAssessmentService
   */
  constructor(riskAssessmentService) {
    /** @private */
    this.riskAssessmentService = riskAssessmentService;
  }

  /**
   * Runs the seeder to populate initial governance data.
   */
  run() {
    WK.security().checkPermission('governance.seed');
    WK.logger().info('Running Governance module seeder...');

    this._seedInitialRisks();

    WK.logger().info('Governance module seeder completed.');
  }

  /**
   * Seeds the initial set of common risks into the risk register.
   * @private
   */
  _seedInitialRisks() {
    const initialRisks = [
      {
        description: 'Unauthorized access to sensitive citizen data due to compromised administrator account.',
        likelihood: 2,
        impact: 5,
        owner: 'IT Admin',
        mitigationStrategy: 'Enforce 2-Factor Authentication on all admin accounts. Conduct regular access reviews.'
      },
      {
        description: 'Data loss due to failure of backup and restore process.',
        likelihood: 1,
        impact: 5,
        owner: 'IT Admin',
        mitigationStrategy: 'Automate daily backups. Perform quarterly restore drills to a test environment.'
      }
    ];

    initialRisks.forEach(risk => this.riskAssessmentService.addRisk(risk));
  }
}