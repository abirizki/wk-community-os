# WK Community OS - Restore Configuration Guide

**Document ID:** PROD-06
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

The system's restore service is a powerful tool designed for disaster recovery. It can restore the application's data to a previous state using a backup file.

**WARNING:** A restore operation is a high-risk, destructive action. It will overwrite existing data. This procedure should only be performed by a certified administrator after receiving executive approval.

## 2. Restore Process

1.  **Identify Backup File:**
    *   Navigate to the configured backup folder in Google Drive.
    *   Identify the correct backup file to restore from (e.g., `wk-backup-2026-08-03-....json`).
    *   Obtain the **File ID** for this backup file. You can get this by right-clicking the file and selecting "Get link". The ID is the long string of characters in the link.

2.  **Execute Restore Function:**
    *   To run a restore, an administrator must call the `runManualRestore` function with the backup file ID as a parameter. This is typically done via a secure, internal administrative panel or directly in the Apps Script editor for emergency situations.

    ```javascript
    // This function must be called with the correct parameter.
    function executeEmergencyRestore() {
      const backupFileId = 'PASTE_THE_BACKUP_FILE_ID_HERE';
      WK.service('deployment.restoreService').restoreFromBackup(backupFileId);
    }
    ```