
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
    error_exit "You must be root to perform this action. Use sudo ./uninstall.sh"
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

SHELL_VERSION=$(gnome-shell --version | awk '{print $3}' | cut -d. -f1)

[[ "$SHELL_VERSION" =~ ^[0-9]+$ ]] ||
    error_exit "Unable to detect GNOME Shell version"

echo
echo "Detected GNOME Shell version: $SHELL_VERSION"
echo

# ----------------------------
# Route to Version-Specific Uninstaller
# ----------------------------
case "$SHELL_VERSION" in

    45|46|47|48|49)
        echo "Using GNOME 45-49 uninstaller..."
        exec bash "$SCRIPT_DIR/scripts/uninstall/v-45-46-47-48-49-uninstall.sh"
        ;;

    50)
        echo "Using GNOME 50 uninstaller..."
        exec bash "$SCRIPT_DIR/scripts/uninstall/v-50-uninstall.sh"
        ;;

    51)
        echo "Using GNOME 51 uninstaller..."
        exec bash "$SCRIPT_DIR/scripts/uninstall/v-51-uninstall.sh"
        ;;

    *)
        error_exit "Unsupported GNOME Shell version: $SHELL_VERSION"
        ;;

esac

