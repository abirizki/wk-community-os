/**
 * @class SKTM_AcceptanceTest
 * @description Defines the acceptance criteria for the SKTM end-to-end feature
 * in a behavior-driven format. This file serves as a checklist for QA and Product Owners.
 */
class SKTM_AcceptanceTest {

  /**
   * Returns an array of all acceptance test scenarios.
   * @returns {object[]}
   */
  static getScenarios() {
    return [
      {
        feature: "SKTM Request and Approval",
        scenario: "Happy Path - Successful SKTM Generation",
        steps: [
          "Given a Citizen 'Budi' is logged in",
          "And Budi needs an SKTM for school registration",
          "When Budi submits a new SKTM request with valid attachments",
          "Then the system should create a letter request with status 'REQUESTED'",
          "And the system should start a workflow for this letter",
          "And Budi should receive a notification confirming his submission",
          "And the assigned RT should receive a notification to approve the request",
          "",
          "Given the RT is logged in and views the request",
          "When the RT approves the request",
          "Then the letter status should change to 'APPROVED_RT'",
          "And the assigned RW should receive a notification to approve the request",
          "",
          "Given the RW is logged in and views the request",
          "When the RW approves the request",
          "Then the letter status should change to 'APPROVED_RW'",
          "And the Kelurahan staff should be notified for finalization",
          "",
          "Given the Kelurahan staff is logged in and views the request",
          "When the Kelurahan staff finalizes the approval",
          "Then the system must generate a unique letter number",
          "And the system must generate a PDF document with a QR code",
          "And the letter status should change to 'COMPLETED'",
          "",
          "Given the letter is 'COMPLETED'",
          "When Budi checks his notifications",
          "Then he should receive a notification that his letter is ready",
          "And he should be able to download the final PDF document",
          "And the Analytics dashboard for 'Letters Issued' should be updated on the next cycle"
        ]
      },
      // ... Other scenarios like 'Rejection by RT', 'Invalid Attachments', etc.
    ];
  }
}