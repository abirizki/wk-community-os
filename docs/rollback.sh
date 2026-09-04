#!/bin/bash

# WK Community OS - Rollback Script
# This script rolls back to a previous deployment version.

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <version_number>"
  echo "Please provide the deployment version number to roll back to."
  exit 1
fi

VERSION_NUMBER=$1

echo "--- [START] Rolling back to deployment version: $VERSION_NUMBER ---"

clasp undeploy -i $(clasp deployments | tail -n 1 | awk '{print $2}') # Undeploy latest
clasp deploy --versionNumber $VERSION_NUMBER --description "Rollback to version $VERSION_NUMBER"

echo "--- [SUCCESS] Rollback complete. ---"