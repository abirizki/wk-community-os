# Feature Flag Guide

This guide explains how to use the `FeatureFlagService` to control access to features based on a tenant's subscription plan.

---

## 1. Overview

Feature flags (or feature gating) allow you to deploy code for new features to production but keep them hidden from users until you are ready to release them. In our SaaS architecture, it also allows us to offer different features to different subscription tiers.

The `FeatureFlagService` is the central authority for checking if a feature is enabled for the current tenant.

## 2. Defining Features

Feature entitlements are defined in the `_loadPlanFeatures` method within `FeatureFlagService.js`. Each plan (`FREE`, `STANDARD`, etc.) is assigned an array of feature strings.

```javascript
// From FeatureFlagService.js
_loadPlanFeatures() {
  return {
    'STANDARD': ['LETTER_SERVICE', 'COMPLAINT_SERVICE'],
    'PREMIUM': ['LETTER_SERVICE', 'COMPLAINT_SERVICE', 'ANALYTICS', 'GOVERNANCE'],
    // ...
  };
}
```

## 3. Using the Service

Before executing the logic for a gated feature, you must check if it's enabled for the current tenant. This check should happen as early as possible, typically in the **Controller** layer.

```javascript
// Example from a hypothetical ComplaintController.js
class ComplaintController {
  createComplaint(request) {
    // Check the feature flag before proceeding
    if (!WK.service('saas.featureFlagService').isEnabled('COMPLAINT_SERVICE')) {
      return { success: false, message: 'This feature is not available for your current plan.' };
    }

    // ... proceed with creating the complaint ...
  }
}
```

By using this pattern, you can safely deploy code for premium features without exposing them to tenants on lower-tier plans.