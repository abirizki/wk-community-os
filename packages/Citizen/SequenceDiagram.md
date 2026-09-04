# SKTM Service - Sequence Diagram

This diagram illustrates the technical interactions between different services and packages during the SKTM approval process.

```mermaid
sequenceDiagram
    actor Citizen
    participant UI as Citizen Portal
    participant LetterController
    participant LetterService
    participant WorkflowService
    participant EventBus
    participant NotificationService
    participant PDFService

    Citizen->>+UI: Fills & Submits SKTM Form
    UI->>+LetterController: create(requestData)
    LetterController->>+LetterService: requestLetter(data)
    LetterService->>+WorkflowService: startWorkflow("LETTER_APPROVAL", letterId, ...)
    WorkflowService-->>-LetterService: workflowInstance
    LetterService->>+EventBus: publish("Letter.Requested", payload)
    EventBus-->>-LetterService: (ack)
    LetterService-->>-LetterController: newLetter
    LetterController-->>-UI: { success: true, data: newLetter }
    UI-->>-Citizen: Shows Success & Tracking Number

    %% Notification to RT
    EventBus->>+NotificationService: handleEvent("Letter.Requested")
    NotificationService-->>EventBus: (ack)
    Note over NotificationService: Generates & queues notification for RT

    %% RT Approval
    actor RT
    RT->>+UI: Clicks "Approve" on Budi's request
    UI->>+LetterController: approve(letterId)
    LetterController->>+LetterService: approveLetter(letterId)
    LetterService->>+WorkflowService: processAction(workflowId, "APPROVE")
    WorkflowService->>+EventBus: publish("Workflow.StateChanged", { newState: "APPROVED_RT" })
    EventBus-->>-WorkflowService: (ack)
    WorkflowService-->>-LetterService: updatedWorkflow
    LetterService-->>-LetterController: updatedLetter
    Controller-->>-UI: { success: true }
    UI-->>-RT: Shows "Approved" status

    %% Notification to RW
    EventBus->>+NotificationService: handleEvent("Workflow.StateChanged")
    NotificationService-->>EventBus: (ack)
    Note over NotificationService: Generates & queues notification for RW

    %% RW Approval (similar to RT, details omitted for brevity)
    actor RW
    RW->>+UI: Clicks "Approve"

    %% Kelurahan Finalization
    actor Kelurahan
    Kelurahan->>+UI: Clicks "Approve & Issue"
    UI->>+LetterController: approve(letterId)
    LetterController->>+LetterService: approveLetter(letterId)
    Note over LetterService: Final approval state detected
    LetterService->>LetterService: _finalizeLetter(letter)
    LetterService->>+PDFService: generateFromTemplate(...)
    PDFService-->>-LetterService: pdfFileId
    LetterService->>+EventBus: publish("Letter.Completed", payload)
    EventBus-->>-LetterService: (ack)
    LetterService-->>-LetterController: completedLetter
    Controller-->>-UI: { success: true, data: completedLetter }
    UI-->>-Kelurahan: Shows "Completed" status

    %% Final Notification to Citizen
    EventBus->>+NotificationService: handleEvent("Letter.Completed")
    NotificationService-->>EventBus: (ack)
    Note over NotificationService: Generates & queues "Your letter is ready" notification
```