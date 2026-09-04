# Security Checklist

Use this checklist to perform a periodic security audit of the WK Community OS deployment.

---

### User & Access Control
- [ ] **Admin Access:** Review all users with `ADMINISTRATOR` role or direct editor access to the Apps Script project. Confirm that this access is still required.
- [ ] **Role Assignments:** Audit a sample of users to ensure their assigned roles align with their real-world responsibilities (Principle of Least Privilege).
- [ ] **Deactivated Users:** Ensure that accounts for former employees or officials have been deactivated in the system.

### Configuration & Secrets
- [ ] **Script Properties:** Confirm that all secrets (API keys, `app.secret_key`) are stored in Script Properties and not in the source code.
- [ ] **`app.secret_key`:** Verify that the secret key is a long, complex, and random string.
- [ ] **Web App Access:** Check the web app deployment settings to ensure "Who has access" is configured correctly (e.g., restricted to the organization).

### Data & Storage
- [ ] **Google Drive Permissions:** Verify that the Google Drive folders for attachments, PDFs, and backups have appropriately restricted sharing settings. They should not be publicly accessible.
- [ ] **Template Permissions:** Verify that the Google Doc templates for letters have restricted edit access to prevent unauthorized modifications.