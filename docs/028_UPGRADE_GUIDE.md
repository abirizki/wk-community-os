# Upgrade Guide

This guide provides instructions for upgrading the WK Community OS to a new version.

---

## 1. Before You Begin

*   **Read the Release Notes:** Carefully review the `RELEASE_NOTES.md` for the new version. Pay close attention to any "Breaking Changes" or required configuration updates.
*   **Schedule a Maintenance Window:** Inform users of a planned maintenance window. The upgrade process may cause temporary service interruptions.
*   **Perform a Full Backup:** This is the most critical step. Before starting the upgrade, create a full backup of the current production environment.
    ```bash
    # Using the deployment script
    ./deployment/backup.sh
    ```
    Or run the manual backup function from the Apps Script editor.

## 2. Upgrade Process

1.  **Get the New Code:**
    *   On your local machine, pull the latest code from the main branch or switch to the new version's tag.
    ```bash
    git pull origin main
    # or
    git fetch --tags
    git checkout v1.1.0
    ```

2.  **Deploy the New Code:**
    *   Push the updated source code to your Apps Script project using `clasp`.
    ```bash
    clasp push -f
    ```

3.  **Run Database Migrations:**
    *   The new version may include database schema changes. Run the migration service to apply these changes.
    *   Execute the `runAllMigrations` function from the Apps Script editor. This function is idempotent and will only apply new, unapplied migrations.

4.  **Create a New Deployment Version:**
    *   In the Apps Script editor, go to `Deploy` > `Manage deployments`.
    *   Select your main web app deployment and click the pencil icon to `Edit`.
    *   From the `Version` dropdown, select `New version`.
    *   Add a description, e.g., "Upgrade to v1.1.0".
    *   Click `Deploy`. This makes the new code live.

## 3. Post-Upgrade Steps

1.  **Run Health Checks:**
    *   Execute the `healthcheck.sh` script or run the `HealthCheckService` manually to ensure all modules are functioning correctly after the upgrade.
2.  **Run Doctor Service:**
    *   Execute the `verify.sh` script or run the `DoctorService` to check for any configuration or dependency issues.
3.  **Test Key Functionality:**
    *   Manually test a few key user journeys, such as requesting a letter or submitting a complaint, to ensure the system is behaving as expected.
4.  **End Maintenance Window:**
    *   Once you have verified that the system is stable, you can end the maintenance window and allow users back on the platform.

## 4. Rollback Procedure

If the upgrade fails or causes critical issues, follow these steps to roll back to the previous version:

1.  **Redeploy the Previous Version:**
    *   In `Deploy` > `Manage deployments`, edit your deployment.
    *   From the `Version` dropdown, select the previous working version.
    *   Click `Deploy`. This immediately reverts the active code.
2.  **Restore from Backup (If Necessary):**
    *   If the failed migration corrupted data, use the `RestoreService` to restore the database from the pre-upgrade backup. This is a critical operation and should only be performed if absolutely necessary.