#!/bin/bash

set -euo pipefail

# -----------------------------------------
# Configuration
# -----------------------------------------

EXTENSION_NAME="gdm-extension@pratap.fastmail.fm"
DB_NAME="gdmextensionbypratappanabaka"

SOURCE_PROFILE="/usr/share/dconf/profile/gdm"
DCONF_PROFILE_PATH="/etc/dconf/profile/gdm"

DB_DIR="/etc/dconf/db/${DB_NAME}.d"
DB_CONFIG_FILE="${DB_DIR}/99-gdm-extension"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE_DIR="${SCRIPT_DIR}/src"

EXTENSION_INSTALL_DIR="/usr/local/share/gnome-shell/extensions/${EXTENSION_NAME}"

# -----------------------------------------
# Root privilege check
# -----------------------------------------

if [[ $EUID -ne 0 ]]; then
    echo "Error: Please run this script using sudo."
    exit 1
fi

# -----------------------------------------
# Dependency check
# -----------------------------------------

if ! command -v dconf >/dev/null 2>&1; then
    echo "Error: dconf is not installed."
    exit 1
fi

if ! command -v gnome-shell >/dev/null 2>&1; then
    echo "Error: GNOME Shell is not installed or not available in PATH."
    exit 1
fi

# -----------------------------------------
# Detect GNOME Shell version
# -----------------------------------------

GNOME_SHELL_VERSION_OUTPUT="$(gnome-shell --version 2>/dev/null || true)"

if [[ "$GNOME_SHELL_VERSION_OUTPUT" =~ ([0-9]+)\. ]]; then
    GNOME_SHELL_VERSION="${BASH_REMATCH[1]}"
else
    echo "Error: Unable to detect GNOME Shell version."
    echo "Detected output: ${GNOME_SHELL_VERSION_OUTPUT:-No version information}"
    exit 1
fi

echo "Detected GNOME Shell version: ${GNOME_SHELL_VERSION}"

# -----------------------------------------
# Select compatible extension source
# -----------------------------------------

case "$GNOME_SHELL_VERSION" in
    42|43|44)
        VERSION_SOURCE_DIR="${SOURCE_DIR}/v-42-43-44"
        ;;

    45|46|47|48|49|50|51)
        VERSION_SOURCE_DIR="${SOURCE_DIR}/v-45-46-47-48-49-50-51"
        ;;

    *)
        echo "Error: Unsupported GNOME Shell version: ${GNOME_SHELL_VERSION}"
        echo "Supported versions: GNOME Shell 42 to 51."
        exit 1
        ;;
esac

if [[ ! -d "$VERSION_SOURCE_DIR" ]]; then
    echo "Error: Extension source directory not found:"
    echo "$VERSION_SOURCE_DIR"
    exit 1
fi

echo "Selected extension source: ${VERSION_SOURCE_DIR}"

# -----------------------------------------
# Extract file-db entry (optional)
# -----------------------------------------

FILE_DB=""

if [[ -f "$SOURCE_PROFILE" ]]; then
    FILE_DB="$(grep '^file-db:' "$SOURCE_PROFILE" || true)"
fi

# -----------------------------------------
# Create GDM dconf profile
# -----------------------------------------

mkdir -p "$(dirname "$DCONF_PROFILE_PATH")"

TEMP_PROFILE="$(mktemp "$(dirname "$DCONF_PROFILE_PATH")/.gdm.XXXXXX")"

{
    echo "user-db:${DB_NAME}"
    echo "system-db:${DB_NAME}"

    if [[ -n "$FILE_DB" ]]; then
        echo "$FILE_DB"
    fi
} > "$TEMP_PROFILE"

chmod 644 "$TEMP_PROFILE"

mv "$TEMP_PROFILE" "$DCONF_PROFILE_PATH"

echo "GDM dconf profile created."

# -----------------------------------------
# Create dconf database directory
# -----------------------------------------

mkdir -p "$DB_DIR"

# -----------------------------------------
# Create extension configuration
# -----------------------------------------

cat > "$DB_CONFIG_FILE" <<EOF
[org/gnome/shell]
enabled-extensions=['${EXTENSION_NAME}']

[org/gnome/shell/extensions/gdm-extension]
hide-gdm-extension-button=false
EOF

chmod 644 "$DB_CONFIG_FILE"

echo "GDM extension configuration created."

# -----------------------------------------
# Update dconf database
# -----------------------------------------

dconf update

echo "GDM dconf database updated."

# -----------------------------------------
# Install GDM extension files
# -----------------------------------------

mkdir -p "$EXTENSION_INSTALL_DIR"

cp -a "$VERSION_SOURCE_DIR/." "$EXTENSION_INSTALL_DIR/"

echo "GDM extension files copied successfully."

# -----------------------------------------
# Installation completed
# -----------------------------------------

echo "-----------------------------------------"
echo "GDM extension installation completed!"
echo "GNOME Shell version: ${GNOME_SHELL_VERSION}"
echo "Extension source: ${VERSION_SOURCE_DIR}"
echo "Installation path: ${EXTENSION_INSTALL_DIR}"
echo "-----------------------------------------"
