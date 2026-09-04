# WK Community OS - v1.0.0 Architecture Baseline

**Version:** 1.0.0  
**Status:** FROZEN

---

## 1. Architecture Diagram

The WK Community OS v1.0.0 follows a classic 3-tier service-oriented architecture.

```
[Google Apps Script UI / Client]
           |
           v
      [Router.gs]
           |
           v
-------------------------
|   Controller Layer    | (e.g., CitizenController.gs)
-------------------------
           |
           v
-------------------------
|     Service Layer     | (e.g., CitizenService.gs)
-------------------------
           |
           v
-------------------------
|   Repository Layer    | (e.g., CitizenRepository.gs)
-------------------------
           |
           v
 [DatabaseAdapter.gs] -> [SpreadsheetDriver.gs / MockDriver.gs]
           |
           v
    [Google Sheets]
```

## 2. Layers

### 2.1. Controller Layer
**Responsibility:** To handle incoming requests from the Router. It is responsible for input validation and sanitation. It calls the appropriate Service Layer methods and formats the response to be sent back to the client. It contains no business logic.

### 2.2. Service Layer
**Responsibility:** To contain all business logic. It orchestrates calls to one or more Repository Layer methods to fulfill a business use case. It handles data manipulation, calculations, and business rule enforcement.

### 2.3. Repository Layer
**Responsibility:** To handle data access and persistence. It interacts directly with the `DatabaseAdapter` to perform CRUD (Create, Read, Update, Delete) operations. It knows *what* data to fetch but not *how* it is stored.

## 3. Core Components

- **Router:** A centralized entry point that maps URL parameters or request bodies to specific Controller methods.
- **Database Adapter:** A generic interface defining data access methods (e.g., `findById`, `findAll`, `save`).
- **Spreadsheet Driver:** A concrete implementation of the Database Adapter that interacts with Google Sheets.
- **Mock Driver:** A concrete implementation of the Database Adapter that uses in-memory arrays for testing.
- **Dashboard:** The primary UI module for data visualization.
- **Authentication:** A service responsible for managing user sessions and access control.

## 4. Business Modules

- **Citizen:** Manages individual citizen data.
- **Family:** Manages family/household data and relationships.
- **Letter:** Manages the generation and tracking of official letters.
- **Approval:** Manages multi-step approval workflows for letters and other requests.

## 5. Dependencies

- **Platform:** Google Apps Script (V8 Runtime)
- **Deployment:** Google CLASP
- **Environment:** Node.js, npm, Git + Git Bash (Windows)

## 6. Folder Structure

The project follows a standardized folder structure to ensure consistency.

```
WK_DEV/
│
├── src/                  # All .js and .gs source code
├── docs/                 # Project documentation
├── tests/                # Test files
├── release/              # Release artifacts
├── assets/               # Static assets (images, css)
├── scripts/              # DevOps shell scripts
├── backups/              # (Generated) Project backups
│
├── appsscript.json       # Google Apps Script manifest
├── .clasp.json           # CLASP configuration
└── README.md
```

## 7. Coding Standards

- All code must be written in modular functions with clear, single responsibilities.
- All functions must be documented with JSDoc-style comments explaining their purpose, parameters, and return values.
- Global variables should be avoided; use dependency injection or function parameters.

## 8. Naming Convention

- **Controllers:** `[ModuleName]Controller.js` (e.g., `CitizenController.js`)
- **Services:** `[ModuleName]Service.js` (e.g., `CitizenService.js`)
- **Repositories:** `[ModuleName]Repository.js` (e.g., `CitizenRepository.js`)

## 9. Version Policy

The project adheres to **Semantic Versioning (SemVer)**. All releases will follow the `MAJOR.MINOR.PATCH` format.

## 10. Release Policy

All releases to any environment MUST be executed using the `scripts/release.sh` orchestrator. No manual deployments are permitted. This ensures that all health checks, backups, and verifications are performed consistently.

## 11. DevOps Workflow

```
START (scripts/release.sh)
  ↓
doctor.sh
  ↓ (PASS)
version.sh
  ↓
backup.sh
  ↓ (PASS)
deploy.sh
  ↓ (PASS)
smoketest.sh
  ↓ (PASS)
SUCCESS

(On smoketest.sh FAIL -> Prompt for restore.sh)
```

## 12. Architecture Freeze Statement

As of Sprint P116, the architecture, components, policies, and workflows described in this document for **WK Community OS version 1.0.0** are hereby declared **FROZEN**. No breaking changes to this baseline architecture are permitted within the v1.x lifecycle. All future development in Phase 2 will build upon this stable foundation.