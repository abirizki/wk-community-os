# PBB Package

**Version:** 1.0.0
**Author:** Gemini Code Assist
**Generated:** 2026-08-03

## 1. Overview

The PBB (Pajak Bumi dan Bangunan - Land and Building Tax) package provides a comprehensive system for managing land and building tax administration within the WK Community OS. It enables the registration of tax objects (NOP), taxpayers, issuance of SPPT (Tax Due Notification Letter), tracking of payment statuses, billing history, and monitoring of arrears.

## 2. Scope

-   **Tax Object (NOP) Registry:** Manages the registration and details of land and building tax objects.
-   **Taxpayer Registry:** Links citizens to their roles as taxpayers for specific tax objects.
-   **SPPT Management:** Handles the issuance, distribution, and status tracking of SPPT documents.
-   **Payment Tracking:** Records and monitors the payment status and history for each SPPT.
-   **Arrears Monitoring:** Identifies and tracks overdue tax payments to facilitate follow-up actions.
-   **Statistics & Reporting:** Provides aggregated data for tax revenue, compliance rates, and arrears analysis.

## 3. Architecture

This package follows the standard WK Enterprise Architecture. It introduces several key entities:

*   **`TaxObjectEntity`**: Represents a unique Nomor Objek Pajak (NOP) with its associated land and building details.
*   **`TaxpayerEntity`**: Links a `Citizen` to their role as a PBB taxpayer.
*   **`SPPTEntity`**: Represents a Surat Pemberitahuan Pajak Terutang (SPPT) for a specific tax year, tax object, and taxpayer.
*   **`PaymentHistoryEntity`**: Records individual payment transactions for an SPPT.

The `PBBService` orchestrates all business logic, interacting with various repositories. It publishes events like `PBB.SPPT.Issued` and `PBB.Payment.Recorded` to the `EventBus`, allowing other packages like `Analytics` and `Notification` to react accordingly. Workflows can be initiated for arrears collection or SPPT issuance approvals.

## 4. Key Dependencies

*   **Core & System:** For base services, user context, and permissions.
*   **Citizen:** All taxpayer data is fundamentally linked to a specific citizen record.
*   **Household:** To understand the residential context of tax objects.
*   **Workflow:** For processes like SPPT issuance approval or arrears follow-up.
*   **Notification:** To send payment reminders, SPPT notifications, or arrears alerts.
*   **Analytics & Dashboard:** Crucial for monitoring tax revenue, compliance, and arrears KPIs.

## 5. Goal

To digitize the PBB administration process, improving efficiency in tax collection, enhancing transparency for citizens, and providing local government with data-driven insights to optimize revenue management and reduce arrears.