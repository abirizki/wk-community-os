# Subscription & License Management Guide

This guide explains how to use the services in the SaaS package to manage tenant subscriptions and licenses.

---

## 1. Core Services

*   **`SubscriptionManager`:** Manages the subscription plan associated with a tenant, including its start and end dates.
*   **`LicenseManager`:** Enforces the limits of a subscription plan (e.g., maximum number of users).

## 2. Creating a New Subscription

When a new tenant is onboarded, an administrator must create a subscription for them.

```javascript
function setupNewTenantSubscription() {
  const tenantId = '...'; // The ID of the new tenant
  const planId = 'STANDARD'; // e.g., 'FREE', 'STANDARD', 'PREMIUM'
  const startDate = new Date().toISOString();
  const endDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(); // 1 year from now

  const subManager = WK.service('saas.subscriptionManager');
  subManager.createSubscription(tenantId, planId, startDate, endDate);
}
```

## 3. Checking License Compliance

Before performing an action that is subject to license limits (like creating a new user), you must check with the `LicenseManager`.

```javascript
function createNewUserForTenant(tenantId, userData) {
  const licenseManager = WK.service('saas.licenseManager');
  if (!licenseManager.canAddUser(tenantId)) {
    throw new Error('User limit for the current subscription plan has been reached.');
  }
  
  // ... proceed to create the user via the SystemService ...
}
```

## 4. Checking Subscription Status

To verify if a tenant's account is active and paid for, use the `isSubscriptionActive` method. This can be used in a middleware to block access to the system for tenants with expired or canceled subscriptions.

```javascript
function checkAccess(tenantId) {
  const subManager = WK.service('saas.subscriptionManager');
  if (!subManager.isSubscriptionActive(tenantId)) {
    // Redirect to a "Subscription Expired" page
    throw new Error('Access denied. The subscription for this account is not active.');
  }
}
```