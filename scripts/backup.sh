#!/bin/bash

# ==============================================================================
# WK COMMUNITY OS PROJECT BACKUP
#
# Description:
#   Creates a complete project backup before deployment. This script is
#   intended to be a mandatory first step before deploy.sh and release.sh.
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
BACKUP_ROOT="$PROJECT_ROOT/backups"
TIMESTAMP=$(date +'%Y-%m-%d_%H-%M-%S')
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
BACKUP_LOG_FILE="$BACKUP_DIR/logs/backup.log"

# Summary variables, initialized to N/A
TOTAL_BACKUP_SIZE="N/A"
TOTAL_BACKUP_FILES="N/A"
COMPRESSED_STATUS="NO"
BACKUP_ZIP_FILE="N/A"

# Exit status for the script. 0 = success, 1 = critical failure.
SCRIPT_EXIT_STATUS=0

# --- Functions ---

###
# Prints the main header for the script output.
###
printHeader() {
    echo "================================================="
    echo -e "${CYAN}WK COMMUNITY OS PROJECT BACKUP${NC}"
    echo "================================================="
    echo ""
}

###
# Prints a formatted key-value pair.
# @param $1 - The key/label.
# @param $2 - The value.
###
printInfo() {
    printf "%-20s %s\n" "$1" "$2"
}

###
# Creates the necessary backup directory structure within the timestamped folder.
# Exits with an error if critical folders cannot be created.
###
createFolders() {
    echo "Creating backup directories..."
    mkdir -p "$BACKUP_ROOT" || { echo -e "${RED}Error: Failed to create $BACKUP_ROOT${NC}"; SCRIPT_EXIT_STATUS=1; return 1; }
    mkdir -p "$BACKUP_DIR/config" || { echo -e "${RED}Error: Failed to create $BACKUP_DIR/config${NC}"; SCRIPT_EXIT_STATUS=1; return 1; }
    mkdir -p "$BACKUP_DIR/source" || { echo -e "${RED}Error: Failed to create $BACKUP_DIR/source${NC}"; SCRIPT_EXIT_STATUS=1; return 1; }
    mkdir -p "$BACKUP_DIR/docs"   || { echo -e "${RED}Error: Failed to create $BACKUP_DIR/docs${NC}"; SCRIPT_EXIT_STATUS=1; return 1; }
    mkdir -p "$BACKUP_DIR/logs"   || { echo -e "${RED}Error: Failed to create $BACKUP_DIR/logs${NC}"; SCRIPT_EXIT_STATUS=1; return 1; }
    echo -e "${GREEN}Backup directories created: $BACKUP_DIR${NC}"
    return 0
}

###
# Backs up specified configuration files and all other .md files from the project root.
# Missing files are gracefully skipped with a warning.
###
backupConfigs() {
    echo "Backing up configuration files..."
    local config_files=(
        "appsscript.json"
        ".clasp.json"
        "README.md"
        "ARCHITECTURE.md"
        "CHANGELOG.md"
        "DEVELOPER_GUIDE.md"
        "FRAMEWORK_OVERVIEW.md"
        "MODULES.md"
    )
    local copied_count=0

    for file in "${config_files[@]}"; do
        if [ -f "$PROJECT_ROOT/$file" ]; then
            cp -f "$PROJECT_ROOT/$file" "$BACKUP_DIR/config/"
            ((copied_count++))
        else
            echo -e "${YELLOW}Warning: Configuration file '$file' not found. Skipping.${NC}"
        fi
    done

    # Backup all other *.md files in the project root that were not explicitly listed
    for file in "$PROJECT_ROOT"/*.md; do
        local filename=$(basename "$file")
        # Check if file exists and is not already in config_files array
        if [ -f "$file" ] && ! printf '%s\n' "${config_files[@]}" | grep -q -w "$filename"; then
            cp -f "$file" "$BACKUP_DIR/config/"
            ((copied_count++))
        fi
    done
    echo -e "${GREEN}Backed up $copied_count configuration files.${NC}"
}

###
# Backs up project source code, scripts, tests, assets, and release directories.
# Includes an optional 'clasp pull' before copying to ensure the latest Apps Script source.
# Missing directories/files are gracefully skipped with a warning.
###
backupSources() {
    echo "Backing up project source and related directories..."

    # Attempt clasp pull if clasp is available
    if command -v clasp &> /dev/null; then
        echo -e "${YELLOW}Attempting 'clasp pull' to get latest Apps Script source...${NC}"
        # Redirect clasp output to a log file within the backup
        clasp pull --rootDir "$PROJECT_ROOT" &> "$BACKUP_DIR/logs/clasp_pull.log"
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}Warning: 'clasp pull' failed. See '$BACKUP_DIR/logs/clasp_pull.log' for details.${NC}"
            echo "Warning: 'clasp pull' failed. See '$BACKUP_DIR/logs/clasp_pull.log' for details." >> "$BACKUP_LOG_FILE"
        else
            echo -e "${GREEN}'clasp pull' successful.${NC}"
        fi
    else
        echo -e "${YELLOW}Warning: 'clasp' command not found. Skipping 'clasp pull'.${NC}"
        echo "Warning: 'clasp' command not found. Skipping 'clasp pull'." >> "$BACKUP_LOG_FILE"
    fi

    local source_dirs=(
        "scripts"
        "src"
        "tests"
        "assets"
        "release"
    )
    local source_files_patterns=(
        "*.js"
        "*.gs"
        "*.html"
    )
    local copied_count=0

    # Copy specified directories into the 'source' backup folder
    for dir in "${source_dirs[@]}"; do
        if [ -d "$PROJECT_ROOT/$dir" ]; then
            cp -R "$PROJECT_ROOT/$dir" "$BACKUP_DIR/source/"
            ((copied_count++))
        else
            echo -e "${YELLOW}Warning: Source directory '$dir' not found. Skipping.${NC}"
        fi
    done

    # Copy root-level source files based on patterns into the 'source' backup folder
    for pattern in "${source_files_patterns[@]}"; do
        for file in "$PROJECT_ROOT/$pattern"; do
            if [ -f "$file" ]; then
                cp -f "$file" "$BACKUP_DIR/source/"
                ((copied_count++))
            fi
        done
    done

    # Copy the 'docs' directory into its dedicated backup folder
    if [ -d "$PROJECT_ROOT/docs" ]; then
        cp -R "$PROJECT_ROOT/docs" "$BACKUP_DIR/docs/"
        echo -e "${GREEN}Backed up 'docs/' directory.${NC}"
    else
        echo -e "${YELLOW}Warning: Directory 'docs/' not found. Skipping.${NC}"
    fi

    echo -e "${GREEN}Backed up $copied_count source directories/files (excluding docs/).${NC}"
}

###
# Generates the backup log file with relevant project and backup information.
# This function populates global summary variables.
###
backupLog() {
    echo "Generating backup log..."
    {
        echo "--- WK Community OS Backup Log ---"
        echo "Timestamp: $(date +'%Y-%m-%d %H:%M:%S')"
        echo "Project Root: $PROJECT_ROOT"
        echo "Backup Directory: $BACKUP_DIR"
        echo ""

        echo "--- Git Information ---"
        if git rev-parse --is-inside-work-tree &> /dev/null; then
            echo "Git Branch: $(git rev-parse --abbrev-ref HEAD)"
            echo "Latest Commit: $(git rev-parse --short HEAD)"
            echo "Latest Commit Date: $(git log -1 --format=%cd --date=format:'%Y-%m-%d %H:%M:%S')"
            echo "Latest Tag: $(git describe --tags --abbrev=0 2>/dev/null || echo "No tag found")"
            if [ -z "$(git status --porcelain)" ]; then
                echo "Repository Status: CLEAN"
            else
                echo "Repository Status: DIRTY"
            fi
        else
            echo "Not a Git repository."
        fi
        echo ""

        echo "--- CLASP Information ---"
        local script_id="Not found"
        if [ -f "$PROJECT_ROOT/.clasp.json" ]; then
            # Extract scriptId using grep and cut, avoiding external JSON parsers
            id_val=$(grep -o '"scriptId": *"[^"]*"' "$PROJECT_ROOT/.clasp.json" | cut -d'"' -f4)
            if [ -n "$id_val" ]; then
                script_id="$id_val"
            fi
        fi
        echo "Script ID: $script_id"
        echo ""

        echo "--- Backup Statistics ---"
        TOTAL_BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
        TOTAL_BACKUP_FILES=$(find "$BACKUP_DIR" -type f 2>/dev/null | wc -l)
        echo "Backup Size: $TOTAL_BACKUP_SIZE"
        echo "Total Files: $TOTAL_BACKUP_FILES"
        echo "Compressed: $COMPRESSED_STATUS" # This will be updated later if compression happens
        echo "------------------------------------"
    } > "$BACKUP_LOG_FILE"
    echo -e "${GREEN}Backup log generated: $BACKUP_LOG_FILE${NC}"
}

###
# Compresses the created backup directory into a zip file if the 'zip' command is available.
# Updates global summary variables accordingly.
###
compressBackup() {
    echo "Attempting to compress backup..."
    if command -v zip &> /dev/null; then
        BACKUP_ZIP_FILE="$BACKUP_ROOT/backup_$TIMESTAMP.zip"
        # Change directory to BACKUP_ROOT to zip the timestamped folder directly
        (cd "$BACKUP_ROOT" && zip -r "$BACKUP_ZIP_FILE" "$TIMESTAMP" &> /dev/null)
        if [ $? -eq 0 ]; then
            COMPRESSED_STATUS="${GREEN}YES${NC}"
            echo -e "${GREEN}Backup compressed to $BACKUP_ZIP_FILE${NC}"
            # Update log with compressed status
            # Using sed -i for in-place edit, compatible with Git Bash
            sed -i "s/Compressed: NO/Compressed: YES/" "$BACKUP_LOG_FILE"
        else
            COMPRESSED_STATUS="${YELLOW}NO (Compression failed)${NC}"
            echo -e "${YELLOW}Warning: Compression failed. Backup remains as folder.${NC}"
            echo "Warning: Compression failed." >> "$BACKUP_LOG_FILE"
        fi
    else
        COMPRESSED_STATUS="${YELLOW}NO ('zip' command not found)${NC}"
        echo -e "${YELLOW}Warning: 'zip' command not found. Backup will not be compressed.${NC}"
        echo "Warning: 'zip' command not found. Backup will not be compressed." >> "$BACKUP_LOG_FILE"
    fi
}

###
# Prints the final summary of the backup operation, including key statistics.
###
printSummary() {
    echo ""
    echo "================================================="
    echo -e "${GREEN}BACKUP COMPLETE${NC}"
    echo "================================================="
    printInfo "Backup Folder" "$BACKUP_DIR"
    printInfo "Backup Size" "$TOTAL_BACKUP_SIZE"
    printInfo "Files" "$TOTAL_BACKUP_FILES"
    # Check if COMPRESSED_STATUS contains a success message, not a warning
    if [[ "$COMPRESSED_STATUS" == *"${GREEN}YES"* ]]; then
        printInfo "Compressed" "$COMPRESSED_STATUS"
        printInfo "Zip File" "$(basename "$BACKUP_ZIP_FILE")"
    else
        printInfo "Compressed" "$COMPRESSED_STATUS"
    fi
    echo "================================================="
    echo ""
}

###
# Main function to orchestrate the entire backup process.
# Calls all other functions in sequence and handles critical exit conditions.
###
main() {
    printHeader

    # Exit immediately if critical folder creation fails
    createFolders || exit "$SCRIPT_EXIT_STATUS"

    backupConfigs
    backupSources
    backupLog # Generate log before compression to capture initial stats
    compressBackup
    printSummary

    exit "$SCRIPT_EXIT_STATUS"
}

# --- Script Entry Point ---
main