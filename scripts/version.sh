#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS VERSION REPORTER
#
# Description:
#   Displays complete version and environment information for the
#   WK Community OS project.
#
# Version: 1.0.0
# Author: Gemini Code Assist
# ==============================================================================

# --- Configuration ---
# ANSI Color Codes
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Application Constants
APP_NAME="WK Community OS"
APP_VERSION="1.0.0"

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "===================================================="
    echo -e "${CYAN}$APP_NAME${NC}"
    echo -e "${CYAN}Version Information${NC}"
    echo "===================================================="
    echo ""
}

###
# Prints a formatted key-value pair.
# @param $1 - The key/label.
# @param $2 - The value.
###
printInfo() {
    printf "%-22s: %s\n" "$1" "$2"
}

###
 # Detects and prints the current deployment environment based on the
 # name of the project's root directory.
###
getEnvironment() {
    local root_folder_name
    root_folder_name=$(basename "$PWD")
    local env

    case "$root_folder_name" in
        "WK_DEV")     env="DEVELOPMENT" ;;
        "WK_STAGING") env="STAGING" ;;
        "WK_PROD")    env="PRODUCTION" ;;
        *)            env="UNKNOWN" ;;
    esac
    printInfo "Environment" "$env"
}

###
# Retrieves and prints all Git-related information.
###
getGitInfo() {
    # Ensure we are in a git repository before proceeding
    if ! git rev-parse --is-inside-work-tree &> /dev/null; then
        printInfo "Git Information" "Not a Git repository"
        return
    fi

    local branch status remote_url tag

    branch=$(git rev-parse --abbrev-ref HEAD)
    printInfo "Git Branch" "$branch"

    printInfo "Latest Commit" "$(git rev-parse --short HEAD)"
    printInfo "Commit Date" "$(git log -1 --format=%cd --date=format:'%Y-%m-%d')"
    printInfo "Commit Author" "$(git log -1 --format=%an)"

    tag=$(git describe --tags --abbrev=0 2>/dev/null)
    printInfo "Latest Tag" "${tag:-No tag found}"

    if [ -z "$(git status --porcelain)" ]; then
        status="CLEAN"
    else
        status="DIRTY"
    fi
    printInfo "Repository" "$status"

    remote_url=$(git remote get-url origin 2>/dev/null)
    printInfo "Remote" "${remote_url:-Not configured}"
}

###
# Retrieves and prints the versions of required command-line tools.
###
getVersions() {
    local node_ver npm_ver git_ver clasp_ver

    if command -v node &> /dev/null; then
        node_ver=$(node --version)
    else
        node_ver="Not installed"
    fi
    printInfo "Node.js" "$node_ver"

    if command -v npm &> /dev/null; then
        npm_ver=$(npm --version)
    else
        npm_ver="Not installed"
    fi
    printInfo "npm" "$npm_ver"

    if command -v git &> /dev/null; then
        # Extracts just the version number from 'git version 2.51.0.windows.1'
        git_ver=$(git --version | awk '{print $3}')
    else
        git_ver="Not installed"
    fi
    printInfo "Git" "$git_ver"

    if command -v clasp &> /dev/null; then
        clasp_ver=$(clasp --version)
    else
        clasp_ver="Not installed"
    fi
    printInfo "CLASP" "$clasp_ver"
}

###
# Reads and prints the Apps Script ID from .clasp.json.
###
getScriptId() {
    local script_id="Not found"
    if [ -f ".clasp.json" ]; then
        # Use grep and cut to extract the ID without needing a JSON parser like jq
        id_val=$(grep -o '"scriptId": *"[^"]*"' .clasp.json | cut -d'"' -f4)
        if [ -n "$id_val" ]; then
            script_id="$id_val"
        fi
    fi
    printInfo "Script ID" "$script_id"
}

###
# Main function to run all information gathering functions in sequence.
###
main() {
    printHeader

    # --- Application & Environment ---
    printInfo "Application" "$APP_NAME"
    printInfo "Application Version" "$APP_VERSION"
    getEnvironment
    echo ""

    # --- Git Repository Details ---
    getGitInfo
    echo ""

    # --- Toolchain Versions ---
    getVersions
    echo ""

    # --- Project Configuration ---
    getScriptId
    printInfo "Directory" "$PWD"
    printInfo "Generated" "$(date +'%Y-%m-%d %H:%M')"
    echo ""

    echo "===================================================="

    # This script is for information purposes and should always exit successfully.
    exit 0
}

# --- Script Entry Point ---
main