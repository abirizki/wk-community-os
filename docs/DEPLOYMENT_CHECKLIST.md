# Deployment & Upgrade Checklist

Use this checklist when deploying a new version (upgrade) of WK Community OS to a production environment.

---

- [ ] **Communication:** A maintenance window has been scheduled and communicated to all users.
- [ ] **Backup:** A full system backup has been successfully created and verified before starting the deployment.
- [ ] **Code:** The correct version/tag of the source code has been checked out locally.
- [ ] **Deployment:** `clasp push` of the new code has completed successfully.
- [ ] **Migration:** The `runAllMigrations` function has been executed successfully. Check logs for any errors.
- [ ] **Activation:** A new version has been selected in `Manage Deployments` and the deployment has been updated.
- [ ] **Verification:** The application URL is loading the new version.
- [ ] **Health Check:** Post-deployment health checks have been run and all services report as operational.
- [ ] **Testing:** A key user journey (e.g., SKTM request) has been manually tested in the production environment.
- [ ] **Communication:** An "all-clear" message has been sent to users, ending the maintenance window.