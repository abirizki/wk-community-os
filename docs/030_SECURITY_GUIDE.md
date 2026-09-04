# Security Guide

This guide provides an overview of the security model of WK Community OS and best practices for maintaining a secure deployment.

---

## 1. Security Architecture

*   **Platform Security:** The application is built on Google Workspace and Google Cloud Platform, inheriting their robust physical and network security measures.
*   **Authentication:** User authentication is handled by Google's secure sign-in system. All users must have a valid Google account.
*   **Authorization (RBAC):** The system implements a granular Role-Based Access Control (RBAC) model.
    *   **Roles:** Users are assigned roles (e.g., `CITIZEN`, `RT`, `KELURAHAN`).
    *   **Permissions:** Each action in the system is protected by a specific permission (e.g., `letter.approve`, `complaint.create`).
    *   **Enforcement:** Roles are granted a set of permissions. The `WK.security().checkPermission()` method is called before any sensitive operation to ensure the current user has the required permission.
*   **Data Isolation:** While all data resides within the same Google Workspace account, application logic ensures that users can only access data relevant to their role and jurisdiction (e.g., an RT can only see complaints from their own area).
*   **Data in Transit:** All communication between the user's browser and the Google Apps Script backend is encrypted via HTTPS.

## 2. Security Best Practices for Administrators

### 2.1. User and Role Management
*   **Principle of Least Privilege:** Assign users the role with the minimum set of permissions necessary to perform their duties. Avoid assigning `ADMINISTRATOR` roles unless absolutely required.
*   **Regular Audits:** Regularly review user accounts and their assigned roles. Deactivate accounts for personnel who are no longer active.
*   **Strong Passwords:** Enforce strong password policies for all user Google accounts.

### 2.2. Environment Configuration
*   **Secure Script Properties:** Script Properties in Google Apps Script are the most secure place to store secrets like API keys and the `app.secret_key`. Do not hard-code secrets in the source code.
*   **Restrict Access:** Limit editor access to the Google Apps Script project to only trusted administrators.

### 2.3. Web App Deployment
*   **Access Control:** When deploying the web app, set the "Who has access" setting to the most restrictive level possible. For an internal government tool, this might be "Anyone within [Your Organization]".

### 2.4. Dependency Management
*   Regularly update third-party libraries (if any are used) to patch potential security vulnerabilities.

## 3. Security Checklists

For a comprehensive audit, refer to the checklists in the `verification/` directory:

*   `SECURITY_CHECKLIST.md`
*   `GO_LIVE_CHECKLIST.md`