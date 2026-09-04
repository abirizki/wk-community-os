/**
 * @class ComplaintRule
 * @description Defines business rules for the Complaint module. These rules are
 * evaluated by the Rule Engine to trigger decoupled actions like notifications
 * or automatic assignments based on complaint events and data.
 */
class ComplaintRule {
  /**
   * Returns an array of rule definitions for the Complaint module.
   * @returns {object[]} An array of rule configuration objects.
   */
  static getRules() {
    return [
      {
        id: 'CMP-RULE-001',
        description: 'Start workflow for new complaint.',
        eventType: 'Complaint.Created',
        conditions: [], // Always trigger when a complaint is created
        actions: [
          {
            type: 'CALL_SERVICE',
            service: 'WorkflowService',
            method: 'startWorkflow',
            params: [
              'COMPLAINT_RESOLUTION', // Workflow type
              'payload.id',           // referenceId: Complaint ID
              'payload.citizenId',    // submittedBy: Citizen ID
              {
                complaintCategory: 'payload.category',
                citizenRT: 'payload.citizen.address.rt', // Assuming citizen data is in payload
                citizenRW: 'payload.citizen.address.rw'
              }
            ]
          },
          {
            type: 'NOTIFY',
            payload: {
              recipientType: 'CITIZEN',
              recipientId: 'payload.citizenId',
              message: 'Keluhan Anda dengan nomor pelacakan [payload.trackingNumber] telah berhasil diajukan.',
              category: 'Complaint',
              priority: 'NORMAL',
              actionUrl: '/complaint/track/[payload.trackingNumber]'
            }
          }
        ],
        priority: 'HIGH'
      },
      {
        id: 'CMP-RULE-002',
        description: 'Notify RT when a complaint is submitted in their area.',
        eventType: 'Complaint.Submitted', // This event is published by WorkflowService
        conditions: [
          { field: 'payload.citizen.address.rt', operator: 'EXISTS' } // Ensure RT info is available
        ],
        actions: [
          {
            type: 'NOTIFY',
            payload: {
              recipientType: 'ROLE_IN_AREA',
              role: 'RT',
              area: { rt: 'payload.citizen.address.rt', rw: 'payload.citizen.address.rw' },
              message: 'Keluhan baru ([payload.category]) dari warga [payload.citizen.nama_lengkap] di wilayah Anda menunggu verifikasi.',
              category: 'Complaint',
              priority: 'HIGH',
              actionUrl: '/complaint/verify/[payload.id]'
            }
          }
        ],
        priority: 'HIGH'
      },
      {
        id: 'CMP-RULE-003',
        description: 'Auto-assign critical infrastructure complaints to specific officer.',
        eventType: 'Complaint.Verified',
        conditions: [
          { field: 'payload.category', operator: '==', value: 'Infrastructure' },
          { field: 'payload.priority', operator: '==', value: 'CRITICAL' }
        ],
        actions: [
          {
            type: 'CALL_SERVICE',
            service: 'ComplaintAssignmentService',
            method: 'assignComplaint',
            params: [
              'payload.id',
              'INFRA_OFFICER_ID', // Placeholder for actual officer ID
              'OFFICER'
            ]
          },
          {
            type: 'EVENT',
            eventType: 'Complaint.Assigned',
            payloadField: 'payload'
          }
        ],
        priority: 'CRITICAL'
      },
      // ... other rules for different statuses and notifications
    ];
  }
}

// Register the rules with the framework's Rule Engine
WK.rule('complaint', ComplaintRule.getRules());