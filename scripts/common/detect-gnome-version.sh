#!/usr/bin/env bash

# Detect installed GNOME Shell version.
# Intended to be sourced by install.sh and uninstall.sh.

detect_gnome_version() {
    local version_output
    local version

    if ! command -v gnome-shell >/dev/null 2>&1; then
        printf 'Error: GNOME Shell is not installed or not available in PATH.\n' >&2
        return 1
    fi

    version_output=$(gnome-shell --version 2>/dev/null) || {
        printf 'Error: Unable to execute gnome-shell --version.\n' >&2
        return 1
    }

    # Extract the major version.
    version=$(sed -nE 's/.* ([0-9]+)(\.[0-9]+)*$/\1/p' <<< "$version_output")

    if [[ ! "$version" =~ ^[0-9]+$ ]]; then
        printf 'Error: Unable to detect GNOME Shell version from: %s\n' "$version_output" >&2
        return 1
    fi

    GNOME_VERSION="$version"

    export GNOME_VERSION

    return 0
}

# Select the extension source directory based on GNOME version.
get_gnome_source_directory() {
    case "${GNOME_VERSION:-}" in
        45|46|47|48|49|50)
            printf 'v-45-46-47-48-49-50\n'
            ;;
        51)
            printf 'v-51\n'
            ;;
        *)
            printf 'Error: Unsupported GNOME Shell version: %s\n' 
                "${GNOME_VERSION:-unknown}" >&2
            return 1
            ;;
    esac
}
