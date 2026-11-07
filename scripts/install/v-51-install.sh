
#!/bin/bash
set -e

# ----------------------------
# Configuration
# ----------------------------
NAME="gdm-extension"
DOMAIN="pratap.fastmail.fm"
UUID="$NAME@$DOMAIN"
ZIP_NAME="$UUID.zip"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
SRC_DIR="$SCRIPT_DIR/src/v-51"

EXT_DIR="/usr/local/share/gnome-shell/extensions/$UUID"

DCONF_PROFILE="/etc/dconf/profile/gdm"
DCONF_DB_DIR="/etc/dconf/db/gdm.d"
DCONF_FILE="$DCONF_DB_DIR/99-gdm-extension"

GDM_DCONF_USER="/var/lib/gdm/seat0/config/dconf/user"

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

printf "\n\n\t~~~~ GNOME 51 Installer ~~~~\n"

# ----------------------------
# Dependencies
# ----------------------------
for cmd in zip unzip dconf glib-compile-schemas; do
    command -v "$cmd" >/dev/null 2>&1 ||
        error_exit "$cmd is required but not installed"
done

# ----------------------------
# Source Validation
# ----------------------------
[[ -d "$SRC_DIR" ]] ||
    error_exit "Source directory $SRC_DIR not found"

[[ -f "$SRC_DIR/metadata.json" ]] ||
    error_exit "metadata.json not found in $SRC_DIR"

# ----------------------------
# Validate GNOME 51 Metadata
# ----------------------------
if ! grep -Eq '"51"' "$SRC_DIR/metadata.json"; then
    error_exit "Extension metadata does not declare GNOME 51 support"
fi

# ----------------------------
# Temporary Directory
# ----------------------------
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# ----------------------------
# Zip Creation
# ----------------------------
log "Creating extension zip..."

cd "$SRC_DIR"

shopt -s dotglob nullglob
SOURCE_FILES=(*)

[[ ${#SOURCE_FILES[@]} -gt 0 ]] ||
    error_exit "Extension source directory is empty"

zip -qr "$TEMP_DIR/$ZIP_NAME" "${SOURCE_FILES[@]}" ||
    error_exit "Zip creation failed"

# ----------------------------
# Install Extension
# ----------------------------
mkdir -p "$EXT_DIR"

log "Installing extension..."

unzip -oq "$TEMP_DIR/$ZIP_NAME" -d "$EXT_DIR" ||
    error_exit "Unzip failed"

# ----------------------------
# Compile Schemas
# ----------------------------
if [[ -d "$EXT_DIR/schemas" ]]; then
    log "Compiling schemas..."
    glib-compile-schemas "$EXT_DIR/schemas"
fi

# ----------------------------
# GDM dconf Profile
# ----------------------------
mkdir -p "$DCONF_DB_DIR"

if [[ ! -f "$DCONF_PROFILE" ]]; then
    log "Creating GDM dconf profile..."

    printf "user-db:user\nsystem-db:gdm\nfile-db:/usr/share/gdm/greeter-dconf-defaults\n" \
        > "$DCONF_PROFILE"
fi

# ----------------------------
# GDM Extension Configuration
# ----------------------------
log "Configuring GDM extension..."

cat > "$DCONF_FILE" <<EOF
[org/gnome/shell]
enabled-extensions=['$UUID']

[org/gnome/shell/extensions/$NAME]
hide-gdm-extension-button=false
EOF

# ----------------------------
# Update dconf
# ----------------------------
log "Updating dconf database..."

dconf update

# ----------------------------
# GNOME 51 GDM Fix
# ----------------------------
if [[ -f "$GDM_DCONF_USER" ]]; then

    BACKUP_FILE="$GDM_DCONF_USER.backup.$(date +%Y%m%d-%H%M%S)"

    log "Backing up existing GDM dconf database..."

    cp -a "$GDM_DCONF_USER" "$BACKUP_FILE"

    log "Removing stale GDM dconf user database..."

    rm -f "$GDM_DCONF_USER"

else
    log "GDM dconf user database not found. Skipping cleanup."
fi

# ----------------------------
# Completion
# ----------------------------
echo
log "GNOME 51 extension installation completed!"
echo
echo "A system reboot is required."
echo "Run: sudo reboot"
echo

