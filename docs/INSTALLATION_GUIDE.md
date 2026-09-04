# WK Community OS - Production Installation Guide

**Document ID:** PROD-01
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

This guide provides the official, step-by-step instructions for deploying the WK Community OS into a new, clean production environment. It is intended for certified system administrators and the technical lead. Adherence to this guide is mandatory to ensure a secure and stable installation.

## 2. Prerequisites

Before beginning the installation, ensure the following prerequisites are met:

*   **Google Workspace Account:** A Google Workspace Business Standard (or higher) account is provisioned and accessible with administrative privileges.
*   **Administrator Account:** A dedicated Google account for system administration (e.g., `admin.wkos@yourdomain.com`) has been created. This account will own the project and its triggers.
*   **Local Environment:** A local machine with `Node.js`, `npm`, and the `@google/clasp` CLI tool installed and authenticated to the administrator account.
    ```bash
    npm install -g @google/clasp
    clasp login
    ```
*   **Source Code:** Access to the official WK Community OS source code repository.

## 3. Step 1: Prepare Google Workspace Environment

1.  **Create Apps Script Project:**
    *   Using the administrator account, navigate to `script.google.com` and create a new project named `WK Community OS - PRODUCTION`.
    *   Go to `Project Settings` and copy the **Script ID**.

2.  **Create Google Drive Folders:**
    *   In the administrator's Google Drive, create a root folder named `WKOS_PRODUCTION_DATA`.
    *   Inside this folder, create the following sub-folders:
        *   `backups`
        *   `attachments`
        *   `letter_exports`
    *   For each of these three folders, get its unique **Folder ID** from the URL.

3.  **Enable APIs:**
    *   In the Apps Script Editor, go to `Services` and enable the `Google Drive API`.

## 4. Step 2: Configure and Deploy Source Code

1.  **Clone Repository:** On your local machine, clone the source code.
    ```bash
    git clone <repository_url> wk-community-os
    cd wk-community-os
    ```

2.  **Link Project:** Link your local repository to the Apps Script project created in Step 1.
    ```bash
    clasp clone <your_script_id>
    ```

3.  **Set Script Properties:**
    *   In the Apps Script Editor, navigate to `Project Settings` > `Script Properties`.
    *   Add the following key-value pairs:
        *   `WK_ENVIRONMENT`: `PRODUCTION`
        *   `deployment.backup_folder_id`: The ID of the `backups` folder.
        *   `complaint.attachment_folder_id`: The ID of the `attachments` folder.
        *   `letter.pdf_export_folder_id`: The ID of the `letter_exports` folder.
        *   `app.secret_key`: A newly generated, long, random string for security.

4.  **Push Code:** Push the source code to the Apps Script project.
    ```bash
    clasp push -f
    ```

5.  **Create Deployment:**
    *   In the Apps Script Editor, click `Deploy` > `New deployment`.
    *   Select `Web app` as the deployment type.
    *   **Description:** `v1.0.0 - Initial Production Deployment`.
    *   **Execute as:** `Me (admin.wkos@yourdomain.com)`.
    *   **Who has access:** `Anyone with Google account` (or as specified by security policy).
    *   Click `Deploy` and copy the resulting **Web app URL**.

## 5. Step 3: Initial System Setup

1.  **Run Database Migrations:**
    *   In the Apps Script Editor, select the `runAllMigrations` function from the function list.
    *   Click `Run`. This will create all necessary Google Sheets (database tables) in the Drive account.

2.  **Set Up Triggers:**
    *   Navigate to the `Triggers` section (clock icon).
    *   Create the following time-driven triggers, ensuring they run as the administrator account:
        *   `processEventBusQueue` -> `Time-driven` -> `Minutes timer` -> `Every 5 minutes`.
        *   `processNotificationQueue` -> `Time-driven` -> `Minutes timer` -> `Every 5 minutes`.
        *   `runDailyAnalytics` -> `Time-driven` -> `Day timer` -> `Midnight to 1am`.

## 6. Step 4: Final Verification

Proceed to the **VERIFICATION_CHECKLIST.md** to validate the installation.