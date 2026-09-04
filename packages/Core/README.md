# Core Platform

The Core Platform package provides the shared infrastructure foundation for all WK business packages.

## Responsibilities
- Authentication and authorization
- Permission and role management
- Session and configuration management
- Logging, auditing, and monitoring
- Workflow, notification, reporting, and dashboard services
- Rule evaluation and health checks

## Architecture

```text
Framework
  ↓
Core Platform
  ↓
Business Package
  ↓
Application
```

## Package Contract
Every future business package should consume the platform services instead of re-implementing infrastructure concerns.
