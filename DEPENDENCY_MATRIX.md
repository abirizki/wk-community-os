# Static Dependency Matrix

**Report ID:** VER-DEP-001
**Date:** 2026-08-07
**Project:** WK Community OS Enterprise Edition v1.0

---

## 1. Objective

This matrix documents the static, compile-time dependencies between key enterprise packages as defined in their respective `module.json` files. It is used to verify architectural layering and prevent illegal dependencies.

## 2. Dependency Matrix

| ↓ Depends On → | Core | System | Kernel | EventBus | Workflow | Analytics | Monitoring | Security | Config |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Kernel** | X | | | | | | | | |
| **System** | X | | | | | | | | |
| **EventBus** | X | | X | | | | | | |
| **Workflow** | X | X | | X | | | | | |
| **Notification** | X | X | | X | X | | | | |
| **Analytics** | X | | | X | | | | | |
| **MonitoringCenter** | X | X | X | X | X | X | | | |
| **SecurityCenter** | X | X | | X | | | | | X |
| **ReleaseCenter** | X | X | X | | | | X | | |
| **(Business Domains)** | X | X | | X | X | X | | | |

---

## 3. Conclusion

The static dependency graph is clean and adheres to the principles of a layered architecture. There are no circular dependencies among the core packages. Business domains correctly depend on foundational and operational services, but not on each other, ensuring proper decoupling.

**Final Status: PASS**