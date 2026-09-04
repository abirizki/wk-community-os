# Health Package

**Version:** 1.0.0
**Author:** Gemini Code Assist
**Generated:** 2026-08-07

## 1. Overview

The `Health` package is a foundational component of the `CommunityHealth` domain. It establishes and manages the core **Health Profile** for every citizen within the WK Community OS. This package acts as the central repository for a citizen's fundamental health information, serving as the single source of truth for all other specialized health packages (like `Pregnancy`, `Immunization`, `MedicalRecord`, etc.).

The primary entity managed by this package is the `HealthProfile`, which is directly linked to a `Citizen` entity.

## 2. Architectural Principles

*   **Single Source of Truth:** The `HealthProfile` is the definitive record for a citizen's core health data. Other domains or packages must read from this source and not create duplicate health profiles.
*   **Citizen-Centric:** Every `HealthProfile` is intrinsically linked to a single `Citizen`. The lifecycle of a health profile is managed in conjunction with the citizen's record.
*   **Event-Driven Integration:** The package listens to events from the `Citizen` package (e.g., `Citizen.Created`) to automatically provision a new, empty `HealthProfile` for every new citizen, ensuring data consistency from the outset.
*   **Service-Oriented:** All interactions with a `HealthProfile` must go through the `HealthService`. Direct repository access from outside this package is strictly forbidden.

## 3. Core Features

This package manages the following key attributes of a citizen's health profile:

*   **Citizen Health Profile:** The core container for all health data.
*   **Blood Type:** Manages the citizen's blood type (e.g., A, B, AB, O) and rhesus factor (+/-).
*   **Disease History:** A recorded list of significant past or chronic illnesses.
*   **Allergies:** A recorded list of known allergies (e.g., to medicine, food).
*   **Disabilities:** A recorded list of any physical or mental disabilities.
*   **Medical Notes:** General-purpose, timestamped notes added by healthcare professionals.
*   **Health Status:** A general indicator of the citizen's current health condition (e.g., Good, Under Observation).

## 4. Related Features (Managed by Other Packages)

While the `Health` package provides the core profile, more specific and transactional data is managed by other dedicated packages that build upon this one:

*   **Medical Visits & History:** Managed by `HealthVisit`.
*   **Referrals:** Managed by `Referral`.
*   **Medicine History:** Managed by `Medicine`.
*   **Medical Certificates:** Managed by `MedicalRecord`.

## 5. How It Works

1.  **Provisioning:** When a new citizen is created in the `CommunityAdministration` domain, a `Citizen.Created` event is published to the `EventBus`.
2.  **Subscription:** The `HealthService` subscribes to this event.
3.  **Creation:** Upon receiving the event, the `HealthService` automatically creates a new, default `HealthProfile` record and links it to the new citizen's ID.
4.  **Management:** A healthcare professional (e.g., a doctor or a nurse at a Posyandu) uses a UI to access a citizen's profile. They call the `HealthController` endpoints to update information like allergies or disease history.
5.  **Auditing:** Every change made to the `HealthProfile` via the `HealthService` is automatically logged, creating a complete and immutable audit trail of the citizen's health record history.

## 6. Goal

To establish a robust, secure, and centralized health profile for every citizen, providing a reliable foundation for all other health-related services and modules within the WK Community OS.