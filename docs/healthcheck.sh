#!/bin/bash

# WK Community OS - Health Check Script
# This script runs the system-wide health check.

set -e

echo "--- [START] Running System Health Check ---"

clasp run runAllHealthChecks

echo "--- [END] Health Check process finished. Check execution logs for detailed results. ---"