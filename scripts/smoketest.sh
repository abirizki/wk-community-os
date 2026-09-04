#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS SMOKE TEST
#
# Description:
#   Performs post-deployment smoke tests to verify that the WK Community OS
#   project is operational and the repository is in a healthy state.
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
LOG_FILE="$PROJECT_ROOT/smoketest.log"

# Test counters
TOTAL_TESTS=0
PASSED_COUNT=0
FAILED_COUNT=0
WARNING_COUNT=0

# Script exit status (0 = PASS, 1 = Critical Failure)
SCRIPT_EXIT_STATUS=0

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo -e "${CYAN}WK COMMUNITY OS - POST-DEPLOYMENT SMOKE TEST${NC}"
    echo "================================================="
}

###
# Prints a step header.
# @param $1 - The step name.
###
printStep() {
    echo -e "\n--- ${CYAN}STEP: $1${NC} ---"
}

###
# A generic check runner.
# @param $1 - Test description
# @param $2 - Command to execute for the test (as a string)
# @param $3 - "critical" or "warning" for failure type
###
runCheck() {
    local description="$1"
    local command_to_run="$2"
    local failure_type="$3"
    local status

    ((TOTAL_TESTS++))
    if eval "$command_to_run"; then
        status="${GREEN}PASS${NC}"
        ((PASSED_COUNT++))
    else
        if [ "$failure_type" == "critical" ]; then
            status="${RED}FAIL${NC}"
            ((FAILED_COUNT++))
            SCRIPT_EXIT_STATUS=1
        else
            status="${YELLOW}WARN${NC}"
            ((WARNING_COUNT++))
        fi
    fi
    printf "%-40s [%b]\n" "$description" "$status"
}

###
# Displays initial project information.
###
displayInfo() {
    printStep "Project Information"
    local deploy_env="UNKNOWN"
    local root_folder_name
    root_folder_name=$(basename "$PROJECT_ROOT")
    case "$root_folder_name" in
        "WK_DEV")     deploy_env="DEVELOPMENT" ;;
        "WK_STAGING") deploy_env="STAGING" ;;
        "WK_PROD")    deploy_env="PRODUCTION" ;;
    esac

    printf "%-15s: %s\n" "Application" "WK Community OS"
    printf "%-15s: %s\n" "Version" "1.0.0"
    printf "%-15s: %s\n" "Environment" "$deploy_env"
    printf "%-15s: %s\n" "Branch" "$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
    printf "%-15s: %s\n" "Commit" "$(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
    printf "%-15s: %s\n" "Tag" "$(git describe --tags --abbrev=0 2>/dev/null || echo 'N/A')"
}

###
# Verifies that required command-line tools are installed.
###
verifyTools() {
    printStep "Verifying Tools"
    runCheck "Git installed" "command -v git &> /dev/null" "critical"
    runCheck "Node.js installed" "command -v node &> /dev/null" "critical"
    runCheck "CLASP installed" "command -v clasp &> /dev/null" "critical"
}

###
# Verifies that essential project files exist.
###
verifyProjectFiles() {
    printStep "Verifying Project Files"
    runCheck "appsscript.json exists" "[ -f '$PROJECT_ROOT/appsscript.json' ]" "critical"
    runCheck ".clasp.json exists" "[ -f '$PROJECT_ROOT/.clasp.json' ]" "critical"
    runCheck "README.md exists" "[ -f '$PROJECT_ROOT/README.md' ]" "warning"
}

###
# Verifies the state of the Git repository.
###
verifyGit() {
    printStep "Verifying Git Repository"
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        runCheck "Is a Git repository" "false" "critical"
        return
    fi
    runCheck "Is a Git repository" "true" "critical"
    runCheck "Working tree is clean" "[ -z \"\$(git status --porcelain)\" ]" "warning"
    runCheck "Remote 'origin' is configured" "git remote get-url origin &> /dev/null" "warning"
}

###
# Verifies the connection and status with Google Apps Script.
###
verifyAppsScript() {
    printStep "Verifying Google Apps Script"
    if ! command -v clasp &> /dev/null; then
        runCheck "CLASP login status" "false" "critical"
        runCheck "CLASP deployments list" "false" "critical"
        return
    fi
    runCheck "CLASP login status" "clasp login --status | grep -q 'You are logged in'" "critical"
    runCheck "CLASP deployments list" "clasp deployments &> /dev/null" "warning"
}

###
# Verifies the existence of the core project directory structure.
###
verifyStructure() {
    printStep "Verifying Project Structure"
    local dirs=("scripts" "docs" "assets" "release" "src" "tests")
    for dir in "${dirs[@]}"; do
        runCheck "Directory '$dir/' exists" "[ -d '$PROJECT_ROOT/$dir' ]" "warning"
    done
}

###
# Verifies the existence of key application module files.
###
verifyModules() {
    printStep "Verifying Application Modules"
    local modules=( "Framework" "Citizen" "Family" "Letter" "Dashboard" "Authentication" "Router" "DatabaseAdapter" "SpreadsheetDriver" "MockDriver" )
    echo "----------------------------------------"
    for module in "${modules[@]}"; do
        # Check for either .js or .gs extension
        runCheck "$module Module" "[ -f '$PROJECT_ROOT/src/$module.js' ] || [ -f '$PROJECT_ROOT/src/$module.gs' ]" "warning"
    done
    echo "----------------------------------------"
}

###
# Writes a summary log of the smoke test.
###
writeLog() {
    printStep "Writing Smoke Test Log"
    {
        echo "--- Smoke Test Log ---"
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Environment: $(basename "$PROJECT_ROOT" | sed 's/WK_//')"
        echo "Git Branch: $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo 'N/A')"
        echo "Commit: $(git rev-parse --short HEAD 2>/dev/null || echo 'N/A')"
        echo "Tag: $(git describe --tags --abbrev=0 2>/dev/null || echo 'N/A')"
        echo ""
        echo "--- Results ---"
        echo "Total Tests: $TOTAL_TESTS"
        echo "Passed: $PASSED_COUNT"
        echo "Failed (Critical): $FAILED_COUNT"
        echo "Warnings: $WARNING_COUNT"
        echo "--------------------"
    } > "$LOG_FILE"
    echo -e "${GREEN}Log file written to $LOG_FILE${NC}"
}

###
# Prints the final summary of the smoke test.
###
printSummary() {
    local final_status
    if [ "$SCRIPT_EXIT_STATUS" -eq 0 ]; then
        final_status="${GREEN}PASSED${NC}"
    else
        final_status="${RED}FAILED${NC}"
    fi

    echo ""
    echo "========================================"
    echo -e "   SMOKE TEST ${final_status}"
    echo "========================================"
    printf "%-15s: %s\n" "Total Tests" "$TOTAL_TESTS"
    printf "%-15s: %s\n" "Passed" "$PASSED_COUNT"
    printf "%-15s: %s\n" "Failed" "$FAILED_COUNT"
    printf "%-15s: %s\n" "Warnings" "$WARNING_COUNT"
    echo "========================================"
    echo ""

    if [ "$SCRIPT_EXIT_STATUS" -ne 0 ]; then
        echo -e "${RED}Critical failures detected. Please review the logs.${NC}"
    fi
}

###
# Main function to orchestrate the smoke test.
###
main() {
    printHeader
    displayInfo

    verifyTools
    verifyProjectFiles
    verifyGit
    verifyAppsScript
    verifyStructure
    verifyModules

    writeLog
    printSummary

    exit "$SCRIPT_EXIT_STATUS"
}

# --- Script Entry Point ---
main