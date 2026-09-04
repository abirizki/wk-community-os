# Notification Package

**Version:** 1.0.0
**Author:** Gemini Code Assist

## 1. Overview

The Notification package is the unified communication center for the WK Community OS. It is responsible for generating, queuing, and delivering notifications to users through various channels based on system events and user preferences.

This package acts as a primary subscriber to the `EventBus`. When a significant business event occurs (e.g., `Letter.Approved`, `Complaint.Resolved`), this package automatically generates a user-friendly notification and ensures its delivery.

## 2. Scope

-   **Multi-Channel Delivery:** Provides abstractions for delivering notifications via an in-app Inbox, Push Notifications, Email, WhatsApp, and SMS.
-   **Event-Driven Notifications:** Subscribes to the master `EventBus` to automatically generate notifications from system events.
-   **Targeted & Broadcast Messaging:** Supports sending notifications to individual users, specific roles (e.g., all RTs in an RW), or broadcasting to entire communities.
-   **Queueing & Scheduling:** Implements a robust queueing system to manage notification delivery, ensuring reliability and handling retries for failed sends.
-   **User Preferences:** Allows users to configure how and for what events they wish to be notified.
-   **Templates:** Uses a templating engine to create consistent and translatable notification messages.

## 3. Architecture

The Notification package is primarily event-driven and queue-based.

```ascii
 +----------+   (1. Event)   +---------------------+   (2. Create Notif)   +-----------------------+
 | EventBus |  ---------->   | NotificationService |  ----------------->   | NotificationTemplate  |
 +----------+                | (Subscriber)        |                       +-----------------------+
                           +---------------------+
                                     | (3. Enqueue)
                                     v
 +---------------------+   (4. Dequeue)   +---------------------+
 | NotificationQueue   |  <----------   | NotificationScheduler |
 +---------------------+                +---------------------+
           ^                                    | (5. Get Channel & Send)
           | (7. DLQ on fail)                    v
           +------------------   +-------------------------+
                              |   |   NotificationChannel   |
                              |   | (Email, Push, Inbox...) |
                              +-> +-------------------------+
```

1.  The **EventBus** fires an event (e.g., `Workflow.Completed`).
2.  The **NotificationService**, acting as a subscriber, catches the event and uses the **NotificationTemplate** service to generate the message content.
3.  The generated notification is pushed into the **NotificationQueue**.
4.  The **NotificationScheduler** (run by a time-based trigger) dequeues a pending notification.
5.  The scheduler determines the correct **NotificationChannel** (e.g., `EmailService`, `PushService`) based on user preferences.
6.  The channel's `send()` method is called to deliver the notification.
7.  If delivery fails after multiple retries, the notification is moved to a Dead Letter Queue (DLQ).

## 4. Key Dependencies

-   **Core Platform:** Utilizes `Logger`, `Audit`, and `CacheService` (for queueing).
-   **System Package:** Depends on `User`, `Role`, and `Session` to identify recipients.
-   **EventBus Package:** This is the primary trigger for most notifications. The `NotificationService` is a major subscriber to system-wide events.
-   **Citizen & Household Packages:** Used to resolve target audiences for broadcasts (e.g., all households in RT 001).

## 5. Goal

This package aims to create a single, reliable, and extensible system for all user-facing communication. By decoupling the *trigger* of a notification (the event) from the *delivery* (the channel), it allows the platform to easily add new communication channels (like Telegram) in the future without changing any of the core business logic in other modules.