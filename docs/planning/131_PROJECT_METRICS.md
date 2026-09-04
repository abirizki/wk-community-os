# WK Community OS - v1.0.0 Project Metrics

**Date:** 2026-07-29  
**Version:** 1.0.0  
**Status:** BASELINE ESTABLISHED

---

This document provides a quantitative snapshot of the project at the official close of Phase 1.

| Metric                  | Value                  | Notes                                        |
| ----------------------- | ---------------------- | -------------------------------------------- |
| **Application**         |                        |                                              |
| Application Version     | `1.0.0`                | Official version for Phase 1 closure.        |
| Number of JS/GS Files   | `~30`                  | Estimated count in `src/`.                   |
| Number of HTML Files    | `~5`                   | Estimated count for UI views.                |
| Number of Modules       | `5`                    | Citizen, Family, Letter, Dashboard, Approval |
| Number of Controllers   | `5`                    | One per module.                              |
| Number of Services      | `5`                    | One per module.                              |
| Number of Repositories  | `5`                    | One per module.                              |
|                         |                        |                                              |
| **DevOps & Docs**       |                        |                                              |
| Number of Scripts       | `7`                    | doctor, version, backup, deploy, restore, smoketest, release |
| Documentation Files     | `10+`                  | Core `.md` files plus new release docs.      |
| Release Documents       | `4`                    | 129, 130, 131, 132                           |
|                         |                        |                                              |
| **Testing**             |                        |                                              |
| Framework Tests         | `0`                    | No formal unit test framework integrated.    |
| Integration Tests       | `0`                    | No automated integration tests.              |
| RC Validator            | `smoketest.sh`         | Post-deployment structural verification.     |
|                         |                        |                                              |
| **Repository**          |                        |                                              |
| Git Tag                 | `v1.0.0`               | Official release tag.                        |
| Git Branch              | `develop`              | Main development branch for Phase 1.         |
| Deployment Environment  | `DEVELOPMENT`          | Based on `WK_DEV` folder convention.         |
|                         |                        |                                              |
| **Quality**             |                        |                                              |
| Known Issues            | `2`                    | See below.                                   |
| Technical Debt          | `3`                    | See below.                                   |

### Known Issues & Technical Debt

1.  **[Issue]** Deployment scripts require interactive confirmation, preventing fully automated CI/CD.
2.  **[Issue]** A failed `clasp push` during a restore operation leaves the remote environment in a stale state.
3.  **[Debt]** Lack of a unit testing framework (e.g., QUnit) for Apps Script.
4.  **[Debt]** No automated API-level testing to validate controller and service logic post-deployment.
5.  **[Debt]** `scriptId` is parsed from `.clasp.json` using `grep`, which is fragile. Should use `jq` if available.