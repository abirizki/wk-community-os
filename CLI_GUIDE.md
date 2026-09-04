# WK-OS SDK - CLI Guide

**Version:** 1.0

---

## 1. Overview

The WK Community OS Command-Line Interface (`wk`) is the primary tool for developers to interact with the SDK and automate common development tasks. It is designed to be simple, powerful, and consistent.

## 2. Main Command: `generate`

The most important command is `wk generate`. This command uses the `GeneratorV2` engine and the official `TemplateLibrary` to scaffold new components.

### Generating a New Package

This command creates a complete package structure with all standard modules.

```bash
wk generate package <PackageName>
```
**Example:** `wk generate package Finance`

### Generating a Single Module

You can also generate a single file within an existing package. The generator is smart enough to place it in the correct directory.

```bash
wk generate <ModuleType> <ModuleName> --package=<TargetPackage>
```
**Example:** `wk generate service ReportBuilder --package=Analytics`