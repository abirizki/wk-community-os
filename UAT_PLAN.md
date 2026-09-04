# WK Community OS - User Acceptance Test (UAT) Plan

**Document ID:** UAT-01
**Version:** 1.0
**Date:** 2026-08-05
**Project:** WK Community OS - Kebonjati Pilot

---

## 1. Introduction

This document outlines the plan for the User Acceptance Test (UAT) for the WK Community OS pilot at Kelurahan Kebonjati. The purpose of UAT is to provide a final opportunity for end-users and stakeholders to validate the system against their business requirements in a production-like environment before giving their formal approval ("sign-off").

## 2. Objectives

*   To confirm that the system's core workflows (Letter, Complaint, etc.) meet the operational needs of Kelurahan Kebonjati.
*   To verify that the system is intuitive and usable for all designated user roles (Citizen, RT, RW, Kelurahan Staff).
*   To identify any critical bugs or showstoppers that would prevent a successful Go-Live.
*   To obtain formal sign-off from key stakeholders, signifying their acceptance of the system for production rollout.

## 3. Scope

The scope of this UAT is identical to the pilot scope, focusing on the following modules and workflows:

*   **User Management:** Logging in and viewing role-specific dashboards.
*   **Letter Service:** End-to-end creation and approval of a "Surat Pengantar".
*   **Complaint Service:** End-to-end submission and resolution of a public complaint.
*   **Notifications:** Verification of in-app notifications for status changes.
*   **Dashboards & Analytics:** Verification of key data points and metrics on dashboards.

All other modules are considered out of scope for this UAT.

## 4. Schedule & Participants

*   **Duration:** 3 Days
*   **Day 1:** UAT Briefing & Execution (Letter & Approval Scenarios)
*   **Day 2:** UAT Execution (Complaint, Notification, Dashboard Scenarios)
*   **Day 3:** Bug Review, Final Feedback Session, and Sign-off

| Role | Participant(s) | Responsibility |
| :--- | :--- | :--- |
| **UAT Testers** | Lurah, Kelurahan Coordinator, 1 RW Head, 1 RT Head, 2 Citizens | Execute the test scenarios defined in `UAT_SCENARIO.md`. |
| **UAT Facilitator**| Project Manager, Trainer | Guide the testers through the scenarios, answer questions, and collect feedback. |
| **Technical Support**| Technical Lead, Developer | Be on standby to investigate and address any critical issues that arise. |

## 5. Test Procedure

1.  **Briefing:** The UAT Facilitator will provide a 30-minute overview of the UAT process, objectives, and how to report issues.
2.  **Execution:** Testers will be given access to the pilot environment and a copy of the `UAT_SCENARIO.md`. They will follow the steps for each scenario and record the outcome (Pass/Fail) on the `UAT_ACCEPTANCE_CHECKLIST.md`.
3.  **Issue Reporting:** Any deviations from the expected results must be documented using the `UAT_BUG_REPORT_TEMPLATE.md` and submitted to the facilitator.
4.  **Daily Debrief:** A short meeting will be held at the end of Day 1 and Day 2 to discuss findings.

## 6. Success Criteria

The UAT will be considered successful if:

*   All test scenarios are completed.
*   No "Critical" or "High" severity bugs are outstanding at the end of the UAT period.
*   The key stakeholders provide their signature on the `UAT_SIGN_OFF_FORM.md`.