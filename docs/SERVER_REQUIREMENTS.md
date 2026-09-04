# WK Community OS - Server Requirements

**Document ID:** PROD-02
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

WK Community OS is a serverless application built entirely on the Google Workspace and Google Cloud Platform. This architecture eliminates the need for traditional on-premise server hardware and maintenance. The "server" is Google's own infrastructure.

## 2. Google Workspace Requirements

The following are required within the hosting Google Workspace account:

*   **Account Type:** A **Google Workspace Business Standard** account or higher is required to ensure adequate quotas and features.
*   **Enabled Services:** The following Google services must be enabled for the organization:
    *   Google Apps Script
    *   Google Drive
    *   Google Sheets
    *   Google Docs
    *   Gmail (for email notifications)
*   **API Quotas:** The application operates within standard Google Apps Script quotas. For large-scale deployments (e.g., > 5,000 active users), it is highly recommended to link a **Google Cloud Platform (GCP) Project** to the Apps Script project to access higher API limits and prevent service throttling.
*   **Storage:** The Google Drive account for the administrator must have sufficient storage allocated for application data (Google Sheets), generated documents (PDFs), user attachments, and system backups. A minimum of **100 GB** is recommended to start.