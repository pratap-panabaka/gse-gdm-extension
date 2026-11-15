#!/bin/bash

set -euo pipefail

# Configuration

EXTENSION_NAME="gdm-extension@pratap.fastmail.fm"
DB_NAME="gdmextensionbypratappanabaka"

DCONF_PROFILE_PATH="/etc/dconf/profile/gdm"
DB_DIR="/etc/dconf/db/${DB_NAME}.d"

# Root privilege check

if [[ $EUID -ne 0 ]]; then
    echo "Error: Please run this script using sudo."
    exit 1
fi

# Remove extension-related files

find /etc /var -type f -name "$DB_NAME" -delete

echo "Removed extension-related database files."

# Remove dconf configuration directory

if [[ -d "$DB_DIR" ]]; then
    rm -rf "$DB_DIR"
fi

echo "Removed dconf configuration directory."

# Remove GDM dconf profile

if [[ -f "$DCONF_PROFILE_PATH" ]]; then
    rm -f "$DCONF_PROFILE_PATH"
fi

echo "Removed GDM dconf profile."

# Remove GNOME Shell extension

find /usr/local/share/gnome-shell/extensions \
    -type d \
    -name "$EXTENSION_NAME" \
    -prune \
    -exec rm -rf {} + 2>/dev/null || true

echo "Removed GNOME Shell extension."

# Update dconf database

dconf update

echo "-----------------------------------------"
echo "GDM extension uninstallation completed!"
echo "-----------------------------------------"

