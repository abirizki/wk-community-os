# Audit Architecture

This document describes the architecture of the auditing system within WK Community OS.

---

## 1. Core Principle: Event Sourcing

The audit system is built on the principle of **event sourcing**. Instead of services directly writing to an audit log, they publish events to the central `EventBus`. The `AuditLogService` is a dedicated subscriber that listens to **all** events (`*`) and is solely responsible for translating these events into a permanent, immutable audit trail.

This approach provides several advantages:
*   **Decoupling:** Business logic in services like `LetterService` or `ComplaintService` is not cluttered with audit logging code. They only need to publish a business event.
*   **Centralization:** All audit logic is centralized in the `AuditLogService`, making it easy to manage, update, and secure.
*   **Completeness:** By subscribing to all events, the system ensures that no significant action is missed.
*   **Resilience:** If the `AuditLogService` fails to write a log, it does not stop the original business transaction. The event remains in the queue for reprocessing.

## 2. Data Flow

1.  A **Business Service** (e.g., `ComplaintService`) performs an action (e.g., `resolveComplaint`).
2.  The service publishes a specific, descriptive event to the **EventBus** (e.g., `Complaint.Resolved`). The event payload contains all relevant data, including the user who performed the action, the entity ID, and the data that was changed.
3.  The **EventBus** dispatches this event to all subscribers.
4.  The **AuditLogService**, being a subscriber to `*`, receives the `Complaint.Resolved` event.
5.  The `AuditLogService` transforms the `EventEntity` into an `AuditLog` record, capturing the timestamp, user, IP address, action type, module, entity ID, and a snapshot of the event payload.
6.  The `AuditLogService` writes this record to the `audit_logs` database table.

## 3. Audit Record Structure

Each record in the `audit_logs` table contains the following fields:

*   `id`: Unique ID for the log entry.
*   `timestamp`: ISO 8601 timestamp of when the event occurred.
*   `userId`: The ID of the user who initiated the action.
*   `userRole`: The role of the user at the time of the action.
*   `ipAddress`: The source IP address of the request.
*   `action`: The event type (e.g., `Citizen.Created`, `Letter.Approved`).
*   `module`: The name of the package that published the event.
*   `entityId`: The ID of the business entity that was affected.
*   `details`: A JSON object containing the full event payload, including `oldValue` and `newValue` where applicable.