#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS RELEASE ORCHESTRATOR
#
# Description:
#   The primary script for releasing WK Community OS. It orchestrates the
#   entire DevOps toolkit to ensure a safe, verified, and logged release.
#
# Version: 1.0.0
# Author: Gemini Code Assist
# ==============================================================================

# --- Configuration ---
# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# --- Global Variables ---
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
LOG_FILE="$PROJECT_ROOT/release.log"

# Release state variables
APP_NAME="WK Community OS"
APP_VERSION="1.0.0"
DEPLOY_ENV="UNKNOWN"
GIT_BRANCH=""
GIT_COMMIT=""
GIT_TAG=""
BACKUP_FOLDER="N/A"
DEPLOY_RESULT="${RED}SKIPPED${NC}"
SMOKETEST_RESULT="${RED}SKIPPED${NC}"
OVERALL_STATUS="${RED}FAILED${NC}"

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo -e "${CYAN}WK COMMUNITY OS - RELEASE ORCHESTRATOR${NC}"
    echo "================================================="
}

###
# Prints a major step header.
# @param $1 - The step number.
# @param $2 - The step name.
###
printStep() {
    echo -e "\n================== ${CYAN}STEP $1: $2${NC} =================="
}

###
# Executes the doctor.sh script. Halts on failure.
###
runDoctor() {
    printStep "1" "ENVIRONMENT HEALTH CHECK"
    if [ ! -f "$SCRIPTS_DIR/doctor.sh" ]; then
        echo -e "${RED}Fatal: 'doctor.sh' not found. Cannot proceed.${NC}"
        exit 1
    fi
    bash "$SCRIPTS_DIR/doctor.sh"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Release STOPPED: Environment health check failed.${NC}"
        exit 1
    fi
}

###
# Executes the version.sh script.
###
runVersion() {
    printStep "2" "PROJECT VERSION INFORMATION"
    if [ ! -f "$SCRIPTS_DIR/version.sh" ]; then
        echo -e "${YELLOW}Warning: 'version.sh' not found. Skipping.${NC}"
        return
    fi
    bash "$SCRIPTS_DIR/version.sh"
}

###
# Executes the backup.sh script. Halts on failure and captures the backup folder path.
###
runBackup() {
    printStep "3" "PROJECT BACKUP"
    if [ ! -f "$SCRIPTS_DIR/backup.sh" ]; then
        echo -e "${RED}Fatal: 'backup.sh' not found. Cannot proceed.${NC}"
        exit 1
    fi

    # Use process substitution and tee to both display output and capture it
    local backup_output
    backup_output=$(bash "$SCRIPTS_DIR/backup.sh" | tee /dev/tty)
    
    # PIPESTATUS contains the exit codes of the pipeline commands. [0] is for backup.sh.
    if [ ${PIPESTATUS[0]} -ne 0 ]; then
        echo -e "${RED}Release STOPPED: Project backup failed.${NC}"
        exit 1
    fi

    # Extract the backup folder path from the output for logging
    BACKUP_FOLDER=$(echo "$backup_output" | grep "Backup Folder" | awk '{print $NF}')
}

###
# Executes the deploy.sh script. Halts on failure.
###
runDeploy() {
    printStep "4" "PROJECT DEPLOYMENT"
    if [ ! -f "$SCRIPTS_DIR/deploy.sh" ]; then
        echo -e "${RED}Fatal: 'deploy.sh' not found. Cannot proceed.${NC}"
        exit 1
    fi

    bash "$SCRIPTS_DIR/deploy.sh"
    if [ $? -ne 0 ]; then
        DEPLOY_RESULT="${RED}FAILED${NC}"
        echo -e "${RED}Release STOPPED: Deployment script failed.${NC}"
        exit 1
    fi
    DEPLOY_RESULT="${GREEN}SUCCESS${NC}"
}

###
# Executes the smoketest.sh script. On failure, prompts for rollback.
###
runSmokeTest() {
    printStep "5" "POST-DEPLOYMENT SMOKE TEST"
    if [ ! -f "$SCRIPTS_DIR/smoketest.sh" ]; then
        echo -e "${YELLOW}Warning: 'smoketest.sh' not found. Cannot verify deployment health.${NC}"
        SMOKETEST_RESULT="${YELLOW}SKIPPED${NC}"
        return
    fi

    bash "$SCRIPTS_DIR/smoketest.sh"
    if [ $? -ne 0 ]; then
        SMOKETEST_RESULT="${RED}FAILED${NC}"
        echo -e "${RED}Release STOPPED: Post-deployment smoke test failed.${NC}"
        runRestore
        exit 1 # Exit after restore attempt, as the release itself has failed
    fi
    SMOKETEST_RESULT="${GREEN}PASS${NC}"
}

###
# Prompts the user and executes the restore.sh script.
###
runRestore() {
    echo -e "\n--- ${RED}AUTOMATIC ROLLBACK SUGGESTED${NC} ---"
    if [ ! -f "$SCRIPTS_DIR/restore.sh" ]; then
        echo -e "${RED}Fatal: 'restore.sh' not found. Cannot perform automatic rollback.${NC}"
        return
    fi

    local confirm
    read -p "Deployment may be unhealthy. Restore from previous backup? (Y/N) [N]: " confirm
    if [[ "$confirm" =~ ^[Yy]$ ]]; then
        echo "Initiating rollback..."
        bash "$SCRIPTS_DIR/restore.sh"
    else
        echo -e "${YELLOW}Rollback declined by user. The application may be in a failed state.${NC}"
    fi
}

###
# Gathers all release information and writes it to release.log.
###
generateReleaseReport() {
    printStep "6" "GENERATING RELEASE REPORT"
    
    # Gather final details
    local root_folder_name
    root_folder_name=$(basename "$PROJECT_ROOT")
    case "$root_folder_name" in
        "WK_DEV")     DEPLOY_ENV="DEVELOPMENT" ;;
        "WK_STAGING") DEPLOY_ENV="STAGING" ;;
        "WK_PROD")    DEPLOY_ENV="PRODUCTION" ;;
    esac
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
    GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "N/A")

    {
        echo "--- WK Community OS Release Report ---"
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Application: $APP_NAME"
        echo "Version: $APP_VERSION"
        echo "Environment: $DEPLOY_ENV"
        echo ""
        echo "--- Details ---"
        echo "Branch: $GIT_BRANCH"
        echo "Commit: $GIT_COMMIT"
        echo "Tag: $GIT_TAG"
        echo "Backup Folder: $BACKUP_FOLDER"
        echo ""
        echo "--- Results ---"
        echo "Deployment Result: ${DEPLOY_RESULT}"
        echo "Smoke Test Result: ${SMOKETEST_RESULT}"
        echo "Overall Status: ${OVERALL_STATUS}"
        echo "--------------------------------------"
        echo ""
    } >> "$LOG_FILE"
    echo -e "${GREEN}Release report written to $LOG_FILE${NC}"
}

###
# Prints the final summary of the release operation.
###
printSummary() {
    printStep "7" "FINAL SUMMARY"
    echo "===================================================="
    echo -e "${CYAN}WK COMMUNITY OS - RELEASE ${OVERALL_STATUS}${NC}"
    echo "===================================================="
    printf "%-15s: %s\n" "Version" "$APP_VERSION"
    printf "%-15s: %s\n" "Branch" "$GIT_BRANCH"
    printf "%-15s: %s\n" "Commit" "$GIT_COMMIT"
    printf "%-15s: %s\n" "Tag" "$GIT_TAG"
    printf "%-15s: %s\n" "Backup" "$BACKUP_FOLDER"
    printf "%-15s: %b\n" "Deployment" "$DEPLOY_RESULT"
    printf "%-15s: %b\n" "Smoke Test" "$SMOKETEST_RESULT"
    printf "%-15s: %b\n" "Release" "$OVERALL_STATUS"
    echo "===================================================="
}

###
# Main function to orchestrate the entire release process.
###
main() {
    # Ensure the report is written even if the script exits prematurely
    trap 'generateReleaseReport; printSummary' EXIT

    printHeader

    runDoctor
    runVersion
    runBackup
    runDeploy
    runSmokeTest

    # If we reach this point, all steps were successful
    OVERALL_STATUS="${GREEN}SUCCESS${NC}"

    # Clear the trap so the final report/summary isn't printed twice
    trap - EXIT
    generateReleaseReport
    printSummary

    exit 0
}

# --- Script Entry Point ---
main