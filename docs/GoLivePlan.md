# Go-Live Plan

This document outlines the high-level plan for transitioning the WK Community OS from a successful pilot to a full production go-live for all of Kelurahan Kebonjati.

---

## Phase 1: Pre-Go-Live (1 Week)

*   **Final Code Freeze:** No new features will be added. Only critical bug fixes from the pilot will be merged.
*   **Setup Production Environment:**
    *   Create a new, clean Google Apps Script project for production.
    *   Configure all production-level script properties (folder IDs, secret keys).
*   **Data Migration Strategy:**
    *   Finalize the plan for migrating existing, real citizen and household data from the Kelurahan's current records into the system. This may involve a one-time CSV import script.
*   **Final User Training Plan:** Develop a training plan and schedule for all RTs, RWs, and staff who were not part of the pilot.

## Phase 2: Go-Live Weekend

*   **Friday PM:**
    *   **Final Production Backup:** Perform a final backup of the empty production environment.
    *   **Data Migration:** Execute the data migration scripts to populate the production environment with real data.
    *   **Data Verification:** Manually verify a sample of the migrated data for accuracy.
*   **Saturday:**
    *   **Final Deployment:** Deploy the final, tested code to the production environment.
    *   **Final Health Check:** Run all health checks and verification scripts on the production environment.
*   **Sunday:**
    *   **Final Smoke Test:** A small team performs end-to-end tests on the live production environment.

## Phase 3: Post-Go-Live (First 2 Weeks)

*   **Monday AM:** **Official Go-Live.** Announce to all users that the system is live.
*   **Hypercare Support:** The project team provides on-site and dedicated remote support for the first two weeks to handle any issues and assist users.
*   **Daily Monitoring:** Closely monitor system logs and performance.
*   **Initial Feedback:** Gather initial feedback from the wider user base.