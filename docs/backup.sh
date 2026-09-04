#!/bin/bash

# WK Community OS - Backup Script
# This script triggers a full application backup.

set -e

echo "--- [START] Triggering Full Application Backup ---"

# Call the `createBackup` function in the BackupService via clasp
clasp run runManualBackup

echo "--- [SUCCESS] Backup process initiated. Check logs and Google Drive for results. ---"