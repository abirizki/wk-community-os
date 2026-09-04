# Installation Checklist

Use this checklist to verify a successful installation of WK Community OS.

---

- [ ] **Prerequisites:** Google Workspace account is active.
- [ ] **Prerequisites:** `clasp` is installed and authenticated.
- [ ] **Environment:** New Google Apps Script project has been created.
- [ ] **Environment:** Google Drive folders (`backups`, `attachments`, `pdf_exports`) have been created and their IDs noted.
- [ ] **Configuration:** `clasp` is linked to the correct Script ID.
- [ ] **Configuration:** All required Script Properties (`WK_ENVIRONMENT`, folder IDs, `app.secret_key`) have been set.
- [ ] **Deployment:** `clasp push` completed without errors.
- [ ] **Deployment:** A new web app deployment has been created and the URL is accessible.
- [ ] **Migration:** The `runAllMigrations` function has been executed successfully.
- [ ] **Verification:** All required Google Sheets (e.g., `citizens`, `households`, `letters`) have been created in Google Drive.
- [ ] **Triggers:** All required time-based triggers (`EventBus`, `Notification`, `Analytics`) have been created and are enabled.
- [ ] **Health Check:** A manual run of the `HealthCheckService` reports all green.