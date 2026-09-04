# Template Guide

This guide explains the structure and usage of the templates within the Template Library.

---

## 1. Template Philosophy

Templates in this library are the blueprint for the entire WK Community OS. They are designed to be:

*   **Canonical:** They represent the single, correct way to structure a given component.
*   **Comprehensive:** They include boilerplate for all essential cross-cutting concerns like logging, security, and error handling.
*   **Instructive:** They contain commented-out stubs and JSDoc comments that guide the developer on how to implement business logic and integrate with other services.

## 2. Placeholder Syntax

Templates use a simple placeholder syntax: `<<variableName>>`. The `GeneratorV2` is responsible for replacing these placeholders with the appropriate values during code generation.

### Common Placeholders:

*   `<<packageName>>`: The name of the package (e.g., `Health`).
*   `<<packageDescription>>`: A brief description of the package.
*   `<<entityName>>`: The name of the primary entity (e.g., `HealthProfile`).
*   `<<serviceName>>`: The name of the service class (e.g., `HealthService`).
*   `<<controllerName>>`: The name of the controller class (e.g., `HealthController`).
*   `<<repositoryName>>`: The name of the repository class (e.g., `HealthRepository`).
*   `<<permissionPrefix>>`: The prefix for permissions (e.g., `health`).
*   `<<currentDate>>`: The date of generation.
*   `<<author>>`: The name of the developer running the generator.

## 3. Template Structure

The `templates/` directory is organized by the type of component being generated.

*   `/templates/BusinessPackage`: Contains all the files needed to scaffold a complete business module.
*   `/templates/Service`: Contains the template for a single service class. This is used when a developer runs `wk generate service ...`.

## 4. Modifying Templates

Modifications to templates should be considered a significant architectural change and must be done with extreme care. Any change will affect all future packages generated in the system. All template modifications must be reviewed and approved by the platform architecture team.