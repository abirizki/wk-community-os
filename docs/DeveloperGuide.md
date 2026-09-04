# Developer Guide: Using the Generator

This guide is for developers who will be using the `GeneratorV2` to create new packages and modules.

---

## 1. Why Use the Generator?

Using the generator is **mandatory** for creating new packages. It provides:
*   **Speed:** Create a fully-formed, ready-to-code package in seconds.
*   **Consistency:** Ensures your package follows the exact same structure and coding standards as all other packages in the system.
*   **Reduced Errors:** Eliminates the possibility of manual errors from copying and pasting boilerplate code.
*   **Best Practices:** Automatically includes stubs for logging, error handling, security, and other best practices.

## 2. Common Commands

### Generating a New Business Package

This is the most common command. To create a new package for managing "Posyandu" (health post) activities:

```bash
wk generate package Posyandu
```

The generator will create the `packages/Posyandu/` directory and fill it with all the necessary files, including the service, repository, controller, migration, and test stubs. Your job is to fill in the business logic.

### Generating a Single Component

If you need to add a new service to an existing package, you can generate just that file.

```bash
wk generate service ReportGenerator --package=Analytics
```

This command will create `packages/Analytics/src/ReportGeneratorService.js` using the official service template.