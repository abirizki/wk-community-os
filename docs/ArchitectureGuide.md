# Template Architecture Guide

This document outlines the architectural decisions embedded within the templates.

---

The templates enforce the standard WK Enterprise Architecture:

*   **Controller -> Service -> Repository:** This layered pattern is the default for all business packages.
*   **Event-Driven:** Service templates include stubs for publishing events to the `EventBus`, encouraging decoupled design.
*   **Security First:** All controller and service methods include stubs for `WK.security().checkPermission()`, ensuring that security is considered from the start.
*   **Auditable:** The use of the `EventBus` ensures that all actions are implicitly available to the `AuditLogService`.