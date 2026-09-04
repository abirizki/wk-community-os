# Maintenance Guide

This guide provides instructions for routine maintenance tasks to ensure the WK Community OS runs smoothly and efficiently.

---

## 1. Daily Monitoring

*   **Check Execution Logs:**
    *   In the Apps Script editor, go to the "Executions" page.
    *   Look for any failed executions, especially for the time-based triggers (`processEventBusQueue`, `processNotificationQueue`, `runDailyAnalytics`).
    *   Investigate and resolve any errors found. Common issues include exceeding API quotas or permission errors.
*   **Review Application Logs:**
    *   If a centralized logging service (like Google Cloud Logging) is configured, review the logs for any `ERROR` or `WARN` level messages from the `WK.logger()`.

## 2. Weekly Tasks

*   **Review Backups:**
    *   Navigate to the Google Drive folder configured for backups.
    *   Ensure that backup files are being created regularly.
    *   Periodically, download a recent backup file to ensure it is not corrupted and contains valid data.
*   **Check Quotas:**
    *   In the Google Cloud Platform (GCP) console linked to your Apps Script project, check the usage and quotas for services like Drive API, Sheets API, etc.
    *   Ensure you are not approaching daily limits.

## 3. Monthly Tasks

*   **Data Archiving (Manual/Semi-Automated):**
    *   For high-volume data like notifications or audit logs, consider an archiving strategy.
    *   This could involve manually copying rows from the "live" Google Sheet to an "archive" Google Sheet for records older than a certain period (e.g., 6-12 months). This keeps the primary data sheets smaller and more performant.
*   **Review User Access:**
    *   Audit the user accounts in the `System` package.
    *   Ensure that only authorized personnel have administrative roles.
    *   Deactivate accounts of officials who are no longer in service.

## 4. As-Needed Tasks

### 4.1. Running a Manual Backup
*   Use the `backup.sh` script or manually run the `createBackup` function in the Apps Script editor.
    ```javascript
    function runManualBackup() {
      WK.service('deployment.backupService').createBackup({ description: 'Manual administrative backup' });
    }
    ```

### 4.2. Re-running Analytics Aggregation
*   If you notice stale data on dashboards, you can manually trigger the analytics aggregation process.
    ```javascript
    function runManualAnalytics() {
      WK.service('analytics').runDailyAggregation();
    }
    ```