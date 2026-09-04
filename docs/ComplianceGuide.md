# Compliance Guide

This guide explains how to use the `ComplianceService` to ensure the WK Community OS deployment adheres to its defined policies.

---

## 1. Overview

The `ComplianceService` is an automated tool for verifying that the system's operational state meets the rules defined in the `PolicyEngine`. It is designed to be run on a schedule (e.g., weekly) by an administrator to generate a compliance report.

## 2. Running a Compliance Check

An administrator can trigger a full compliance check by executing the `runFullCheck` method.

```javascript
// Example: In a scheduled trigger or admin utility function
function runWeeklyComplianceReport() {
  const complianceService = WK.service('governance.compliance');
  const report = complianceService.runFullCheck();
  
  // Optional: Email the report to administrators
  // WK.service('notification').sendEmail('admin@example.com', 'Weekly Compliance Report', JSON.stringify(report, null, 2));
}
```

## 3. Key Compliance Checks

*   **Backup Policy Verification:** Checks the `deployment.backup_folder_id` in Google Drive to ensure a successful backup has been created within the frequency defined in the `BACKUP_POLICY` (e.g., every 7 days).
*   **Data Retention Policy Verification:** (Conceptual) This check will scan key database tables (like `notifications` and `audit_logs`) for records older than the `active_days` defined in the `DATA_RETENTION_POLICY` and flag them for archiving.
*   **Access Policy Verification:** (Conceptual) This check will analyze the roles and permissions in the `System` package to identify potential "separation of duties" violations (e.g., a single role having both `letter.request` and `letter.approve` permissions).

## 4. Interpreting the Report

The `runFullCheck` method returns a JSON object that provides an `overallStatus` (`COMPLIANT` or `NON_COMPLIANT`) and a detailed breakdown of each check performed, including a message explaining the result. Administrators should review any non-compliant items and take corrective action.