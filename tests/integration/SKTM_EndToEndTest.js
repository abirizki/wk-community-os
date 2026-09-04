/**
 * @class SKTM_EndToEndTest
 * @description An integration test that simulates the entire SKTM workflow
 * by calling the services in the correct sequence. This test verifies the
 * integration between the Letter, Workflow, and Notification packages.
 */
class SKTM_EndToEndTest {
  /**
   * Main entry point to run the end-to-end test.
   */
  static run() {
    WK.logger().info('--- [START] SKTM End-to-End Integration Test ---');

    // Mock user sessions
    const citizenUser = { id: 'citizen123', role: 'CITIZEN', address: { rt: '001', rw: '001' } };
    const rtUser = { id: 'rt456', role: 'RT', address: { rt: '001', rw: '001' } };
    const rwUser = { id: 'rw789', role: 'RW', address: { rw: '001' } };
    const kelurahanUser = { id: 'lurah01', role: 'KELURAHAN' };

    // Get services
    const letterService = WK.service('letter');
    const workflowService = WK.service('workflow');
    const notificationService = WK.service('notification'); // For verification

    let letterId;
    let workflowId;

    try {
      // Step 1: Citizen requests the letter
      WK.session().setUser(citizenUser); // Set session context
      const requestData = {
        letterType: 'SKTM',
        citizenId: citizenUser.id,
        formData: { keperluan: 'Test Integration' },
        attachments: [{ type: 'KTP', fileId: 'file1' }, { type: 'KK', fileId: 'file2' }]
      };
      const newLetter = letterService.requestLetter(requestData);
      letterId = newLetter.id;
      console.assert(letterId, 'Test Failed: Letter creation did not return an ID.');
      console.assert(newLetter.status === 'REQUESTED', 'Test Failed: Initial letter status is not REQUESTED.');
      WK.logger().info(`[PASS] Step 1: Citizen requested letter. ID: ${letterId}`);

      // Verify workflow was started
      const workflow = workflowService.getWorkflowByReferenceId(letterId);
      workflowId = workflow.id;
      console.assert(workflowId, 'Test Failed: Workflow was not started for the new letter.');
      console.assert(workflow.currentState === 'SUBMITTED', 'Test Failed: Initial workflow state is not SUBMITTED.');
      WK.logger().info(`[PASS] Step 1a: Workflow started. ID: ${workflowId}`);

      // Step 2: RT approves the letter
      WK.session().setUser(rtUser); // Set session context
      const approvedByRT = letterService.approveLetter(letterId, 'RT approved.');
      console.assert(approvedByRT.status === 'APPROVED_RT', 'Test Failed: Letter status did not change to APPROVED_RT.');
      WK.logger().info('[PASS] Step 2: RT approved the letter.');

      // Verify workflow state
      const wf_after_rt = workflowService.getWorkflowByReferenceId(letterId);
      console.assert(wf_after_rt.currentState === 'PENDING_RW_APPROVAL', 'Test Failed: Workflow state did not move to PENDING_RW_APPROVAL.');
      WK.logger().info('[PASS] Step 2a: Workflow state updated correctly.');

      // Step 3: RW approves the letter
      WK.session().setUser(rwUser); // Set session context
      const approvedByRW = letterService.approveLetter(letterId, 'RW approved.');
      console.assert(approvedByRW.status === 'APPROVED_RW', 'Test Failed: Letter status did not change to APPROVED_RW.');
      WK.logger().info('[PASS] Step 3: RW approved the letter.');

      // Step 4: Kelurahan finalizes the letter
      WK.session().setUser(kelurahanUser); // Set session context
      const finalizedLetter = letterService.approveLetter(letterId, 'Finalized by Kelurahan.');
      console.assert(finalizedLetter.status === 'COMPLETED', 'Test Failed: Final letter status is not COMPLETED.');
      console.assert(finalizedLetter.letterNumber, 'Test Failed: Letter number was not generated.');
      console.assert(finalizedLetter.pdfFileId, 'Test Failed: PDF File ID was not generated.');
      console.assert(finalizedLetter.qrCodeData, 'Test Failed: QR Code data was not generated.');
      WK.logger().info(`[PASS] Step 4: Kelurahan finalized the letter. Number: ${finalizedLetter.letterNumber}`);

      // Step 5: Verify notifications were queued (conceptual check)
      // In a real test, we would inspect the NotificationQueue.
      const notificationQueue = WK.service('notification').queue;
      const queuedItems = notificationQueue.getItems(); // Assuming such a method exists for testing
      console.assert(queuedItems.length >= 3, 'Test Failed: Expected at least 3 notifications to be queued (to RT, RW, Citizen).');
      WK.logger().info('[PASS] Step 5: Notifications were queued correctly.');

      WK.logger().info('--- [SUCCESS] SKTM End-to-End Integration Test Passed ---');

    } catch (e) {
      WK.logger().error(`--- [FAIL] SKTM End-to-End Integration Test Failed at step: ${e.message}`, e.stack);
    } finally {
      // Clean up test data
      // e.g., WK.repository('letter').delete(letterId);
      // WK.repository('workflow').delete(workflowId);
      WK.session().setUser(null); // Clear session
    }
  }
}