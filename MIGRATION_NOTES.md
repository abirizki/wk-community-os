# Migration Notes: v1.0.0-RC1

**Version:** 1.0.0-RC1
**Date:** 2026-08-07

---

## 1. Overview

This document outlines the database schema migrations required for the v1.0.0-RC1 release.

For upgrades performed using the `ReleaseCenter`, all migrations are executed automatically by the `UpgradeService`. For fresh installations, these migrations are run as part of the initial setup procedure. No manual database intervention is required.

## 2. Automated Migration Scripts

The v1.0.0-RC1 release includes the following new database tables, which will be created by their respective package migration files:

*   **`security_access_logs`**
    *   **Package:** `SecurityCenter`
    *   **Purpose:** Stores a log of all critical access events (logins, failures, etc.) for threat detection and auditing.
*   **`monitoring_alerts_history`**
    *   **Package:** `MonitoringCenter`
    *   **Purpose:** Stores a history of all triggered system alerts.
*   **`reporting_history`**
    *   **Package:** `ReportingCenter`
    *   **Purpose:** Stores a log of all generated reports.
*   **`integrationhub_logs`**
    *   **Package:** `IntegrationHub`
    *   **Purpose:** Logs all major inbound and outbound integration events.
*   **`release_history`**
    *   **Package:** `ReleaseCenter`
    *   **Purpose:** Stores a manifest and history of all software releases.