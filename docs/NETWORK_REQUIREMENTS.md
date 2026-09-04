# WK Community OS - Network Requirements

**Document ID:** PROD-03
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. End-User Network Requirements

End-users (Citizens, RT, RW, Kelurahan Staff) access the system via a standard web browser.

*   **Internet Connection:** A stable internet connection is required. The application is designed to be functional on lower-bandwidth connections, but a minimum of **1 Mbps** is recommended for a smooth experience, especially when uploading attachments.
*   **Web Browser:** The latest stable version of a modern web browser:
    *   Google Chrome
    *   Mozilla Firefox
    *   Microsoft Edge
    *   Safari

## 2. Platform Network Configuration

As a cloud-hosted application on Google's infrastructure, no specific inbound firewall rules are required.

*   **Outbound Access:** The Google Workspace environment must have standard outbound internet access to allow Google Apps Script to communicate with other Google APIs (Drive, Sheets, etc.). This is enabled by default in all Google Workspace accounts.
*   **DNS:** If a custom domain (e.g., `layanan.kelurahan-kebonjati.go.id`) is used to access the web app, a `CNAME` record will need to be configured in the domain's DNS settings to point to `script.google.com`.