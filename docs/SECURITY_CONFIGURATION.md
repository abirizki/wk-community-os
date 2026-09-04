# WK Community OS - Security Configuration Guide

**Document ID:** PROD-07
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

This document provides a checklist of mandatory security configurations for a production environment.

## 2. Application Secrets

*   **`app.secret_key`:**
    *   **Action:** In `Project Settings` > `Script Properties`, set the `app.secret_key`.
    *   **Requirement:** The value must be a long, cryptographically random string. It is used for signing security tokens (e.g., QR codes) and must be unique for each production deployment. Do **not** reuse keys from other environments.

## 3. Web App Access Control

*   **Deployment Configuration:**
    *   **Action:** When creating the web app deployment (`Deploy` > `Manage deployments`), configure the "Who has access" setting.
    *   **Requirement:** For maximum security, this should be set to `Anyone within [Your Organization]`. If public access is required for citizens, it must be set to `Anyone with Google account`. It should **never** be set to `Anyone`.

## 4. Google Drive Folder Permissions

*   **Data Folders (`backups`, `attachments`, `letter_exports`):**
    *   **Action:** In Google Drive, check the sharing settings for these folders.
    *   **Requirement:** These folders must **not** be publicly shared. Access should be restricted to the administrator account and any other explicitly authorized system accounts.

## 5. User & Role Management

*   **Principle of Least Privilege:**
    *   **Action:** When creating user accounts in the WK Community OS `System` module, assign roles with the minimum necessary permissions.
    *   **Requirement:** Avoid assigning the `ADMINISTRATOR` role to regular users. Kelurahan staff should have a `KELURAHAN_STAFF` role, RT heads should have an `RT` role, etc.

## 6. Regular Audits

*   **Action:** Use the `AccessReviewService` in the `Governance` package to periodically generate a full report of user permissions.
*   **Requirement:** Conduct a user access review at least once per quarter to remove inactive accounts and ensure permissions are still appropriate.