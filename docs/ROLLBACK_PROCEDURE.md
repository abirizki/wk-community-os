# Data Migration - Rollback Procedure

**Document ID:** MIG-07
**Version:** 1.0
**Date:** 2026-08-05

---

## 1. Overview

This document describes the emergency rollback procedure to be executed if a critical failure occurs during the production data migration. A critical failure is defined as any issue that prevents the successful completion of the `VALIDATION_CHECKLIST.md`.

## 2. Trigger Conditions

*   The migration script fails to complete due to an unrecoverable error.
*   A quantitative check from the validation checklist fails (e.g., record counts do not match).
*   A qualitative spot check reveals systemic data corruption or incorrect mapping.
*   The application becomes unstable or unusable after the migration.

## 3. Rollback Steps

1.  **HALT:** Immediately stop any further migration activities.
2.  **COMMUNICATE:** The Technical Lead must immediately inform the Project Manager of the failure.
3.  **WIPE DATA:**
    *   Delete all Google Sheet files (e.g., `citizens`, `households`) that were created or modified by the migration script. This effectively clears the database.
4.  **RESTORE CLEAN STATE:**
    *   Run the `runAllMigrations` function again to recreate the empty table structure. This returns the database to its clean, pre-migration state.
    *   **DO NOT** use the `RestoreService` for this, as the goal is to return to an empty state, not a previous data state.
5.  **ROOT CAUSE ANALYSIS (RCA):**
    *   The technical team must perform a full RCA on the failed migration.
    *   The source data or migration scripts must be fixed.
    *   The migration process cannot be re-attempted until the issue is resolved and a new staging test is successfully completed.
