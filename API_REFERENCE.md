# WK-OS SDK - Core API Reference

**Version:** 1.0

---

## 1. Overview

The WK Community OS provides a global `WK` object that serves as a facade for accessing core, stable platform services. These services should be used in favor of creating your own cross-cutting solutions.

## 2. Core Services

### `WK.service(serviceName)`

This is the most important API call. It resolves a service from the master `ServiceContainer`. This is how you get instances of other services your component depends on (though constructor injection is preferred).

**Example:** `const notificationService = WK.service('NotificationService');`

### `WK.security()`

Provides access to the security service.

*   `.checkPermission(permissionString)`: Throws an error if the current user does not have the required permission.

**Example:** `WK.security().checkPermission('letter.create');`

### `WK.logger()`

Provides access to the enterprise logger.

*   `.info(message)`
*   `.warn(message)`
*   `.error(message, stackTrace)`

**Example:** `WK.logger().info('Letter processed successfully.');`

### `WK.config()`

Provides access to the `ConfigurationManager` to get configuration values from `config.json` files.

**Example:** `const defaultLetterTemplate = WK.config('letter.default_template');`