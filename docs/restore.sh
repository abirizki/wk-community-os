#!/bin/bash

# WK Community OS - Restore Script
# This script triggers a restore from a specified backup file.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <backup_file_id>"
  echo "Please provide the Google Drive File ID of the backup to restore."
  exit 1
fi

BACKUP_FILE_ID=$1

echo "--- [START] Triggering Restore from Backup File ID: $BACKUP_FILE_ID ---"

# Call the `restoreFromBackup` function in the RestoreService via clasp
clasp run 'runManualRestore' --params "[\"$BACKUP_FILE_ID\"]"

echo "--- [SUCCESS] Restore process initiated. Check logs for results. ---"