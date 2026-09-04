# WK-OS SDK - Plugin Development Guide

**Version:** 1.0

---

## 1. Overview

This guide provides instructions for developing a third-party plugin that can be distributed via the WK Community OS `Marketplace`.

## 2. Plugin vs. Package

*   **Package:** A standard, first-party component that is part of the core OS codebase.
*   **Plugin:** A self-contained, third-party package designed to be installed, updated, and uninstalled dynamically via the Marketplace.

## 3. The Plugin Manifest (`plugin.json`)

Every plugin must have a `plugin.json` file in its root directory. This file is similar to `module.json` but contains additional metadata for the Marketplace.

```json
{
  "id": "my-cool-plugin",
  "name": "My Cool Plugin",
  "version": "1.0.0",
  "author": "My Company",
  "description": "This plugin adds cool features.",
  "osCompatibility": ">=1.0.0",
  "dependencies": ["core", "system", "analytics"]
}
```

## 4. Development Process

The development process for a plugin is identical to that of a standard package. Use the `wk generate package` command to start, and then implement your business logic. The key difference is the addition of the `plugin.json` manifest and the way the plugin is packaged for distribution (e.g., in its own Git repository).