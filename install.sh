#!/bin/bash
set -e

# ----------------------------
# Configuration
# ----------------------------
NAME="gdm-extension"
DOMAIN="pratap.fastmail.fm"
UUID="$NAME@$DOMAIN"
ZIP_NAME="$UUID.zip"

# GDM user dconf files to remove
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

# Check required commands
for cmd in gnome-shell zip unzip dconf glib-compile-schemas; do
    command -v "$cmd" >/dev/null 2>&1 || error_exit "$cmd is required but not installed"
done

# ----------------------------
# Detect GNOME Shell version
# ----------------------------
SHELL_VERSION=$(gnome-shell --version | awk '{print $3}' | cut -d. -f1)

if [[ $SHELL_VERSION -lt 42 ]]; then
    error_exit "This script is not for GNOME Shell versions below 42. Exiting."
fi

# ----------------------------
# Print header
# ----------------------------
printf "\n\n\t~~~~~~~~~~~~~~~~ gdm-extension ~~~~~~~~~~~~~~~~\n"
log "Running the script..."
log "1. GNOME Shell version $SHELL_VERSION detected"

# ----------------------------
# Select source directory
# ----------------------------
if [[ $SHELL_VERSION -ge 42 && $SHELL_VERSION -le 44 ]]; then
    SRC_DIR="src/v-42-43-44"
elif [[ $SHELL_VERSION -ge 45 && $SHELL_VERSION -le 49 ]]; then
    SRC_DIR="src/v-45-46-47-48-49"
else
    error_exit "Unsupported GNOME Shell version: $SHELL_VERSION"
fi

cd "$SRC_DIR" || error_exit "Source directory $SRC_DIR not found"

# ----------------------------
# Create ZIP file
# ----------------------------
log "2. Creating zip file from directory ${PWD##*/}"

if zip -qr "$ZIP_NAME" ./*; then
    log "3. Zip file created: $ZIP_NAME"
else
    error_exit "Failed to create zip file or directory is empty"
fi

# ----------------------------
# Install extension globally
# ----------------------------
EXT_DIR="/usr/local/share/gnome-shell/extensions/$UUID"
mkdir -p "$EXT_DIR"

log "4. Installing the extension to $EXT_DIR"
unzip -oq "$ZIP_NAME" -d "$EXT_DIR" || error_exit "Failed to unzip extension"
rm -f "$ZIP_NAME"

# ----------------------------
# Step 4b: Remove GDM user dconf files if they exist
# ----------------------------
for file in "${GDM_USER_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log "4b. Removing GDM user dconf file $file"
        rm -f "$file" || error_exit "Failed to remove $file"
    else
        log "4b. GDM user dconf file $file not found, skipping"
    fi
done

# ----------------------------
# Compile GSettings schemas if present
# ----------------------------
if [[ -d "$EXT_DIR/schemas" ]]; then
    log "5. Compiling GSettings schemas"
    glib-compile-schemas "$EXT_DIR/schemas" || error_exit "Failed to compile GSettings schemas"
else
    log "5. No GSettings schemas found, skipping compilation"
fi

# ----------------------------
# Ensure GDM dconf profile exists
# ----------------------------
DCONF_PROFILE="/etc/dconf/profile/gdm"

if [[ ! -f "$DCONF_PROFILE" ]]; then
    log "6. Creating missing GDM dconf profile at $DCONF_PROFILE"
    echo -e "user-db:user\nsystem-db:gdm" > "$DCONF_PROFILE" || \
        error_exit "Failed to create $DCONF_PROFILE"
else
    log "6. GDM dconf profile already exists: $DCONF_PROFILE"
fi

# ----------------------------
# Ensure GDM dconf database folder exists
# ----------------------------
DCONF_DB_DIR="/etc/dconf/db/gdm.d"

if [[ ! -d "$DCONF_DB_DIR" ]]; then
    log "7. Creating missing GDM dconf database directory at $DCONF_DB_DIR"
    mkdir -p "$DCONF_DB_DIR" || error_exit "Failed to create directory $DCONF_DB_DIR"
else
    log "7. GDM dconf database directory already exists: $DCONF_DB_DIR"
fi

# ----------------------------
# Create or replace GDM extension dconf file
# ----------------------------
DCONF_FILE="$DCONF_DB_DIR/99-gdm-extension"

log "8. Creating/updating GDM extension dconf file at $DCONF_FILE"

cat <<EOF > "$DCONF_FILE"
[org/gnome/shell]
enabled-extensions=['$UUID']

[org/gnome/shell/extensions/$NAME]
hide-gdm-extension-button=false
EOF

log "8. GDM extension dconf file created/updated successfully"

# ----------------------------
# Apply dconf changes
# ----------------------------
log "9. Updating dconf database"
dconf update || error_exit "Failed to update dconf database"
log "9. dconf database updated successfully"

# ----------------------------
# Completion message
# ----------------------------
log "gdm-extension is installed globally at $EXT_DIR. You can customize the GDM login screen for:"
echo -e "\n\t1. icon-theme"
echo -e "\t2. shell-theme"
echo -e "\t3. fonts"
echo -e "\t4. background (color, gradient, or image with blur for multi-monitors)"
echo -e "\t5. logo (the small icon at the bottom of the GDM screen)"
printf "\n\t~~~~~~~~~~~~~~~~~~ Thank You ~~~~~~~~~~~~~~~~~~\n"

exit 0

