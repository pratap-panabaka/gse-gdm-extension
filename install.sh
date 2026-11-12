#!/usr/bin/env bash

set -Eeuo pipefail

# ==================================================
# GDM Extension Installer
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

GDM_DCONF_PROFILE="/etc/dconf/profile/gdm"
GDM_DCONF_PROFILE_NAME="gdm"

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
    "$COMMON_DIR/detect-gnome-version.sh" \
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

export GDM_DCONF_PROFILE
export GDM_DCONF_PROFILE_NAME

# --------------------------------------------------
# Check root privileges
# --------------------------------------------------

if [[ "$EUID" -ne 0 ]]; then
    error "Root privileges are required. Run: sudo ./install.sh"
fi

# --------------------------------------------------
# Check required commands
# --------------------------------------------------

check_dependencies() {
    local commands=(
        gnome-shell
        dconf
        glib-compile-schemas
        getent
        runuser
        awk
        cp
        mv
        mktemp
        date
    )

    local cmd

    for cmd in "${commands[@]}"; do
        command -v "$cmd" >/dev/null 2>&1 ||
            error "Required command not found: $cmd"
    done
}

# --------------------------------------------------
# Detect GNOME version
# --------------------------------------------------

detect_gnome_version || error "Unable to detect GNOME Shell version"

GNOME_SOURCE_DIR="$(get_gnome_source_directory)" ||
    error "Unsupported GNOME Shell version: $GNOME_VERSION"

SRC_DIR="$SCRIPT_DIR/src/$GNOME_SOURCE_DIR"

log "Detected GNOME Shell version: $GNOME_VERSION"
log "Using extension source: $SRC_DIR"

# --------------------------------------------------
# Validate source directory
# --------------------------------------------------

validate_extension_source "$SRC_DIR" ||
    error "Extension source validation failed"

# --------------------------------------------------
# Backup existing GDM extension configuration
# --------------------------------------------------

backup_gdm_configuration() {
    local config_file="$1"
    local backup_file

    if [[ ! -f "$config_file" ]]; then
        return 0
    fi

    backup_file="${config_file}.backup.$(date +%Y%m%d-%H%M%S).$$"

    cp -a "$config_file" "$backup_file" ||
        error "Unable to back up $config_file"

    log "Configuration backup created: $backup_file"
}

# --------------------------------------------------
# Configure GDM extension dconf settings
# --------------------------------------------------

configure_gdm_extension_settings() {
    local temp_file

    mkdir -p "$GDM_DCONF_DB_DIR" ||
        error "Unable to create GDM dconf database directory"

    backup_gdm_configuration "$GDM_DCONF_EXTENSION_FILE"

    temp_file="$(mktemp "$GDM_DCONF_DB_DIR/.gdm-extension.XXXXXX")" ||
        error "Unable to create temporary dconf configuration"

    cat > "$temp_file" <<EOF
[org/gnome/shell]
enabled-extensions=['$EXTENSION_UUID']
disable-user-extensions=false

[org/gnome/shell/extensions/$EXTENSION_NAME]
hide-gdm-extension-button=false
EOF

    chmod 644 "$temp_file" ||
        error "Unable to set dconf configuration permissions"

    mv "$temp_file" "$GDM_DCONF_EXTENSION_FILE" ||
        error "Unable to install GDM extension dconf configuration"

    log "GDM extension dconf settings configured."
}

# --------------------------------------------------
# Update GDM dconf database
# --------------------------------------------------

update_gdm_dconf_database() {
    log "Updating GDM dconf database..."

    dconf update ||
        error "Failed to update GDM dconf database"

    log "GDM dconf database updated successfully."
}

# --------------------------------------------------
# Main installation
# --------------------------------------------------

main() {
    log "========================================"
    log "       GDM Extension Installation"
    log "========================================"

    check_dependencies

    # 1. Configure GDM dconf profile.
    log "Step 1: Configuring GDM dconf profile..."

    configure_gdm_dconf_profile ||
        error "Failed to configure GDM dconf profile"

    # 2. Install extension files.
    log "Step 2: Installing GNOME Shell extension..."

    install_extension "$SRC_DIR" ||
        error "Extension installation failed"

    # 3. Configure extension settings.
    log "Step 3: Configuring GDM extension settings..."

    configure_gdm_extension_settings

    # 4. Compile/update GDM dconf database.
    log "Step 4: Updating GDM dconf database..."

    update_gdm_dconf_database

    # 5. Repair conflicting GDM user-level setting.
    log "Step 5: Checking GDM user dconf setting..."

    repair_gdm_user_dconf ||
        error "GDM user dconf repair failed"

    # 6. Installation completed.
    log "========================================"
    log "   Installation completed successfully"
    log "========================================"

    printf '\n'
    printf 'Extension UUID : %s\n' "$EXTENSION_UUID"
    printf 'GNOME Version  : %s\n' "$GNOME_VERSION"
    printf 'Install Path   : %s\n' "$EXTENSION_DIR"
    printf 'Source Path    : %s\n' "$SRC_DIR"
    printf '\n'

    log "Restart GDM or reboot to apply the changes."
}

main "$@"
