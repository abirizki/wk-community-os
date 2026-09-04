# Configuration Guide

This guide explains how to configure the WK Community OS application for different environments.

---

## 1. Configuration Layers

The system uses a layered configuration approach to provide flexibility and maintainability.

1.  **Default Configuration (`config.default.json`):** This file contains the base configuration for the entire application. It should be version-controlled and contain settings that are common across all environments.
2.  **Environment-Specific Configuration (`config.<environment>.json`):** These files (e.g., `config.production.json`, `config.staging.json`) contain settings that override the default configuration for a specific environment. These files may contain sensitive information (like API keys) and should be managed securely.
3.  **Script Properties:** These are key-value pairs set directly in the Google Apps Script project settings. They are the highest priority and will override any values from the JSON configuration files. They are ideal for storing secrets and environment-specific identifiers.

The final configuration used by the application is a merge of these layers: `Default -> Environment -> Script Properties`.

## 2. Key Configuration Areas

### 2.1. Environment Configuration

This is the most critical setting and is managed via Script Properties.

*   **Location:** Apps Script Editor > Project Settings > Script Properties
*   **Property Name:** `WK_ENVIRONMENT`
*   **Value:** One of `DEVELOPMENT`, `TESTING`, `STAGING`, `PILOT`, `PRODUCTION`.
*   **Description:** This value determines which `config.<environment>.json` file is loaded.

### 2.2. Google Drive Folder IDs

These properties link the application to specific folders in Google Drive for storing generated files and backups.

*   **Location:** Apps Script Editor > Project Settings > Script Properties
*   **Properties:**
    *   `deployment.backup_folder_id`: ID of the folder for storing system backups.
    *   `complaint.attachment_folder_id`: ID of the folder for storing complaint attachments.
    *   `letter.pdf_export_folder_id`: ID of the folder for storing generated letter PDFs.

### 2.3. Application Secrets

*   **Location:** Apps Script Editor > Project Settings > Script Properties
*   **Property:** `app.secret_key`
*   **Description:** A long, random string used for security functions like generating checksums for QR codes. This should be unique for each deployment.

### 2.4. Letter Templates

The Google Doc template IDs for each letter type are configured within the `Letter` package.

*   **File:** `packages/Letter/src/LetterTemplateService.js`
*   **Method:** `_loadTemplates()`
*   **Example:**
    ```javascript
    'SKTM': {
        // ...
        googleDocTemplateId: '1a2b3c4d5e6f...', // <-- The ID of the Google Doc template
        // ...
    },
    ```

### 2.5. Database Configuration (Google Sheets)

The names of the Google Sheets used as database tables are configured within each module's `Repository` class. For example:

*   **File:** `packages/Complaint/src/ComplaintRepository.js`
*   **Code:** `this.db = dbAdapter.setTable('complaints');`

Changing the table name here will cause the system to look for or create a Google Sheet with that name. It is not recommended to change these values post-installation.