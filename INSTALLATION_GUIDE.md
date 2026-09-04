# Fresh Installation Guide: v1.0.0-RC1

**Version:** 1.0.0-RC1
**Audience:** System Administrators, Deployment Engineers

---

## 1. Objective

This guide provides the step-by-step procedure for performing a fresh, clean installation of the WK Community OS Enterprise Edition v1.0.0-RC1 in a new production environment.

## 2. Phase 1: Environment Prerequisites

1.  **Google Workspace Account:** Ensure you have a Google Workspace Business Standard (or higher) account.
2.  **Administrator Account:** Create a dedicated, non-personal user account within your Workspace to own the application (e.g., `admin.wkos@yourdomain.com`). All subsequent steps should be performed while logged in as this user.
3.  **Enable Google Services:** From the Google Cloud Platform (GCP) console associated with your Workspace account, ensure the following APIs are enabled for your project:
    *   Google Drive API
    *   Google Sheets API
    *   Google Apps Script API
4.  **Create Project:** Create a new, standalone Apps Script project named "WK Community OS".

## 3. Phase 2: Code Deployment

1.  **Install `clasp`:** Ensure you have the `clasp` command-line tool from Google installed and configured (`npm install -g @google/clasp`).
2.  **Clone Repository:** Clone the WK Community OS source code repository to your local machine.
3.  **Login to `clasp`:** Run `clasp login` and authenticate with the dedicated administrator account.
4.  **Bind Project:** In the root of the cloned repository, run `clasp clone <ScriptID>`, where `<ScriptID>` is the ID of the Apps Script project you created in Phase 1. This will create a `.clasp.json` file.
5.  **Push Code:** Run `clasp push -f` to deploy the entire codebase to your Apps Script project.

## 4. Phase 3: Initial Configuration

1.  **Create Config Folder:** In the Google Drive of the administrator account, create a folder named `WKOS_CONFIG`.
2.  **Create Config File:** Inside this folder, create a new file named `config.json`.
3.  **Populate Configuration:** Populate `config.json` with the necessary environment settings. This must include database connection details, the email address of the initial super-administrator, and any required API keys for external integrations.

    **Example `config.json` structure:**
    ```json
    {
      "environment": "PRODUCTION",
      "database": {
        "type": "jdbc",
        "url": "jdbc:mysql://<your_db_host>:3306/<your_db_name>",
        "user": "<your_db_user>",
        "password": "<your_db_password>"
      },
      "superAdmin": {
        "email": "super.admin@yourdomain.com"
      },
      "secrets": {
        "keys": {
          "primary_data_key": "<generate_a_secure_random_string>"
        }
      }
    }
    ```
## 5. Phase 4: System Initialization

This is a one-time setup process.

1.  **Open Apps Script Editor:** Open the "WK Community OS" project in the Apps Script editor.
2.  **Select Function:** From the function dropdown list, select `Kernel.runInitialSetup`.
3.  **Execute:** Click the **"Run"** button.

    *   **Note:** The first time you run any function, Google Apps Script will prompt you to review and authorize the necessary permissions (e.g., access to Drive, Sheets, external URLs). You must grant these permissions for the application to function correctly.

This script will perform the initial system bootstrap, which includes running all database migrations and data seeders. This may take several minutes to complete. Monitor the execution logs for any errors.

## 6. Phase 5: Final Verification

1.  **Deploy as Web App:** In the Apps Script editor, click "Deploy" -> "New deployment". Configure it to be executed as "Me" and accessible by "Anyone". Note the generated Web App URL.
2.  **Login:** Access the Web App URL. You should be presented with the WK Community OS login screen.
3.  **Verify:** Log in as the initial super-administrator defined in your `config.json`. Navigate to the `MonitoringCenter` and confirm that all subsystems report an "OPERATIONAL" status.

The installation is now complete.