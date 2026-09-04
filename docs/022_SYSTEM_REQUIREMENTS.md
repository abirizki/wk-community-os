# System Requirements

WK Community OS is a cloud-native application built on the Google Cloud Platform, primarily utilizing Google Apps Script, Google Sheets as a database, and Google Drive for storage. This architecture minimizes the need for on-premise server infrastructure.

---

## 1. Server-Side Requirements (Google Workspace)

The entire backend of the application runs within a Google Workspace environment.

*   **Google Workspace Account:** A Google Workspace account (e.g., Business Standard, Enterprise) is required to host the application.
*   **Google Apps Script:** The environment must have Google Apps Script enabled.
*   **Google Drive:** Sufficient storage space for:
    *   Application data (stored in Google Sheets).
    *   Generated PDF documents (letters).
    *   Uploaded attachments (complaints, letter requests).
    *   System backups.
*   **Google Sheets:** Used as the primary database. Subject to Google Sheets limitations (e.g., 10 million cells per spreadsheet).
*   **Google Docs:** Used as templates for PDF generation.
*   **Apps Script API Quotas:** The application's usage is subject to standard Google Apps Script quotas and limitations (e.g., daily trigger runtime, URL Fetch calls, etc.). For high-traffic deployments, a Google Cloud Platform (GCP) project may need to be linked to the Apps Script project to extend quotas.

## 2. Client-Side Requirements (End-Users)

End-users (citizens and officials) access the system through a web browser.

*   **Modern Web Browser:**
    *   Google Chrome (latest version recommended)
    *   Mozilla Firefox (latest version recommended)
    *   Microsoft Edge (latest version recommended)
    *   Safari (latest version recommended)
*   **Internet Connection:** A stable internet connection is required to access the web application.
*   **Device:** The application is designed to be responsive and can be accessed on desktops, tablets, and mobile phones.

## 3. Administrator/Developer Requirements

For installation, maintenance, and development.

*   **Google Account with Editor Access:** An administrator needs a Google account with editor access to the Google Apps Script project.
*   **`clasp` (Command Line Apps Script Projects):** The `clasp` CLI tool is recommended for managing deployments and code updates. It can be installed via `npm`.
    ```bash
    npm install -g @google/clasp
    ```