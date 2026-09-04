#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS PROJECT RESTORE
#
# Description:
#   Safely restores the WK Community OS project from a previous backup.
#   This script is designed to support rollbacks after failed deployments.
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
BACKUP_ROOT="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/restore.log"

# Restore state variables
SELECTED_BACKUP_PATH=""
RESTORE_STATUS="${RED}FAILED${NC}" # Default to FAILED
FILES_RESTORED_COUNT=0

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo -e "${CYAN}WK COMMUNITY OS PROJECT RESTORE UTILITY${NC}"
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
# Lists all available backup directories.
# @return 0 if backups are found, 1 otherwise.
###
listBackups() {
    printStep "Available Backups"
    if [ ! -d "$BACKUP_ROOT" ]; then
        echo -e "${RED}Error: Backup directory '$BACKUP_ROOT' not found.${NC}"
        return 1
    fi

    # Store backup directories in an array
    mapfile -t backups < <(find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -printf "%f\n" | sort -r)

    if [ ${#backups[@]} -eq 0 ]; then
        echo -e "${YELLOW}No backups found in '$BACKUP_ROOT'.${NC}"
        return 1
    fi

    echo "Please select a backup to restore:"
    for i in "${!backups[@]}"; do
        printf "  %2d) %s\n" "$((i+1))" "${backups[$i]}"
    done
    echo ""
    return 0
}

###
# Prompts the user to select a backup from the list.
# Sets the global SELECTED_BACKUP_PATH variable.
# @return 0 on valid selection, 1 on invalid selection or cancellation.
###
selectBackup() {
    local selection
    read -p "Select backup number: " selection

    # Validate that the selection is a number and within the array bounds
    if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#backups[@]} ]; then
        SELECTED_BACKUP_PATH="$BACKUP_ROOT/${backups[$((selection-1))]}"
        echo -e "You have selected: ${GREEN}${backups[$((selection-1))]}${NC}"
        return 0
    else
        echo -e "${RED}Invalid selection. Aborting.${NC}"
        return 1
    fi
}

###
# Displays information from the selected backup's log file.
###
showBackupInfo() {
    printStep "Backup Information"
    local backup_log="$SELECTED_BACKUP_PATH/logs/backup.log"

    if [ -f "$backup_log" ]; then
        echo "----------------------------------------"
        # Use grep to extract and display key info
        grep -E "Timestamp:|Git Branch:|Latest Commit:|Latest Tag:|Backup Size:|Total Files:|Script ID:" "$backup_log"
        echo "----------------------------------------"
    else
        echo -e "${YELLOW}Warning: 'backup.log' not found in the selected backup. Cannot display details.${NC}"
    fi
}

###
# Asks the user for final confirmation before starting the restore.
# @return 0 if confirmed, 1 if canceled.
###
confirmRestore() {
    local confirm
    read -p "Restore this backup? This will overwrite current project files. (Y/N) [N]: " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${RED}Restore CANCELED by user.${NC}"
        return 1
    fi
    return 0
}

###
# Creates a backup of the current state before overwriting anything.
# @return 0 on success, 1 on failure.
###
createRestorePoint() {
    printStep "Creating Pre-Restore Backup"
    echo "Backing up the current project state before restoring..."
    if [ ! -f "$SCRIPTS_DIR/backup.sh" ]; then
        echo -e "${RED}Error: 'backup.sh' not found. Cannot create restore point.${NC}"
        return 1
    fi

    bash "$SCRIPTS_DIR/backup.sh"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Restore STOPPED: Failed to create a pre-restore backup.${NC}"
        return 1
    fi
    echo -e "${GREEN}Restore point created successfully.${NC}"
    return 0
}

###
# Restores files from the backup to the project root.
###
restoreFiles() {
    printStep "Restoring Files"
    local backup_source_dir="$SELECTED_BACKUP_PATH/source"
    local backup_config_dir="$SELECTED_BACKUP_PATH/config"
    local backup_docs_dir="$SELECTED_BACKUP_PATH/docs"

    # Use cp -a to preserve permissions and handle directories recursively.
    # The trailing slash on the source is important to copy contents, not the directory itself.
    
    echo "Restoring configurations..."
    [ -d "$backup_config_dir" ] && cp -a "$backup_config_dir/." "$PROJECT_ROOT/" && FILES_RESTORED_COUNT=$((FILES_RESTORED_COUNT + $(ls -1 "$backup_config_dir" | wc -l)))

    echo "Restoring source code, scripts, assets, etc..."
    [ -d "$backup_source_dir" ] && cp -a "$backup_source_dir/." "$PROJECT_ROOT/" && FILES_RESTORED_COUNT=$((FILES_RESTORED_COUNT + $(ls -1 "$backup_source_dir" | wc -l)))

    echo "Restoring documentation..."
    [ -d "$backup_docs_dir" ] && cp -a "$backup_docs_dir/." "$PROJECT_ROOT/" && FILES_RESTORED_COUNT=$((FILES_RESTORED_COUNT + $(ls -1 "$backup_docs_dir" | wc -l)))

    echo -e "${GREEN}File restore process complete.${NC}"
}

###
# Asks the user if they want to push the restored code to Apps Script.
###
pushAppsScript() {
    printStep "Push to Google Apps Script"
    if ! command -v clasp &> /dev/null; then
        echo -e "${YELLOW}Warning: 'clasp' command not found. Skipping push to Apps Script.${NC}"
        return
    fi

    local push_confirm
    read -p "Push restored source to Google Apps Script? (Y/N) [N]: " push_confirm
    if [[ "$push_confirm" =~ ^[Yy]$ ]]; then
        echo "Running 'clasp push'..."
        local output
        output=$(clasp push --rootDir "$PROJECT_ROOT" 2>&1)
        if [ $? -ne 0 ]; then
            echo -e "${RED}Error: 'clasp push' failed.${NC}"
            echo -e "------------------- CLASP OUTPUT -------------------"
            echo "$output"
            echo -e "----------------------------------------------------"
            echo -e "${YELLOW}Warning: Local files were restored, but push to Apps Script failed.${NC}"
        else
            echo -e "${GREEN}'clasp push' successful.${NC}"
        fi
    else
        echo "Skipping push to Apps Script."
    fi
}

###
# Writes a log entry for the restore operation.
###
writeLog() {
    printStep "Writing Restore Log"
    {
        echo "--- Restore Log Entry ---"
        echo "Restore Time: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Backup Used: $(basename "$SELECTED_BACKUP_PATH")"
        if git rev-parse --is-inside-work-tree &> /dev/null; then
            echo "Current Git Branch: $(git rev-parse --abbrev-ref HEAD)"
            echo "Current Commit: $(git rev-parse --short HEAD)"
        fi
        echo "Files Restored (approx): $FILES_RESTORED_COUNT"
        echo "Result: ${RESTORE_STATUS}"
        echo "-------------------------"
        echo ""
    } >> "$LOG_FILE"
    echo -e "${GREEN}Log entry written to $LOG_FILE${NC}"
}

###
# Prints the final summary of the restore operation.
###
printSummary() {
    echo ""
    echo "========================================"
    echo -e "   RESTORE ${RESTORE_STATUS}"
    echo "========================================"
    printf "%-15s: %s\n" "Backup Used" "$(basename "$SELECTED_BACKUP_PATH")"
    printf "%-15s: %s\n" "Files Restored" "$FILES_RESTORED_COUNT (approx)"
    printf "%-15s: %b\n" "Result" "$RESTORE_STATUS"
    echo "========================================"
    echo ""
}

###
# Main function to orchestrate the entire restore process.
###
main() {
    trap 'if [ "$RESTORE_STATUS" != "${GREEN}COMPLETE${NC}" ]; then writeLog; fi' EXIT

    printHeader

    listBackups || exit 1
    selectBackup || exit 1
    showBackupInfo
    confirmRestore || exit 1
    createRestorePoint || exit 1
    
    restoreFiles
    pushAppsScript

    # If we reach this point, the restore was successful
    RESTORE_STATUS="${GREEN}COMPLETE${NC}"

    trap - EXIT
    writeLog
    printSummary

    exit 0
}

# --- Script Entry Point ---
main