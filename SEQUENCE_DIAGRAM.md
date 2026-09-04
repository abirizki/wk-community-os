# Sequence Diagram: Letter Request Workflow

**Report ID:** VER-SEQ-001
**Date:** 2026-08-07
**Project:** WK Community OS Enterprise Edition v1.0

---

## 1. Objective

This diagram illustrates the sequence of interactions for the most common cross-domain workflow: a citizen requesting a letter and the subsequent approval and notification process.

## 2. Mermaid Sequence Diagram

```mermaid
sequenceDiagram
    actor User
    participant API as API Gateway
    participant Letter as LetterService
    participant Workflow as WorkflowService
    participant EventBus
    participant Notification as NotificationService
    participant Analytics as AnalyticsService

    User->>+API: POST /api/letter/request
    API->>+Letter: createRequest(payload)
    
    Letter->>Letter: Create LetterEntity (status: PENDING_RT)
    Letter->>+Workflow: start("LETTER_APPROVAL", letter)
    
    Workflow->>Workflow: Create WorkflowInstance
    Workflow->>EventBus: publish(Workflow.Task.Created)
    Workflow-->>-Letter: { workflowId: "..." }
    
    Letter-->>-API: { success: true, letterId: "..." }
    API-->>-User: 201 Created

    par
        EventBus-->>+Notification: on(Workflow.Task.Created)
        Notification->>Notification: Send "New Task" notification to RT
        Notification-->>-EventBus:
    and
        EventBus-->>+Analytics: on(Workflow.Task.Created)
        Analytics->>Analytics: Increment "PendingLetters" metric
        Analytics-->>-EventBus:
    end

```

## 3. Conclusion

The sequence demonstrates a robust, event-driven architecture. The `LetterService` is only responsible for its core task and correctly delegates orchestration to the `WorkflowService`. The `EventBus` successfully decouples the `Notification` and `Analytics` services from the core business logic, allowing for scalable and maintainable side-effects.

**Final Status: PASS**