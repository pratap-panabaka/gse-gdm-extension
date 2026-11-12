#!/usr/bin/env bash

# Shared GDM dconf configuration.
# Intended to be sourced by install.sh and uninstall.sh.

# --------------------------------------------------
# Configuration
# --------------------------------------------------

GDM_DCONF_PROFILE="${GDM_DCONF_PROFILE:-/etc/dconf/profile/gdm}"
GDM_DCONF_PROFILE_NAME="${GDM_DCONF_PROFILE_NAME:-gdm}"

EXTENSION_NAME="${EXTENSION_NAME:-gdm-extension}"
EXTENSION_DOMAIN="${EXTENSION_DOMAIN:-pratap.fastmail.fm}"
EXTENSION_UUID="${EXTENSION_UUID:-$EXTENSION_NAME@$EXTENSION_DOMAIN}"

# --------------------------------------------------
# Helpers
# --------------------------------------------------

gdm_log() {
    printf '\t%s\n' "$1"
}

gdm_error() {
    printf 'Error: %s\n' "$1" >&2
    return 1
}

# --------------------------------------------------
# Detect GDM greeter defaults database
# --------------------------------------------------

detect_gdm_greeter_defaults() {
    local candidate

    local candidates=(
        "/var/lib/gdm3/greeter-dconf-defaults"
        "/usr/share/gdm/greeter-dconf-defaults"
        "/var/lib/gdm/greeter-dconf-defaults"
        "/etc/gdm3/greeter-dconf-defaults"
    )

    for candidate in "${candidates[@]}"; do
        if [[ -f "$candidate" ]]; then
            printf '%s\n' "$candidate"
            return 0
        fi
    done

    return 1
}

# --------------------------------------------------
# Configure GDM dconf profile
# --------------------------------------------------

configure_gdm_dconf_profile() {
    local profile="$GDM_DCONF_PROFILE"
    local greeter_defaults
    local profile_dir
    local temp_file
    local backup_file

    if [[ "$EUID" -ne 0 ]]; then
        gdm_error "GDM dconf profile configuration requires root privileges"
        return 1
    fi

    if ! command -v dconf >/dev/null 2>&1; then
        gdm_error "dconf is required but not installed"
        return 1
    fi

    # Detect greeter defaults.
    if [[ -n "${GDM_DCONF_GREETER_DEFAULTS:-}" ]]; then
        greeter_defaults="$GDM_DCONF_GREETER_DEFAULTS"

        if [[ ! -f "$greeter_defaults" ]]; then
            gdm_error "GDM greeter defaults not found: $greeter_defaults"
            return 1
        fi
    else
        greeter_defaults=$(detect_gdm_greeter_defaults) || {
            gdm_error "Could not locate GDM greeter defaults database"
            return 1
        }
    fi

    gdm_log "Using GDM greeter defaults: $greeter_defaults"

    profile_dir="$(dirname "$profile")"

    mkdir -p "$profile_dir" || return 1

    temp_file=$(mktemp "$profile_dir/.gdm-profile.XXXXXX") || return 1

    # Preserve unrelated entries and comments.
    # Remove duplicate managed entries and incorrect user-db file-db entries.
    if [[ -f "$profile" ]]; then
        awk '
            /^[[:space:]]*#/ { print; next }
            /^[[:space:]]*$/ { print; next }

            /^user-db:user$/ { next }
            /^system-db:gdm$/ { next }

            /^file-db:/ {
                if ($0 ~ /\/dconf\/user[[:space:]]*$/) next
                if ($0 ~ /greeter-dconf-defaults[[:space:]]*$/) next
            }

            { print }
        ' "$profile" > "$temp_file" || {
            rm -f "$temp_file"
            return 1
        }
    else
        : > "$temp_file"
    fi

    # Construct the final profile.
    {
        printf '%s\n' "user-db:user"
        printf '%s\n' "system-db:gdm"
        printf '%s\n' "file-db:$greeter_defaults"

        cat "$temp_file"
    } > "${temp_file}.final" || {
        rm -f "$temp_file" "${temp_file}.final"
        return 1
    }

    rm -f "$temp_file"
    temp_file="${temp_file}.final"

    # Avoid unnecessary profile changes.
    if [[ -f "$profile" ]] && cmp -s "$profile" "$temp_file"; then
        rm -f "$temp_file"
        gdm_log "GDM dconf profile is already configured"
        return 0
    fi

    # Back up existing profile.
    if [[ -f "$profile" ]]; then
        backup_file="${profile}.backup.$(date +%Y%m%d-%H%M%S)"

        cp -a "$profile" "$backup_file" || {
            rm -f "$temp_file"
            return 1
        }

        chmod --reference="$profile" "$temp_file" 2>/dev/null || true

        gdm_log "Profile backup: $backup_file"
    else
        chmod 644 "$temp_file"
    fi

    mv "$temp_file" "$profile" || {
        rm -f "$temp_file"
        return 1
    }

    gdm_log "GDM dconf profile configured: $profile"
}

# --------------------------------------------------
# Detect GDM system account
# --------------------------------------------------

detect_gdm_user() {
    if [[ -n "${GDM_USER:-}" ]]; then
        getent passwd "$GDM_USER" >/dev/null || {
            gdm_error "Configured GDM account does not exist: $GDM_USER"
            return 1
        }

        printf '%s\n' "$GDM_USER"
        return 0
    fi

    if getent passwd gdm >/dev/null; then
        printf '%s\n' "gdm"
        return 0
    fi

    if getent passwd Debian-gdm >/dev/null; then
        printf '%s\n' "Debian-gdm"
        return 0
    fi

    gdm_error "Could not identify the GDM system account"
    return 1
}

# --------------------------------------------------
# Repair GDM user dconf configuration
# --------------------------------------------------

repair_gdm_user_dconf() {
    local gdm_user
    local passwd_entry
    local gdm_home
    local config_home
    local user_db

    if [[ "$EUID" -ne 0 ]]; then
        gdm_error "GDM user dconf repair requires root privileges"
        return 1
    fi

    for cmd in getent runuser dbus-run-session dconf; do
        command -v "$cmd" >/dev/null 2>&1 || {
            gdm_error "$cmd is required for GDM dconf repair"
            return 1
        }
    done

    # A dedicated GDM user is not present on every distribution.
    if [[ -n "${GDM_USER:-}" ]]; then
        if ! getent passwd "$GDM_USER" >/dev/null; then
            gdm_error "Configured GDM account does not exist: $GDM_USER"
            return 1
        fi

        gdm_user="$GDM_USER"

    elif getent passwd gdm >/dev/null; then
        gdm_user="gdm"

    elif getent passwd Debian-gdm >/dev/null; then
        gdm_user="Debian-gdm"

    else
        gdm_log "No dedicated GDM greeter account detected."
        gdm_log "Skipping GDM user dconf repair."
        return 0
    fi

    passwd_entry=$(getent passwd "$gdm_user") || return 1

    IFS=: read -r _ _ _ _ _ gdm_home _ <<< "$passwd_entry"

    config_home="${GDM_XDG_CONFIG_HOME:-$gdm_home/.config}"
    user_db="$config_home/dconf/user"

    gdm_log "GDM account: $gdm_user"
    gdm_log "GDM home: $gdm_home"
    gdm_log "GDM config directory: $config_home"

    if [[ ! -f "$user_db" ]]; then
        gdm_log "GDM writable dconf database not found."
        gdm_log "Skipping user database repair."
        return 0
    fi

    gdm_log "Checking GDM user dconf configuration..."

    runuser -u "$gdm_user" -- \
        dbus-run-session -- \
        env \
            HOME="$gdm_home" \
            XDG_CONFIG_HOME="$config_home" \
            DCONF_PROFILE="$GDM_DCONF_PROFILE_NAME" \
            dconf reset /org/gnome/shell/disable-user-extensions || {
                gdm_error "Failed to reset GDM user dconf setting"
                return 1
            }

    gdm_log "GDM user dconf setting reset successfully"
}
