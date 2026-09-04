#!/bin/bash

# WK Community OS - Installation Script
# This script automates the initial deployment and setup of the application.

set -e # Exit immediately if a command exits with a non-zero status.

echo "--- [START] WK Community OS Installation ---"

# 1. Push the latest code to the Apps Script project
echo "--> Pushing source code via clasp..."
clasp push -f
echo "Source code pushed successfully."

# 2. Create a new deployment version
echo "--> Creating a new web app deployment..."
# Note: This step is often done manually for the first time to get the URL.
# `clasp deploy` can be used to create and manage deployments.
clasp deploy -d "Initial Installation"
echo "Deployment created. Please check the Apps Script editor for the Web App URL."

# 3. Run database migrations
echo "--> Running database migrations..."
clasp run runAllMigrations
echo "Database migrations completed."

# 4. Set up time-based triggers (This part is a reminder, as it must be done in the UI)
echo "--> IMPORTANT: Please set up the following time-based triggers in the Apps Script Editor:"
echo "    - processEventBusQueue (every 5 minutes)"
echo "    - processNotificationQueue (every 5 minutes)"
echo "    - runDailyAnalytics (daily, midnight to 1am)"

echo "--- [SUCCESS] WK Community OS Installation Complete ---"