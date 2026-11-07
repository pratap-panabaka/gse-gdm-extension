
#!/bin/bash
set -e

# ----------------------------
# Helpers
# ----------------------------
error_exit() {
    echo "Error: $1"
    exit 1
}

# ----------------------------
# Root Check
# ----------------------------
if [[ "$EUID" -ne 0 ]]; then
    error_exit "You must be root to perform this action. Use sudo ./install.sh"
fi

# ----------------------------
# Resolve Repository Directory
# ----------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# ----------------------------
# Detect GNOME Shell Version
# ----------------------------
if ! command -v gnome-shell >/dev/null 2>&1; then
    error_exit "gnome-shell is not installed or not available in PATH"
fi

GNOME_VERSION=$(gnome-shell --version | sed -nE 's/.* ([0-9]+)(\..*)?$/\1/p')

[[ "$GNOME_VERSION" =~ ^[0-9]+$ ]] ||
    error_exit "Unable to detect GNOME Shell version"

echo
echo "Detected GNOME Shell version: $GNOME_VERSION"
echo

# ----------------------------
# Route to Version-Specific Installer
# ----------------------------
case "$GNOME_VERSION" in

    45|46|47|48|49)
        echo "Using GNOME 45-49 installer..."
        exec bash scripts/install/v-45-46-47-48-49-install.sh
        ;;

    50)
        echo "Using GNOME 50 installer..."
        exec bash scripts/install/v-50-install.sh
        ;;

    51)
        echo "Using GNOME 51 installer..."
        exec bash scripts/install/v-51-install.sh
        ;;

    *)
        error_exit "Unsupported GNOME Shell version: $GNOME_VERSION"
        ;;

esac

