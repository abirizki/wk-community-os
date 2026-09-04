# Production Installation Checklist

**Document ID:** PROD-08
**Version:** 1.0
**Date:** 2026-08-04

---

Use this checklist to ensure all steps in the `INSTALLATION_GUIDE.md` are completed correctly.

- [ ] **Prerequisites:** Google Workspace account is active and of the correct type.
- [ ] **Prerequisites:** Administrator account created and `clasp` is authenticated.
- [ ] **Environment:** New Google Apps Script project created and Script ID copied.
- [ ] **Environment:** Google Drive folders (`backups`, `attachments`, `letter_exports`) created and IDs copied.
- [ ] **Configuration:** `clasp` has been successfully linked to the new Script ID.
- [ ] **Configuration:** All required Script Properties (`WK_ENVIRONMENT`, folder IDs, `app.secret_key`) have been set correctly for `PRODUCTION`.
- [ ] **Deployment:** `clasp push` completed without errors.
- [ ] **Deployment:** A new web app deployment has been created and the URL is accessible.
- [ ] **Migration:** The `runAllMigrations` function has been executed successfully.
- [ ] **Triggers:** All required time-based triggers (`EventBus`, `Notification`, `Analytics`) have been created, are enabled, and are owned by the administrator account.