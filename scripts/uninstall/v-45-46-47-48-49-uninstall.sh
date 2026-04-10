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

GDM_USER_FILES=(
    "/var/lib/gdm/.config/dconf/user"
    "/var/lib/gdm/seat0/config/dconf/user"
)

# ----------------------------
# Helpers
# ----------------------------
log() { echo -e "\t$1"; }
error_exit() { echo "Error: $1"; exit 1; }

# ----------------------------
# Checks
# ----------------------------
command -v dconf >/dev/null 2>&1 || error_exit "dconf is required but not installed"

printf "\n\n\t~~~~ GNOME 45–49 Uninstaller ~~~~\n"
log "Running uninstall script..."

# ----------------------------
# Remove extension
# ----------------------------
if [[ -d "$EXT_DIR" ]]; then
    log "1. Removing $EXT_DIR"
    rm -rf "$EXT_DIR"
else
    log "1. Extension directory not found"
fi

# ----------------------------
# Remove dconf file
# ----------------------------
if [[ -f "$DCONF_FILE" ]]; then
    log "2. Removing $DCONF_FILE"
    rm -f "$DCONF_FILE"
else
    log "2. dconf file not found"
fi

# ----------------------------
# Update dconf
# ----------------------------
if [[ -d "$DCONF_DB_DIR" ]]; then
    log "3. Updating dconf database"
    dconf update
fi

# ----------------------------
# Clean GDM user dconf
# ----------------------------
for file in "${GDM_USER_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log "4. Removing $file"
        rm -f "$file"
    fi
done

log "Uninstallation complete!"