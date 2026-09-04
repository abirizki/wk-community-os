# Multi-Tenancy Architecture Guide

This guide explains the technical implementation of multi-tenancy in the WK Community OS. Adherence to these principles is critical for maintaining data security and isolation between tenants.

---

## 1. Core Concept: Automatic Tenant Scoping

The system's multi-tenancy is built on the principle of **automatic query scoping**. This means that individual services (like `LetterService`, `ComplaintService`) do **not** need to be aware of the current tenant. They make generic data requests, and the core data layer automatically filters the results for the currently active tenant.

This prevents accidental data leakage and simplifies development, as business logic does not need to be polluted with tenant-filtering code.

## 2. Data Flow for Tenant Isolation

1.  **Tenant Identification:** An incoming request (e.g., to the web app URL) must first be resolved to a specific tenant. This is typically handled by a middleware or an API gateway that inspects the request's hostname (e.g., `kelurahan-a.wargakita.com` maps to `tenant_id_A`).

2.  **Set Tenant Context:** Once the tenant is identified, the `TenantManager.setCurrentTenant(tenantId)` method is called at the very beginning of the request lifecycle. This stores the `tenantId` in the user's session.

3.  **Database Adapter Modification:** The core `dbAdapter` (part of the `Core` package) must be modified to be tenant-aware. Before any `findAll`, `findOne`, `update`, `delete`, or `count` operation is executed, the adapter must:
    a. Retrieve the current tenant ID using `WK.service('saas.tenantManager').getCurrentTenantId()`.
    b. If a `tenantId` exists in the session, automatically inject it into the query's filter criteria (e.g., as `AND tenantId = '...'`).
    c. If no `tenantId` is found in the session, the query **must fail** with an error to prevent unscoped data access (except for a few system-level tables like `tenants` itself).

4.  **Data Schema Modification:** To support this, **every data table** that contains tenant-specific data (e.g., `citizens`, `households`, `letters`, `complaints`, `users`) **must have a `tenantId` column**. This column should be indexed for performance.

## 3. Example Implementation (Conceptual)

### Modified `dbAdapter.findAll`

```javascript
// Inside the core dbAdapter
findAll(query = {}, options = {}) {
  const tenantId = WK.service('saas.tenantManager').getCurrentTenantId();

  // For system tables that are not tenant-scoped
  const isSystemTable = ['tenants', 'subscriptions'].includes(this.tableName);

  if (!tenantId && !isSystemTable) {
    throw new Error(`Security Error: Attempted to access table '${this.tableName}' without a tenant context.`);
  }

  // Automatically add the tenantId to the query
  const scopedQuery = { ...query };
  if (tenantId && !isSystemTable) {
    scopedQuery.tenantId = tenantId;
  }

  // ... proceed with executing the scopedQuery against the database ...
}
```

By implementing this logic at the lowest level of the data access layer, the entire application becomes multi-tenant capable without requiring changes to the individual business service classes.