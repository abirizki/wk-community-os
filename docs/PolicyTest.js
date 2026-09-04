/**
 * @class PolicyTest
 * @description Unit tests for the PolicyEngine.
 */
class PolicyTest {
  static run() {
    const policyEngine = new PolicyEngine();
    const backupPolicy = policyEngine.getPolicy('BACKUP_POLICY');
    console.assert(backupPolicy.params.frequency_days === 7, 'Policy Test: Incorrect backup frequency.');
  }
}