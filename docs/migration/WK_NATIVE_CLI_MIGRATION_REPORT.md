# WK Native CLI Migration Report

## Overview
This report documents the architecture correction from the previous PHP-based CLI simulation to a Native WK CLI based on Bash wrappers, shell scripts, the generator engine, and clasp-based deployment.

## Migration Objective
Replace the PHP CLI approach with a Native WK CLI that is aligned with:
- Google Apps Script
- NodeJS
- Clasp
- Git Bash
- GitHub Actions

## Architectural Change Summary

### Old Model
- PHP CLI
- Composer
- PSR-4
- Autoload
- Namespace PHP
- PHP Command Registry

### New Model
- Native WK CLI
- Bash wrapper entrypoint
- Shell scripts under scripts/
- generator.sh as generator entrypoint
- Clasp deployment flow

## CLI Migration Mapping

| Legacy Concept | New Concept |
|---|---|
| PHP CLI | Native WK CLI |
| Composer | Bash scripts and Git Bash |
| PSR-4 | Native script-based entrypoints |
| Autoload | Direct script execution |
| PHP namespace | Shell command routing |
| PHP command registry | Bash command parser |

## CLI Flow

```text
Developer
  ↓
wk
  ↓
wk.sh
  ↓
Command Parser
  ↓
scripts/
  ↓
Generator Engine
  ↓
Template Library
  ↓
Packages
```

## Build Flow

```text
Developer
  ↓
Git Bash
  ↓
wk
  ↓
Generator
  ↓
Framework
  ↓
Packages
  ↓
clasp push
  ↓
Google Apps Script
  ↓
Google Workspace
```

## Dependency Diagram

```text
Native WK CLI
  ├── wk.sh
  ├── generator.sh
  ├── scripts/doctor.sh
  ├── scripts/backup.sh
  ├── scripts/restore.sh
  ├── scripts/deploy.sh
  ├── scripts/release.sh
  ├── scripts/smoketest.sh
  ├── scripts/version.sh
  └── Generator Engine / Template Library
```

## Files to Delete
- wk/cli/Application.php
- wk/cli/BaseCommand.php
- wk/cli/CommandRegistry.php
- wk/cli/CommandRunner.php
- wk/cli/HelpCommand.php
- wk/cli/VersionCommand.php
- wk/cli/DoctorCommand.php
- wk/cli/BackupCommand.php
- wk/cli/RestoreCommand.php
- wk/cli/DeployCommand.php
- wk/cli/ReleaseCommand.php
- wk/cli/SmokeCommand.php
- wk/cli/BuildCommand.php
- wk/cli/CleanCommand.php
- wk/cli/ValidateCommand.php
- wk/cli/ReportCommand.php
- wk/cli/CreatePackageCommand.php
- wk/cli/CreateRepositoryCommand.php
- wk/cli/CreateServiceCommand.php
- wk/cli/CreateControllerCommand.php
- wk/cli/CreateDashboardCommand.php
- wk/cli/CreateRuleCommand.php
- wk/cli/CreatePermissionCommand.php
- wk/cli/CreateMigrationCommand.php
- wk/cli/CreateSeederCommand.php
- wk/cli/CreateTestCommand.php
- wk/cli/CreateDocsCommand.php
- wk/cli/*.php (all PHP CLI files)

## Files to Move
- Existing scripts content should remain under scripts/ and be used directly by the new CLI wrappers.
- Existing generator-related assets remain under framework/generators and templates/.

## Files to Keep
- framework/
- generators/
- templates/
- scripts/
- appsscript.json
- Code.js
- .clasp.json
- docs/

## Files to Update
- Any documentation that references PHP CLI, Composer, autoloading, PSR-4, or PHP namespaces.
- Any CLI usage instructions that still mention the PHP simulation path.

## Migration Checklist
- [x] ADR drafted
- [x] Migration report drafted
- [x] Repository change plan drafted
- [x] Native CLI flow documented
- [x] Build flow updated conceptually
- [x] Files to delete/move/keep listed
