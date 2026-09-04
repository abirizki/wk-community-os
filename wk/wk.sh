#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPTS_DIR="$ROOT_DIR/scripts"

usage() {
  cat <<'EOF'
WK Community OS - Native CLI

Usage:
  wk <command> [options]

Commands:
  doctor        Run environment health checks
  version       Show project version and environment info
  deploy        Deploy the project via clasp
  backup        Run backup workflow
  restore       Run restore workflow
  release       Run release workflow
  smoke         Run post-deployment smoke tests
  help          Show this help message
EOF
}

run_command() {
  case "${1:-help}" in
    doctor)
      bash "$SCRIPTS_DIR/doctor.sh"
      ;;
    version)
      bash "$SCRIPTS_DIR/version.sh"
      ;;
    deploy)
      bash "$SCRIPTS_DIR/deploy.sh"
      ;;
    backup)
      bash "$SCRIPTS_DIR/backup.sh"
      ;;
    restore)
      bash "$SCRIPTS_DIR/restore.sh"
      ;;
    release)
      bash "$SCRIPTS_DIR/release.sh"
      ;;
    smoke)
      bash "$SCRIPTS_DIR/smoketest.sh"
      ;;
    help|-h|--help)
      usage
      ;;
    *)
      echo "Unknown command: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
}

run_command "$@"
