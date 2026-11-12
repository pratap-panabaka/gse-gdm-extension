#!/usr/bin/env bash

# Shared GNOME Shell extension manager.
# Intended to be sourced by install.sh and uninstall.sh.

# --------------------------------------------------
# Configuration
# --------------------------------------------------

EXTENSION_NAME="${EXTENSION_NAME:-gdm-extension}"
EXTENSION_DOMAIN="${EXTENSION_DOMAIN:-pratap.fastmail.fm}"

EXTENSION_UUID="${EXTENSION_UUID:-$EXTENSION_NAME@$EXTENSION_DOMAIN}"

EXTENSION_INSTALL_DIR="${EXTENSION_INSTALL_DIR:-/usr/local/share/gnome-shell/extensions}"

EXTENSION_DIR="$EXTENSION_INSTALL_DIR/$EXTENSION_UUID"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

extension_log() {
    printf '\t%s\n' "$1"
}

extension_error() {
    printf 'Error: %s\n' "$1" >&2
    return 1
}

# --------------------------------------------------
# Check root privileges
# --------------------------------------------------

check_extension_permissions() {
    if [[ "$EUID" -ne 0 ]]; then
        extension_error "Root privileges are required to manage system extensions."
        return 1
    fi
}

# --------------------------------------------------
# Validate extension source
# --------------------------------------------------

validate_extension_source() {
    local src_dir="$1"
    local metadata_file

    if [[ -z "$src_dir" || ! -d "$src_dir" ]]; then
        extension_error "Extension source directory not found: $src_dir"
        return 1
    fi

    metadata_file="$src_dir/metadata.json"

    if [[ ! -f "$metadata_file" ]]; then
        extension_error "metadata.json not found in $src_dir"
        return 1
    fi

    if ! grep -Eq '"uuid"[[:space:]]*:[[:space:]]*"[^"]+"' "$metadata_file"; then
        extension_error "Invalid or missing UUID in metadata.json"
        return 1
    fi

    if ! grep -Fq "\"uuid\": \"$EXTENSION_UUID\"" "$metadata_file"; then
        # Allow different JSON whitespace formatting.
        if ! grep -Eq "\"uuid\"[[:space:]]*:[[:space:]]*\"$EXTENSION_UUID\"" "$metadata_file"; then
            extension_error "Extension UUID does not match $EXTENSION_UUID"
            return 1
        fi
    fi

    extension_log "Extension source validated."
}

# --------------------------------------------------
# Compile extension schemas
# --------------------------------------------------

compile_extension_schemas() {
    local ext_dir="$1"
    local schema_dir="$ext_dir/schemas"

    if [[ ! -d "$schema_dir" ]]; then
        extension_log "No extension schemas found. Skipping compilation."
        return 0
    fi

    if ! command -v glib-compile-schemas >/dev/null 2>&1; then
        extension_error "glib-compile-schemas is required but not installed."
        return 1
    fi

    extension_log "Compiling extension schemas..."

    glib-compile-schemas "$schema_dir" || {
        extension_error "Failed to compile extension schemas."
        return 1
    }
}

# --------------------------------------------------
# Install extension
# --------------------------------------------------

install_extension() {
    local src_dir="$1"
    local parent_dir
    local stage_dir
    local backup_dir=""

    check_extension_permissions || return 1
    validate_extension_source "$src_dir" || return 1

    if ! command -v cp >/dev/null 2>&1 ||
       ! command -v mv >/dev/null 2>&1; then
        extension_error "Required filesystem commands are unavailable."
        return 1
    fi

    parent_dir="$EXTENSION_INSTALL_DIR"

    mkdir -p "$parent_dir" || {
        extension_error "Unable to create extension installation directory."
        return 1
    }

    stage_dir=$(mktemp -d "$parent_dir/.${EXTENSION_UUID}.install.XXXXXX") || {
        extension_error "Unable to create temporary installation directory."
        return 1
    }

    extension_log "Preparing extension installation..."

    if ! cp -a "$src_dir/." "$stage_dir/"; then
        rm -rf "$stage_dir"
        extension_error "Failed to copy extension source."
        return 1
    fi

    if ! compile_extension_schemas "$stage_dir"; then
        rm -rf "$stage_dir"
        return 1
    fi

    # Back up the existing installation if present.
    if [[ -d "$EXTENSION_DIR" ]]; then
        backup_dir="${EXTENSION_DIR}.backup.$(date +%Y%m%d-%H%M%S)"

        extension_log "Backing up existing extension to $backup_dir"

        if ! mv "$EXTENSION_DIR" "$backup_dir"; then
            rm -rf "$stage_dir"
            extension_error "Unable to back up existing extension."
            return 1
        fi
    fi

    # Move the staged extension into its final location.
    if ! mv "$stage_dir" "$EXTENSION_DIR"; then
        extension_error "Failed to install extension."

        # Restore previous installation.
        if [[ -n "$backup_dir" && -d "$backup_dir" ]]; then
            mv "$backup_dir" "$EXTENSION_DIR" ||
                extension_error "WARNING: Could not restore previous installation."
        fi

        rm -rf "$stage_dir"
        return 1
    fi

    extension_log "Extension installed successfully."
    extension_log "Installation directory: $EXTENSION_DIR"

    if [[ -n "$backup_dir" ]]; then
        extension_log "Previous installation backup: $backup_dir"
    fi
}

# --------------------------------------------------
# Uninstall extension
# --------------------------------------------------

uninstall_extension() {
    check_extension_permissions || return 1

    if [[ ! -d "$EXTENSION_DIR" ]]; then
        extension_log "Extension is not installed."
        return 0
    fi

    extension_log "Removing extension: $EXTENSION_UUID"

    rm -rf -- "$EXTENSION_DIR" || {
        extension_error "Failed to remove extension directory."
        return 1
    }

    extension_log "Extension uninstalled successfully."
}
