# ADR-001: Native WK CLI Architecture

## Status
Accepted

## Date
2026-08-02

## Context
The previous WK CLI implementation used a PHP-based simulation layer. Acceptance testing showed that this approach failed at runtime because the PHP CLI bootstrap path could not resolve the required command classes. The architecture decision is to abandon the PHP CLI concept entirely and adopt a Native WK CLI built around Bash wrappers, shell scripts, the existing generator engine, and clasp-based deployment.

## Decision
WK Community OS will no longer use PHP CLI, Composer, PSR-4, PHP autoloading, PHP namespaces, or a PHP command registry. The official CLI path will be:

- Git Bash
- Bash wrapper scripts
- Native WK CLI entrypoint
- Generator engine integration
- Clasp deployment
- GitHub Actions automation

## Consequences

### Positive
- Simpler execution model for Google Apps Script and Git Bash-based workflows
- Better alignment with the repository scripts and existing shell automation
- Easier CI/CD integration through GitHub Actions
- Clear separation between framework core, generator, templates, and operational scripts

### Negative
- Existing PHP-based CLI artifacts become obsolete for the official execution path
- Documentation must be updated to remove PHP-specific references

## Architecture Summary

```text
Developer
  ↓
Native WK CLI
  ↓
Bash Wrapper (wk.sh)
  ↓
scripts/
  ↓
Generator Engine
  ↓
Template Library
  ↓
Packages / Framework
  ↓
clasp push
  ↓
Google Apps Script
```

## Implementation Principles
- Use Bash as the official CLI runtime
- Use shell scripts under scripts/ for operations
- Use generator.sh as the official generator entrypoint
- Keep the framework bootstrap and generator engine unchanged
- Do not create business modules or dashboards in this migration

## Scope
This ADR covers architecture correction for the CLI layer only.
