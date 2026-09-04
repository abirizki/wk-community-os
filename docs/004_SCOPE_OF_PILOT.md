# Scope of Pilot

**Document ID:** PILOT-01-004
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

This document clearly defines the functional and non-functional boundaries of the Kebonjati Pilot. Its purpose is to establish a shared understanding of what will be delivered and tested, preventing scope creep.

## 2. In-Scope Functionality

The following modules and features will be fully implemented and tested during the pilot:

*   **System & Core:**
    *   User authentication and role-based access control.
*   **Citizen & Household Package:**
    *   Viewing and searching for citizen and household data. (Data entry will be pre-seeded).
*   **Letter Package:**
    *   End-to-end workflow for requesting at least two letter types (e.g., SKTM, Surat Pengantar).
    *   Approval process involving RT, RW, and Kelurahan.
    *   Automatic PDF generation with QR code verification.
*   **Complaint Package:**
    *   End-to-end workflow for submitting, verifying, assigning, and resolving public complaints.
*   **Notification Package:**
    *   In-app inbox notifications for all relevant status changes.
*   **Dashboard Package:**
    *   Role-specific dashboards for RT, RW, and Kelurahan staff.

## 3. Out-of-Scope Functionality

The following items are explicitly **excluded** from the scope of this pilot:

*   **New Feature Development:** No new features beyond the core modules will be developed during the pilot.
*   **Major Customization:** Customization of letter templates or workflows beyond the initial setup.
*   **Full Data Migration:** Only a subset of citizen data will be used. A full legacy data migration is not in scope.
*   **Advanced Modules:** Packages such as `PBB`, `SaaS`, `Health`, and `Education` are not part of this pilot.
*   **Third-Party Integrations:** No integration with external systems (e.g., payment gateways, Dukcapil).
*   **Mobile Application:** The pilot will focus exclusively on the web-based application.