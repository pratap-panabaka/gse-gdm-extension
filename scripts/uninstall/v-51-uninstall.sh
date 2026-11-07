
#!/bin/bash
set -e

# ----------------------------
# Configuration
# ----------------------------
NAME="gdm-extension"
DOMAIN="pratap.fastmail.fm"
UUID="$NAME@$DOMAIN"

EXT_DIR="/usr/local/share/gnome-shell/extensions/$UUID"

DCONF_DB_DIR="/etc/dconf/db/gdm.d"
DCONF_FILE="$DCONF_DB_DIR/99-gdm-extension"

# ----------------------------
# Helpers
# ----------------------------
log() {
    echo -e "\t$1"
}

error_exit() {
    echo "Error: $1"
    exit 1
}

# ----------------------------
# Root Check
# ----------------------------
if [[ "$EUID" -ne 0 ]]; then
    error_exit "You must be root to perform this action"
fi

# ----------------------------
# Dependencies
# ----------------------------
command -v dconf >/dev/null 2>&1 ||
    error_exit "dconf is required but not installed"

printf "\n\n\t~~~~ GNOME 51 Uninstaller ~~~~\n"

log "Running uninstall script..."

# ----------------------------
# Remove Extension
# ----------------------------
if [[ -d "$EXT_DIR" ]]; then

    log "1. Removing extension directory..."

    rm -rf "$EXT_DIR"

else
    log "1. Extension directory not found. Skipping..."
fi

# ----------------------------
# Remove GDM Extension dconf Configuration
# ----------------------------
if [[ -f "$DCONF_FILE" ]]; then

    log "2. Removing GDM extension dconf configuration..."

    rm -f "$DCONF_FILE"

else
    log "2. GDM extension dconf configuration not found. Skipping..."
fi

# ----------------------------
# Update dconf Database
# ----------------------------
if [[ -d "$DCONF_DB_DIR" ]]; then

    log "3. Updating dconf database..."

    dconf update

else
    log "3. GDM dconf database directory not found. Skipping..."
fi

# ----------------------------
# Preserve GDM User dconf
# ----------------------------
log "4. Preserving existing GDM user dconf database..."

# The GDM user database may contain unrelated preferences.
# Do not remove it during uninstallation.

# ----------------------------
# Completion
# ----------------------------
echo
log "GNOME 51 extension uninstallation completed!"
echo
echo "A system reboot is recommended."
echo

