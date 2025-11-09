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
DCONF_PROFILE="/etc/dconf/profile/gdm"

# GDM user dconf files
GDM_USER_FILES=(
    "/var/lib/gdm/.config/dconf/user"
    "/var/lib/gdm/seat0/config/dconf/user"
)

# ----------------------------
# Helper Functions
# ----------------------------
log() { echo -e "\t$1"; }
error_exit() { echo -e "Error: $1"; exit 1; }

# ----------------------------
# Must be root
# ----------------------------
if [[ $(id -u) -ne 0 ]]; then
    error_exit "You must be root to perform this action"
fi

# ----------------------------
# Check required commands
# ----------------------------
for cmd in dconf; do
    command -v "$cmd" >/dev/null 2>&1 || error_exit "$cmd is required but not installed"
done

# ----------------------------
# Print header
# ----------------------------
printf "\n\n\t~~~~~~~~~~~~~~~ gdm-extension Uninstall ~~~~~~~~~~~~~~~\n"
log "Running uninstall script..."

# ----------------------------
# Step 1: Remove extension directory
# ----------------------------
if [[ -d "$EXT_DIR" ]]; then
    log "1. Removing extension directory $EXT_DIR"
    rm -rf "$EXT_DIR" || error_exit "Failed to remove $EXT_DIR"
else
    log "1. Extension directory not found, skipping"
fi

# ----------------------------
# Step 2: Remove GDM dconf file
# ----------------------------
if [[ -f "$DCONF_FILE" ]]; then
    log "2. Removing GDM extension dconf file $DCONF_FILE"
    rm -f "$DCONF_FILE" || error_exit "Failed to remove $DCONF_FILE"
else
    log "2. GDM extension dconf file not found, skipping"
fi

# ----------------------------
# Step 3: Update dconf database
# ----------------------------
if [[ -d "$DCONF_DB_DIR" ]]; then
    log "3. Updating dconf database"
    dconf update || error_exit "Failed to update dconf database"
    log "3. Dconf database updated successfully"
else
    log "3. Dconf database directory $DCONF_DB_DIR not found, skipping update"
fi

# ----------------------------
# Step 4: Remove GDM user dconf files
# ----------------------------
for file in "${GDM_USER_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log "4. Removing GDM user dconf file $file"
        rm -f "$file" || error_exit "Failed to remove $file"
    else
        log "4. GDM user dconf file $file not found, skipping"
    fi
done

# ----------------------------
# Completion message
# ----------------------------
log "gdm-extension has been uninstalled successfully."
printf "\n\t~~~~~~~~~~~~~~~~~~ Done ~~~~~~~~~~~~~~~~~~\n"

exit 0

