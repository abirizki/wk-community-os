#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS DEV DOCTOR
#
# Description:
#   A Developer Environment Health Checker for the WK Community OS project.
#   This script verifies that all necessary tools, configurations, and
#   repository states are correct before deployment.
#
# Version: 1.0.0
# Author: Gemini Code Assist
# ==============================================================================

# --- Configuration ---
# ANSI Color Codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Symbols
CHECK_MARK="${GREEN}✓ OK${NC}"
WARN_MARK="${YELLOW}⚠ WARN${NC}"
ERROR_MARK="${RED}✗ ERROR${NC}"

# --- State ---
# Global health status. 0 = Healthy, 1 = Critical Error
HEALTH_STATUS=0

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo " WK COMMUNITY OS DEV DOCTOR"
    echo "================================================="
    echo ""
}

###
# Checks if a command-line tool is installed and in the PATH.
#
# @param $1 - The command to check (e.g., "git").
# @param $2 - The display name for the report (e.g., "Git").
###
checkCommand() {
    local cmd="$1"
    local name="$2"
    local status

    if command -v "$cmd" &> /dev/null; then
        status="$CHECK_MARK"
    else
        status="$ERROR_MARK"
        HEALTH_STATUS=1
    fi
    printf "%-20s %b\n" "$name" "$status"
}

###
# Checks if a file exists in the current directory.
#
# @param $1 - The filename to check.
###
checkFile() {
    local filename="$1"
    local status

    if [ -f "$filename" ]; then
        status="$CHECK_MARK"
    else
        status="$ERROR_MARK"
        HEALTH_STATUS=1
    fi
    printf "%-20s %b\n" "$filename" "$status"
}

###
# Checks for an active internet connection.
###
checkInternet() {
    local status
    # Use curl to check for a successful HTTP response from a reliable server.
    # This is often more reliable than ping, which can be blocked by firewalls.
    if curl -s --head http://www.google.com | head -n 1 | grep "HTTP/.* [23].." > /dev/null; then
        status="$CHECK_MARK"
    else
        status="$ERROR_MARK"
        HEALTH_STATUS=1
    fi
    printf "%-20s %b\n" "Internet" "$status"
}

###
# Performs all Git-related health checks.
###
checkGit() {
    # Check 1: Current Branch
    local branch
    branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
    if [ -n "$branch" ]; then
        printf "%-20s %s\n" "Branch" "$branch"
    else
        printf "%-20s %b\n" "Branch" "${RED}Not a Git repository${NC}"
        HEALTH_STATUS=1
        # If not a git repo, no other git checks can run.
        return
    fi

    # Check 2: Git Remote Origin
    if git remote get-url origin &> /dev/null; then
        printf "%-20s %s\n" "Remote" "origin"
    else
        printf "%-20s %b\n" "Remote" "${YELLOW}origin not found${NC}"
    fi

    # Check 3: Working Tree Status
    local tree_status
    if [ -z "$(git status --porcelain)" ]; then
        tree_status="${GREEN}CLEAN${NC}"
    else
        tree_status="${YELLOW}DIRTY${NC}"
        # A dirty tree is a warning, not a critical failure for this check.
    fi
    printf "%-20s %b\n" "Working Tree" "$tree_status"

    # Check 4: Last Commit Hash
    local commit_hash
    commit_hash=$(git rev-parse --short HEAD 2>/dev/null)
    printf "%-20s %s\n" "Last Commit" "$commit_hash"

    # Check 5: Latest Version Tag
    local latest_tag
    # This command gets the most recent tag reachable from the current commit.
    latest_tag=$(git describe --tags --abbrev=0 2>/dev/null)
    if [ -n "$latest_tag" ]; then
        printf "%-20s %s\n" "Latest Tag" "$latest_tag"
    else
        printf "%-20s %s\n" "Latest Tag" "${YELLOW}No tags found${NC}"
    fi
}

###
# Performs CLASP-specific health checks.
###
checkClasp() {
    # This check assumes the 'clasp' command itself has been verified to exist.
    local status
    if clasp login --status | grep -q "You are logged in"; then
        status="$CHECK_MARK"
    else
        status="$ERROR_MARK"
        HEALTH_STATUS=1
    fi
    printf "%-20s %b\n" "Google Login" "$status"
}

###
# Checks for a readable Apps Script ID in .clasp.json.
###
checkScript() {
    local script_id
    local status

    if [ ! -f ".clasp.json" ]; then
        # The checkFile function will already report this error.
        # We just need to avoid running grep on a non-existent file.
        printf "%-20s %b\n" "Script ID" "$ERROR_MARK"
        return
    fi

    # A simple but potentially fragile way to parse JSON in bash.
    # It's used here to avoid dependencies like 'jq'.
    script_id=$(grep -o '"scriptId": *"[^"]*"' .clasp.json | cut -d'"' -f4)

    if [ -n "$script_id" ]; then
        status="$CHECK_MARK"
    else
        status="$ERROR_MARK"
        HEALTH_STATUS=1
    fi
    printf "%-20s %b\n" "Script ID" "$status"
}

###
# Prints the final summary message based on the overall health status.
###
printSummary() {
    echo ""
    echo "-------------------------------------------------"
    echo ""
    if [ "$HEALTH_STATUS" -eq 0 ]; then
        echo -e " ${GREEN}Environment Healthy${NC}"
    else
        echo -e " ${RED}Critical errors found. Please fix them.${NC}"
    fi
    echo ""
    echo "-------------------------------------------------"
}

###
# Main function to run all health checks in sequence.
###
main() {
    printHeader

    checkCommand "git" "Git"
    checkCommand "node" "Node.js"
    checkCommand "npm" "npm"
    checkCommand "clasp" "CLASP"
    
    checkClasp
    checkScript

    checkFile "appsscript.json"
    checkFile ".clasp.json"

    checkGit
    checkInternet

    printSummary

    exit "$HEALTH_STATUS"
}

# --- Script Entry Point ---
main