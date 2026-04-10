#!/bin/bash
set -e

error_exit() { echo "Error: $1"; exit 1; }

# Must be root
if [[ $(id -u) -ne 0 ]]; then
    error_exit "You must be root to perform this action"
fi

# Detect GNOME Shell version
SHELL_VERSION=$(gnome-shell --version | awk '{print $3}' | cut -d. -f1)

echo "Detected GNOME Shell version: $SHELL_VERSION"

# Route to correct uninstaller
if [[ $SHELL_VERSION -ge 45 && $SHELL_VERSION -le 49 ]]; then
    exec ./scripts/uninstall/v-45-46-47-48-49-uninstall.sh
elif [[ $SHELL_VERSION -ge 50 ]]; then
    exec ./scripts/uninstall/v-50-uninstall.sh
else
    error_exit "Unsupported GNOME Shell version: $SHELL_VERSION"
fi