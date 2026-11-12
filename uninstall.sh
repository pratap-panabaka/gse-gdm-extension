#!/usr/bin/env bash

set -Eeuo pipefail

# ==================================================
# GDM Extension Uninstaller
# ==================================================

# --------------------------------------------------
# Configuration
# --------------------------------------------------

EXTENSION_NAME="gdm-extension"
EXTENSION_DOMAIN="pratap.fastmail.fm"
EXTENSION_UUID="${EXTENSION_NAME}@${EXTENSION_DOMAIN}"

EXTENSION_INSTALL_DIR="/usr/local/share/gnome-shell/extensions"

GDM_DCONF_DB_DIR="/etc/dconf/db/gdm.d"
GDM_DCONF_EXTENSION_FILE="$GDM_DCONF_DB_DIR/99-gdm-extension"

# --------------------------------------------------
# Script directories
# --------------------------------------------------

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COMMON_DIR="$SCRIPT_DIR/scripts/common"

# --------------------------------------------------
# Logging
# --------------------------------------------------

log() {
    printf '\n%s\n' "$1"
}

error() {
    printf '\nError: %s\n' "$1" >&2
    exit 1
}

# --------------------------------------------------
# Load shared helpers
# --------------------------------------------------

for helper in \
    "$COMMON_DIR/extension-manager.sh" \
    "$COMMON_DIR/gdm-dconf.sh"
do
    [[ -f "$helper" ]] || error "Required helper not found: $helper"
    source "$helper"
done

# --------------------------------------------------
# Configure shared helper variables
# --------------------------------------------------

export EXTENSION_NAME
export EXTENSION_DOMAIN
export EXTENSION_UUID
export EXTENSION_INSTALL_DIR

# --------------------------------------------------
# Check root privileges
# --------------------------------------------------

if [[ "$EUID" -ne 0 ]]; then
    error "Root privileges are required. Run: sudo ./uninstall.sh"
fi

# --------------------------------------------------
# Check required commands
# --------------------------------------------------

check_dependencies() {
    local commands=(
        dconf
        rm
        cp
        mktemp
    )

    local cmd

    for cmd in "${commands[@]}"; do
        command -v "$cmd" >/dev/null 2>&1 ||
            error "Required command not found: $cmd"
    done
}

# --------------------------------------------------
# Remove GDM extension dconf configuration
# --------------------------------------------------

remove_gdm_extension_settings() {
    local temp_backup=""

    if [[ ! -f "$GDM_DCONF_EXTENSION_FILE" ]]; then
        log "GDM extension dconf configuration not found."
        log "Skipping configuration removal."
    else
        log "Removing GDM extension dconf configuration..."

        # Keep a temporary copy so we can restore the file
        # if dconf compilation fails.
        temp_backup="$(mktemp)" ||
            error "Unable to create temporary configuration backup"

        cp -a "$GDM_DCONF_EXTENSION_FILE" "$temp_backup" ||
            error "Unable to back up GDM extension configuration"

        if ! rm -f -- "$GDM_DCONF_EXTENSION_FILE"; then
            rm -f "$temp_backup"
            error "Unable to remove GDM extension configuration"
        fi

        if ! dconf update; then
            log "WARNING: Failed to update GDM dconf database."
            log "Restoring previous extension configuration..."

            cp -a "$temp_backup" "$GDM_DCONF_EXTENSION_FILE" ||
                error "Unable to restore previous GDM configuration"

            rm -f "$temp_backup"

            dconf update ||
                log "WARNING: GDM dconf database could not be restored."

            error "GDM extension configuration removal failed"
        fi

        rm -f "$temp_backup"

        log "GDM extension dconf configuration removed."
        log "GDM dconf database updated successfully."
    fi

    # Keep the system dconf database synchronized even
    # when the extension configuration was already absent.
    if [[ ! -f "$GDM_DCONF_EXTENSION_FILE" ]]; then
        dconf update ||
            error "Failed to update GDM dconf database"
    fi
}

# --------------------------------------------------
# Remove GNOME Shell extension
# --------------------------------------------------

remove_extension_files() {
    log "Removing GNOME Shell extension..."

    uninstall_extension ||
        error "Failed to uninstall GNOME Shell extension"
}

# --------------------------------------------------
# Main uninstallation
# --------------------------------------------------

main() {
    log "========================================"
    log "       GDM Extension Uninstallation"
    log "========================================"

    check_dependencies

    # 1. Remove extension-specific GDM settings.
    log "Step 1: Removing GDM extension settings..."

    remove_gdm_extension_settings

    # 2. Remove extension files.
    log "Step 2: Removing GNOME Shell extension..."

    remove_extension_files

    # 3. Uninstallation completed.
    log "========================================"
    log "  Uninstallation completed successfully"
    log "========================================"

    printf '\n'
    printf 'Extension UUID : %s\n' "$EXTENSION_UUID"
    printf 'Install Path   : %s\n' "$EXTENSION_DIR"
    printf '\n'

    log "Restart GDM or reboot to apply the changes."
}

main "$@"
