# Upgrade Guide: v1.0.0-RC1

**Version:** 1.0.0-RC1
**Audience:** System Administrators

---

## 1. Objective

This guide provides the standard procedure for upgrading the WK Community OS to version `1.0.0-RC1` using the `ReleaseCenter`.

## 2. Prerequisites

*   You have the `releasecenter.upgrade.run` permission assigned to your role.
*   A full, verified system backup has been successfully completed.
*   You have notified users of the scheduled maintenance window.

## 3. Automated Upgrade Procedure

The upgrade process is fully automated through the Release Center dashboard.

1.  **Navigate to Release Center:** Log in to the WK Community OS and navigate to the "Release Center" from the main administrative dashboard.
2.  **Select Release:** In the "Release History" panel, locate the release tagged **`1.0.0-RC1`**.
3.  **Initiate Upgrade:** Click the **"Upgrade"** button associated with the `1.0.0-RC1` release.
4.  **Confirm Action:** A confirmation dialog will appear, summarizing the target version and reminding you to perform a backup. Type "UPGRADE" into the confirmation box and click **"Proceed"**.

## 4. Automated Process

Once confirmed, the `UpgradeService` will perform the following actions automatically:

1.  The system will be placed into **Maintenance Mode**. All non-admin users will be logged out.
2.  The new `1.0.0-RC1` code will be deployed.
3.  The `Kernel` will run all necessary database migrations automatically (see `MIGRATION_NOTES.md`).
4.  The `MonitoringCenter` will perform a post-upgrade health check.
5.  If the health check passes, the system will be taken out of Maintenance Mode.

The entire process should take approximately 5-10 minutes.

## 5. Verification

1.  **Check Version:** After the upgrade, the version number in the footer of the application should display `1.0.0-RC1`.
2.  **Check Monitoring:** Navigate to the `MonitoringCenter` dashboard. All systems should report an "OPERATIONAL" status.

If any verification step fails, proceed immediately to the `ROLLBACK_GUIDE.md`.

## 6. Troubleshooting

*   **Issue:** The upgrade process appears to be stuck in "Maintenance Mode" for more than 15 minutes.
    *   **Action:** Do not restart the server. Check the application logs (`Execution Log` in the Apps Script editor) for any error messages, particularly during the "Running Migrations" phase. Contact the development team with the error details.

*   **Issue:** After the upgrade, users report seeing a "Permission Denied" error for a feature that previously worked.
    *   **Action:** This may indicate a change in permission IDs. Navigate to `IdentityCenter` -> `Roles` and verify that the user's role has the required permissions for the feature. Check the `RELEASE_NOTES.md` for any documented changes to permissions.