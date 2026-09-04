# WK-OS SDK - Developer Guide

**Version:** 1.0

---

## 1. Development Philosophy

Welcome, developer! This guide will walk you through the process of building a new package for the WK Community OS. Our development philosophy is built on three pillars:

*   **Convention over Configuration:** We use a standardized structure for all packages. By following the conventions, you reduce boilerplate and ensure your package works seamlessly with the Kernel and other services.
*   **Generator-First:** **Never** create packages or modules manually. Always use the `wk generate` command. This guarantees that your code adheres to the latest templates and architectural standards from the moment it's created.
*   **Domain-Driven:** Group related packages into logical Domains (e.g., `CommunityHealth`, `CommunityEconomy`). This keeps the enterprise architecture clean and understandable.

## 2. Setting Up Your Environment

1.  **Prerequisites:** Ensure you have `Node.js`, `npm`, and `@google/clasp` installed globally.
2.  **Authentication:** Authenticate `clasp` with the Google account that has access to the WK Community OS Apps Script project.
    ```bash
    clasp login
    ```
3.  **Clone the Project:** Clone the main `wk-community-os` repository and link it to your Apps Script project ID.
    ```bash
    git clone <repo_url>
    cd wk-community-os
    clasp clone <script_id>
    ```

## 3. Your First Package: A Step-by-Step Guide

Let's create a new package called `Library`.

### Step 1: Generate the Package

Use the `wk` CLI to generate the package. This command will create the entire directory structure and all the standard files (`Service`, `Repository`, `Controller`, etc.) based on the official `TemplateLibrary`.

```bash
wk generate package Library
```

### Step 2: Implement the Business Logic

1.  **Entity (`src/LibraryEntity.js`):** Define the data structure for a `Book`. Add properties like `title`, `author`, and `isbn`.
2.  **Migration (`src/LibraryMigration.js`):** In the `up()` method, define the columns for your `books` database table.
3.  **Repository (`src/LibraryRepository.js`):** This is mostly pre-written for you. It handles the database operations (create, find, update, delete).
4.  **Validator (`src/LibraryValidator.js`):** Add validation rules. For example, ensure that `title` and `author` are not empty when creating a new book.
5.  **Service (`src/LibraryService.js`):** This is where your core business logic lives. Implement the `createBook`, `findBookById`, and `updateBook` methods. These methods will call the validator and the repository.
6.  **Controller (`src/LibraryController.js`):** This is the API layer. It exposes the service's methods to the outside world. The generated template provides a `getById` example; follow that pattern to create endpoints for `create`, `update`, etc.

### Step 4: Enable and Test

1.  **Enable the Package:** Open the `module.json` for your new `Library` package and set `"enabled": true`.
2.  **Push Code:** Push your changes to the Apps Script project.
    ```bash
    clasp push -f
    ```
3.  **Run Migrations:** In the Apps Script Editor, run the `runAllMigrations` function to create the new `books` table (Google Sheet).
4.  **Test:** Manually run your `LibraryTest.js` function or call your new controller endpoints to verify functionality.

## 4. Core Concepts

*   **Service Container:** Never use `new MyService()`. Your dependencies will be automatically injected into your constructor by the container. See `API_REFERENCE.md`.
*   **Event Bus:** For cross-package communication, publish an event to the `EventBus`. Do not call another service directly.
*   **Permissions:** Always add a permission check (`WK.security().checkPermission(...)`) at the beginning of every service and controller method.