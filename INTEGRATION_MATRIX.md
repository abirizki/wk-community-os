# Domain & Package Integration Matrix

**Report ID:** VER-INT-001
**Date:** 2026-08-07
**Project:** WK Community OS Enterprise Edition v1.0

---

## 1. Objective

This matrix documents the key runtime interactions between different domains and packages within the WK Community OS. It illustrates how components communicate, whether through direct service calls, the event bus, or data reads.

## 2. Integration Matrix

| From | To | Mechanism | Description |
| :--- | :--- | :--- | :--- |
| **Citizen** | Household | `EventBus` | Publishes `Citizen.Created` event, which `HouseholdService` subscribes to for creating new households. |
| **Citizen** | Community Health | `Data Read` | `CommunityHealthService` reads citizen data for patient registration. |
| **Citizen** | Community Education | `Data Read` | `CommunityEducationService` reads citizen data for student enrollment. |
| **Citizen** | Community Economy | `Data Read` | `CommunityEconomyService` reads citizen data for tax and aid eligibility. |
| **Letter** | Workflow | `Service Call` | `LetterService` calls `WorkflowService.start()` to initiate the approval process. |
| **Complaint** | Workflow | `Service Call` | `ComplaintService` calls `WorkflowService.start()` to initiate the resolution process. |
| **Workflow** | Notification | `EventBus` | `WorkflowService` publishes `Workflow.Task.Created` events. `NotificationService` subscribes to this to alert users. |
| **Workflow** | Audit | `EventBus` | `WorkflowService` publishes `Workflow.State.Changed` events, which are captured by the audit log. |
| **(All Domains)** | Analytics | `EventBus` | All major services (Letter, Complaint, Health, etc.) publish creation/update events. `AnalyticsService` subscribes to these to aggregate data. |
| **Analytics** | Dashboard | `Data Read` | Dashboard widgets are populated by making data source calls to the `AnalyticsService`. |
| **(All Packages)** | SecurityCenter | `Service Call` | All services use `WK.security().checkPermission()` before executing actions. |
| **(All Packages)** | ConfigurationCenter | `Service Call` | All services use `WK.config()` to retrieve configuration parameters. |

---

## 3. Conclusion

The integration patterns are consistent and robust.

*   **Decoupling:** The use of the `EventBus` for cross-domain notifications is effectively implemented, preventing tight coupling between business domains.
*   **Orchestration:** The `Workflow` package is correctly used as the central orchestrator for multi-step business processes like approvals.
*   **Governance:** `SecurityCenter` and `ConfigurationCenter` are correctly integrated as foundational governance layers for all packages.

**Final Status: PASS**