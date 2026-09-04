# WK Community OS - Backup Configuration Guide

**Document ID:** PROD-05
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

The system includes a built-in backup service capable of creating a full snapshot of the application's data. Backups are stored as compressed JSON files in a designated Google Drive folder.

## 2. Configuration

1.  **Create Backup Folder:** In the administrator's Google Drive, create a folder to store all system backups. It is recommended to name this folder `backups`.
2.  **Get Folder ID:** Open the newly created folder and copy the unique ID from the URL. (e.g., in `https://drive.google.com/drive/folders/THIS_IS_THE_ID`, copy `THIS_IS_THE_ID`).
3.  **Set Script Property:**
    *   In the Apps Script Editor, go to `Project Settings` > `Script Properties`.
    *   Set the key `deployment.backup_folder_id` to the Folder ID you copied.

## 3. Running a Manual Backup

An administrator can trigger a manual backup at any time.

1.  Open the Apps Script project in the editor.
2.  From the function dropdown list, select `runManualBackup`.
3.  Click the **Run** button.

A new backup file will be generated and saved to the configured Google Drive folder.