#!/bin/bash
set -e

# ----------------------------
# Configuration
# ----------------------------
NAME="gdm-extension"
DOMAIN="pratap.fastmail.fm"
UUID="$NAME@$DOMAIN"
ZIP_NAME="$UUID.zip"
SRC_DIR="src/v-45-46-47-48-49-50"

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
for cmd in zip unzip dconf glib-compile-schemas; do
    command -v "$cmd" >/dev/null 2>&1 || error_exit "$cmd is required but not installed"
done

printf "\n\n\t~~~~ GNOME 45–49 Installer ~~~~\n"

cd "$SRC_DIR" || error_exit "Source directory $SRC_DIR not found"

# ----------------------------
# Zip creation
# ----------------------------
log "Creating extension zip..."
zip -qr "$ZIP_NAME" ./* || error_exit "Zip creation failed"

# ----------------------------
# Install
# ----------------------------
EXT_DIR="/usr/local/share/gnome-shell/extensions/$UUID"
mkdir -p "$EXT_DIR"

log "Installing extension..."
unzip -oq "$ZIP_NAME" -d "$EXT_DIR" || error_exit "Unzip failed"
rm -f "$ZIP_NAME"

# ----------------------------
# Clean GDM dconf
# ----------------------------
for file in "${GDM_USER_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        log "Removing $file"
        rm -f "$file"
    fi
done

# ----------------------------
# Compile schemas
# ----------------------------
if [[ -d "$EXT_DIR/schemas" ]]; then
    log "Compiling schemas..."
    glib-compile-schemas "$EXT_DIR/schemas"
fi

# ----------------------------
# dconf setup
# ----------------------------
DCONF_PROFILE="/etc/dconf/profile/gdm"
DCONF_DB_DIR="/etc/dconf/db/gdm.d"
DCONF_FILE="$DCONF_DB_DIR/99-gdm-extension"

mkdir -p "$DCONF_DB_DIR"

[[ -f "$DCONF_PROFILE" ]] || echo -e "user-db:user\nsystem-db:gdm" > "$DCONF_PROFILE"

cat <<EOF > "$DCONF_FILE"
[org/gnome/shell]
enabled-extensions=['$UUID']

[org/gnome/shell/extensions/$NAME]
hide-gdm-extension-button=false
EOF

log "Updating dconf..."
dconf update

log "Installation complete!"
