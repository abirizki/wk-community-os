# Pilot Rollback Plan

This document outlines the contingency plan to be executed in the event of a critical failure during the pilot program that necessitates halting the pilot and reverting to previous operational methods.

---

## 1. Trigger Conditions

A rollback will be considered if one or more of the following occurs:

*   A critical, un-patchable bug is discovered that prevents the completion of core workflows (Letter or Complaint).
*   System-wide data corruption is detected.
*   The system is unavailable for more than 24 consecutive hours due to a platform or application issue.

## 2. Rollback Steps

1.  **Communication:** Immediately inform all pilot participants and stakeholders that the pilot is being suspended and that all service requests should revert to the previous manual process.
2.  **Disable Access:** Change the web app deployment settings to restrict access, effectively taking the system offline for pilot users.
3.  **Preserve Data:** Create a final, full backup of the pilot environment's state for post-mortem analysis. Do not delete any data.
4.  **Root Cause Analysis (RCA):** The technical team will conduct a full investigation into the cause of the critical failure.
5.  **Report to Stakeholders:** Present the findings of the RCA to stakeholders with a recommendation on whether the pilot can be restarted after a fix or should be postponed indefinitely.

## 3. Post-Rollback

*   All official letter and complaint requests will be handled manually (paper-based or existing method) until a decision is made to restart the pilot.