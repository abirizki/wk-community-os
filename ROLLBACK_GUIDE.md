# Rollback Guide: v1.0.0-RC1

**Version:** 1.0.0-RC1
**Audience:** System Administrators

---

## 1. Objective

This guide provides the emergency procedure for rolling back a failed upgrade to `1.0.0-RC1` and restoring the system to its previous stable state.

## 2. When to Initiate a Rollback

A rollback is a critical, disruptive operation and should only be performed if:

*   The automated post-upgrade health check fails and the system does not come back online.
*   **Before initiating, contact the technical lead or development team to confirm the necessity of a rollback.**
*   A critical, system-wide failure is discovered immediately following the upgrade that prevents core business operations.

## 3. Automated Rollback Procedure

The `ReleaseCenter` provides a one-click rollback mechanism.

1.  **Navigate to Release Center:** Access the Release Center dashboard.
2.  **Initiate Rollback:** The dashboard will show the last upgrade attempt as "FAILED" or will have a prominent **"Initiate Emergency Rollback"** button visible. Click this button.
3.  **Confirm Action:** A severe warning dialog will appear, requiring you to type "ROLLBACK" to proceed. This is the final confirmation before an irreversible action.

## 4. Automated Process

Once confirmed, the `RollbackService` will perform the following actions automatically:

1.  The system will be placed (or kept) in Maintenance Mode.
2.  The code from the *previous stable release* will be re-deployed.
3.  If applicable, any "down" database migrations will be executed to ensure data consistency.
    *   **CRITICAL WARNING:** While "down" migrations are designed to be safe, they carry an inherent risk of data loss for any data created *after* the failed upgrade. This action is not guaranteed to be 100% reversible.
4.  The system will be restored to its pre-upgrade state and brought back online.

## 5. Post-Rollback Verification

After the rollback procedure is complete:

1.  **Verify Version:** Check the application footer. The version should reflect the previous stable release number.
2.  **Check Monitoring:** Navigate to the `MonitoringCenter` and ensure all systems are "OPERATIONAL".
3.  **Perform Smoke Test:** Log in as a test user and verify that core functionalities (e.g., creating a letter request) are working as expected.
4.  **Contact Support:** Inform the development team that the rollback has been completed.