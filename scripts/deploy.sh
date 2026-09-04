#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS DEPLOYMENT SCRIPT
#
# Description:
#   Safely deploys the WK Community OS project to Google Apps Script.
#   This script orchestrates health checks, backups, user confirmation,
#   and deployment logging.
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
# Determine project root dynamically, assuming script is in 'scripts/'
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
SCRIPTS_DIR="$PROJECT_ROOT/scripts"
LOG_FILE="$PROJECT_ROOT/deploy.log"

# Deployment state variables
APP_NAME="WK Community OS"
DEPLOY_ENV="UNKNOWN"
GIT_BRANCH=""
GIT_COMMIT=""
GIT_TAG=""
SCRIPT_ID=""
DEPLOY_STATUS="${RED}FAILED${NC}" # Default to FAILED

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo -e "${CYAN}WK COMMUNITY OS DEPLOYMENT UTILITY${NC}"
    echo "================================================="
    echo ""
}

###
# Prints a step header.
# @param $1 - The step name.
###
printStep() {
    echo -e "\n--- ${CYAN}STEP: $1${NC} ---"
}

###
# Executes the doctor.sh script to check environment health.
# Exits with an error if the script fails.
###
runDoctor() {
    printStep "Running Environment Health Check"
    if [ ! -f "$SCRIPTS_DIR/doctor.sh" ]; then
        echo -e "${RED}Error: 'doctor.sh' not found in '$SCRIPTS_DIR'.${NC}"
        exit 1
    fi

    bash "$SCRIPTS_DIR/doctor.sh"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Deployment STOPPED: Environment health check failed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Health check passed.${NC}"
}

###
# Executes the version.sh script to display project information.
###
runVersion() {
    printStep "Displaying Version Information"
    if [ ! -f "$SCRIPTS_DIR/version.sh" ]; then
        echo -e "${YELLOW}Warning: 'version.sh' not found. Skipping.${NC}"
        return
    fi
    bash "$SCRIPTS_DIR/version.sh"
}

###
# Executes the backup.sh script to create a project backup.
# Exits with an error if the script fails.
###
runBackup() {
    printStep "Creating Project Backup"
    if [ ! -f "$SCRIPTS_DIR/backup.sh" ]; then
        echo -e "${RED}Error: 'backup.sh' not found in '$SCRIPTS_DIR'.${NC}"
        exit 1
    fi

    bash "$SCRIPTS_DIR/backup.sh"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Deployment STOPPED: Project backup failed.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Backup completed successfully.${NC}"
}

###
# Verifies that essential configuration files exist.
# Exits with an error if files are missing.
###
verifyEnvironment() {
    printStep "Verifying Configuration Files"
    local has_error=0
    if [ ! -f "$PROJECT_ROOT/.clasp.json" ]; then
        echo -e "${RED}Error: '.clasp.json' not found.${NC}"
        has_error=1
    fi
    if [ ! -f "$PROJECT_ROOT/appsscript.json" ]; then
        echo -e "${RED}Error: 'appsscript.json' not found.${NC}"
        has_error=1
    fi

    if [ $has_error -eq 1 ]; then
        echo -e "${RED}Deployment STOPPED: Missing required configuration files.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Configuration files verified.${NC}"
}

###
# Verifies that the user is logged into CLASP.
# Exits with an error if not logged in.
###
verifyLogin() {
    printStep "Verifying Google CLASP Login"
    if ! command -v clasp &> /dev/null; then
        echo -e "${RED}Deployment STOPPED: 'clasp' command not found.${NC}"
        exit 1
    fi

    if ! clasp login --status | grep -q "You are logged in"; then
        echo -e "${RED}Deployment STOPPED: You are not logged into Google CLASP. Please run 'clasp login'.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Google login active.${NC}"
}

###
# Displays deployment target information and asks for user confirmation.
# Exits if the user does not confirm.
###
confirmDeploy() {
    printStep "Deployment Confirmation"

    # Gather deployment info
    SCRIPT_ID=$(grep -o '"scriptId": *"[^"]*"' "$PROJECT_ROOT/.clasp.json" | cut -d'"' -f4)
    GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "N/A")
    GIT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "N/A")
    GIT_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "N/A")

    local root_folder_name
    root_folder_name=$(basename "$PROJECT_ROOT")
    case "$root_folder_name" in
        "WK_DEV")     DEPLOY_ENV="DEVELOPMENT" ;;
        "WK_STAGING") DEPLOY_ENV="STAGING" ;;
        "WK_PROD")    DEPLOY_ENV="PRODUCTION" ;;
        *)            DEPLOY_ENV="UNKNOWN" ;;
    esac

    echo "You are about to deploy to the following target:"
    echo -e "----------------------------------------"
    echo -e "Environment : ${YELLOW}$DEPLOY_ENV${NC}"
    echo -e "Git Branch  : ${YELLOW}$GIT_BRANCH${NC}"
    echo -e "Commit      : ${YELLOW}$GIT_COMMIT${NC}"
    echo -e "Tag         : ${YELLOW}$GIT_TAG${NC}"
    echo -e "Script ID   : ${YELLOW}$SCRIPT_ID${NC}"
    echo -e "----------------------------------------"

    read -p "Continue with deployment? (Y/N) [N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${RED}Deployment CANCELED by user.${NC}"
        exit 1
    fi
}

###
# Pushes the project source code using 'clasp push'.
# Exits with an error if the push fails.
###
deployProject() {
    printStep "Executing Deployment"
    echo "Running 'clasp push'... (This may take a moment)"

    # Capture output to show only on error
    local output
    output=$(clasp push --rootDir "$PROJECT_ROOT" 2>&1)

    if [ $? -ne 0 ]; then
        echo -e "${RED}Deployment STOPPED: 'clasp push' failed.${NC}"
        echo -e "------------------- CLASP OUTPUT -------------------"
        echo "$output"
        echo -e "----------------------------------------------------"
        exit 1
    fi
    echo -e "${GREEN}'clasp push' completed successfully.${NC}"
}

###
# Verifies the deployment by listing available deployments.
# Issues a warning as 'clasp push' does not create a new named deployment.
###
verifyDeployment() {
    printStep "Verifying Deployment"
    echo "Running 'clasp deployments'..."
    clasp deployments
    echo -e "${YELLOW}Note: 'clasp push' updates the HEAD (latest) code. The list above shows versioned deployments created with 'clasp deploy'.${NC}"
}

###
# Writes a log entry for the deployment to deploy.log.
###
writeLog() {
    printStep "Writing Deployment Log"
    {
        echo "--- Deployment Log Entry ---"
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Environment: $DEPLOY_ENV"
        echo "Branch: $GIT_BRANCH"
        echo "Commit: $GIT_COMMIT"
        echo "Tag: $GIT_TAG"
        echo "Script ID: $SCRIPT_ID"
        echo "Result: ${DEPLOY_STATUS}" # This will be either FAILED or SUCCESS
        echo "----------------------------"
        echo ""
    } >> "$LOG_FILE"
    echo -e "${GREEN}Log entry written to $LOG_FILE${NC}"
}

###
# Prints the final summary of the deployment operation.
###
printSummary() {
    echo ""
    echo "========================================="
    # The DEPLOY_STATUS variable will contain the color code
    echo -e "   DEPLOYMENT ${DEPLOY_STATUS}"
    echo "========================================="
    printf "%-15s: %s\n" "Application" "$APP_NAME"
    printf "%-15s: %s\n" "Environment" "$DEPLOY_ENV"
    printf "%-15s: %s\n" "Branch" "$GIT_BRANCH"
    printf "%-15s: %s\n" "Commit" "$GIT_COMMIT"
    printf "%-15s: %s\n" "Tag" "$GIT_TAG"
    printf "%-15s: %s\n" "Script ID" "$SCRIPT_ID"
    printf "%-15s: %b\n" "Status" "$DEPLOY_STATUS"
    echo "========================================="
    echo ""
}

###
# Main function to orchestrate the entire deployment process.
###
main() {
    # Ensure log is written even if script exits prematurely
    trap 'if [ "$DEPLOY_STATUS" != "${GREEN}SUCCESSFUL${NC}" ]; then writeLog; fi' EXIT

    printHeader

    runDoctor
    runVersion
    runBackup
    verifyEnvironment
    verifyLogin
    confirmDeploy
    deployProject
    verifyDeployment

    # If we reach this point, the deployment was successful
    DEPLOY_STATUS="${GREEN}SUCCESSFUL${NC}"
    
    # Clear the trap and write the final log
    trap - EXIT
    writeLog

    printSummary

    exit 0
}

# --- Script Entry Point ---
main