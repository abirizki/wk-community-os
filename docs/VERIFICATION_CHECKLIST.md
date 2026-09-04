# Post-Installation Verification Checklist

**Document ID:** PROD-09
**Version:** 1.0
**Date:** 2026-08-04

---

## 1. Overview

This checklist is used by the Technical Lead immediately after installation to verify the technical integrity of the deployment.

## 2. Verification Steps

### System Health
- [ ] **Health Check:** Manually run the `runAllHealthChecks` function. Verify that the execution log shows a "SUCCESS" status for all core modules:
    - [ ] Framework
    - [ ] Core
    - [ ] System
    - [ ] Citizen & Household
    - [ ] Letter & Workflow
    - [ ] Complaint
    - [ ] EventBus & Notification
    - [ ] Analytics & Dashboard

### Database Integrity
- [ ] **Google Drive:** Navigate to the administrator's Google Drive. Verify that Google Sheets for all major modules have been created (e.g., `citizens`, `households`, `letters`, `complaints`).

### Accessibility
- [ ] **Web App URL:** Access the main web app URL. Verify that the application loads without any initial errors.
- [ ] **Admin Login:** Log in as a pre-created administrator user. Verify that the main administrative dashboard loads.

### Core Functionality (Smoke Test)
- [ ] **Citizen Data:** Search for a pre-seeded citizen. Verify that the data is displayed correctly.
- [ ] **Triggers:** Check the `Triggers` page in the Apps Script editor. Verify that the "Last run" time updates for the minute-based timers after 5-10 minutes.