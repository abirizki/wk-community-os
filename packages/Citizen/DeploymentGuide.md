# SKTM Service - Deployment & Configuration Guide

This guide outlines the necessary configuration steps to ensure the SKTM end-to-end flow functions correctly in a deployed environment.

---

## 1. Prerequisites

Ensure the following packages are enabled in their respective `module.json` files:
- `citizen`
- `household`
- `letter`
- `workflow`
- `eventbus`
- `notification`
- `analytics`
- `dashboard`

## 2. Letter Template Configuration

The `LetterTemplateService` must be configured with the correct Google Doc template ID for the SKTM.

**File:** `packages/Letter/src/LetterTemplateService.js`

```javascript
// Inside _loadTemplates() method
'SKTM': {
    name: 'Surat Keterangan Tidak Mampu',
    code: 'SKTM',
    classificationCode: '470',
    googleDocTemplateId: 'YOUR_ACTUAL_GOOGLE_DOC_TEMPLATE_ID_HERE', // <-- IMPORTANT: Update this ID
    requiredAttachments: [
      { type: 'KTP', name: 'Scan KTP' },
      { type: 'KK', name: 'Scan Kartu Keluarga' }
    ]
},
```

## 3. Workflow Definition

Ensure the `WorkflowService` in the `Workflow` package has a defined workflow for `LETTER_APPROVAL`. The states should match the approval flow (e.g., `SUBMITTED` -> `APPROVED_RT` -> `APPROVED_RW` -> `COMPLETED`).

## 4. Notification Templates

The `NotificationTemplate` service in the `Notification` package must have templates defined for the events published by the Letter and Workflow packages, such as:
- `Letter.Requested`
- `Workflow.StateChanged` (with logic for different states)
- `Letter.Completed`
- `Letter.Rejected`

## 5. Scheduler / Triggers

The following time-based triggers must be configured in the Google Apps Script project to ensure asynchronous processing:

- **EventBus Processor:** Runs `WK.service('eventbus').processQueue()` every 1-5 minutes.
- **Notification Scheduler:** Runs `WK.service('notification').processQueue()` every 1-5 minutes.
- **Analytics Aggregator:** Runs `WK.service('analytics').runDailyAggregation()` once per day (e.g., at midnight).

## 6. Role Permissions

Verify that the `System` package has correctly defined the roles (`CITIZEN`, `RT`, `RW`, `KELURAHAN`, `ADMINISTRATOR`) and that the permissions defined in `LetterPermission.js`, `WorkflowPermission.js`, etc., are correctly assigned to these roles.