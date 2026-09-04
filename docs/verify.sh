#!/bin/bash

# WK Community OS - Doctor/Verification Script
# This script runs the system doctor to diagnose configuration and integrity issues.

set -e

echo "--- [START] Running System Doctor Verification ---"

clasp run runDoctorService

echo "--- [END] System Doctor process finished. Check execution logs for detailed results. ---"