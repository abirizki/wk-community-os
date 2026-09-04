#!/bin/bash

# WK Community OS - Update Script
# This script automates the process of updating an existing deployment.

set -e

echo "--- [START] WK Community OS Update ---"

# 1. Perform a pre-update backup
echo "--> Performing pre-update backup..."
clasp run runManualBackup
echo "Backup completed."

# 2. Push the latest code
echo "--> Pushing updated source code via clasp..."
clasp push -f
echo "Source code pushed successfully."

# 3. Run database migrations
echo "--> Running database migrations..."
clasp run runAllMigrations
echo "Database migrations completed."

# 4. Create a new deployment version
echo "--> Creating a new deployment version..."
clasp deploy --description "Application Update"

echo "--- [SUCCESS] WK Community OS Update Complete ---"