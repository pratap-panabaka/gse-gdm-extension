# GDM Extension

<p align="center">
  <strong>Customize your GNOME Display Manager (GDM) login screen directly from the login screen.</strong>
</p>

A configurable GNOME Shell extension that brings customization options to the GDM login screen. Change backgrounds, themes, fonts, icons, colors, blur effects, logos, and banner messages without manually editing GNOME Shell CSS files.

**Repository:** [pratap-panabaka/gse-gdm-extension](https://github.com/pratap-panabaka/gse-gdm-extension)

---

## Features

- **Background customization:** Configure background colors, images, and blur effects.
- **Multi-monitor support:** Customize backgrounds and blur effects for up to four monitors.
- **Shell themes:** Select custom GNOME Shell themes.
- **Accent colors:** Customize the appearance using accent colors.
- **Icon themes:** Choose installed icon themes.
- **Fonts:** Change the fonts used by the login screen.
- **Logo customization:** Configure the GDM branding logo.
- **Banner messages:** Display customizable messages on the login screen.
- **On-screen configuration:** Access customization options directly from the GDM login screen.

## Compatibility

The extension has been developed for GNOME Shell 42 and above. Compatibility depends on the GNOME Shell version and the corresponding extension source.

### Installer support

| GNOME Shell version | Installer |
|---|---|
| 45–49 | `v-45-46-47-48-49-install.sh` |
| 50 | `v-50-install.sh` |
| 51 | `v-51-install.sh` |

The root `install.sh` detects the installed GNOME Shell version and launches the corresponding installer.

**Test environment:** Arch Linux.

Other distributions, including Ubuntu and Debian, have received limited testing. Compatibility is not guaranteed across all distributions.

## Important warnings

> **Experimental software — use at your own risk.**

Although the project has been under development since December 2023, there may be rare situations where installing or using the extension prevents access to the graphical login session, potentially requiring recovery through a TTY or bootable USB.

Before installing:

1. Keep a bootable Linux USB available.
2. Be comfortable accessing a TTY and working with Linux filesystems.
3. Back up important GDM configuration files.
4. Understand how to remove the extension manually if the graphical session becomes inaccessible.

### GDM configuration considerations

1. The installation scripts assume that `gdm-extension` is the only GNOME Shell extension enabled for the GDM user.
2. GDM uses a separate dconf configuration profile and user database.
3. Installation scripts configure the GDM extension activation automatically.
4. The GNOME 51 installer backs up and removes the existing GDM user dconf database to address an extension activation issue. This can reset other GDM-specific preferences.
5. Users with custom GDM configuration should review their dconf profile and database before installation.
6. Conflicts with other extensions or manual GDM configuration changes may cause unexpected behavior.

---

## Prerequisites

Install the following packages before running the installer:

| Package | Purpose |
|---|---|
| `zip` | Create the extension archive |
| `unzip` | Extract the extension |
| `dconf` | Configure GDM settings |
| `glib-compile-schemas` | Compile extension schemas |

These utilities must be available in your system's PATH.

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/pratap-panabaka/gse-gdm-extension.git

cd gse-gdm-extension
```

### 2. Run the installer

```bash
sudo ./install.sh
```

The installer automatically:

1. Detects the installed GNOME Shell version.
2. Selects the corresponding version-specific installation script.
3. Packages the extension source.
4. Installs the extension under:

   ```text
   /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
   ```

5. Compiles the extension schemas, if present.
6. Configures the GDM dconf profile.
7. Enables the extension for the GDM session.
8. Performs version-specific configuration and cleanup.

### 3. Restart your system

After installation, reboot:

```bash
sudo reboot
```

The GDM customization button should be available on the login screen.

---

## Configuration

All customization options are accessible directly from the GDM login screen through the **GDM Extension** button.

### Show or hide the GDM Extension button

You can control the visibility of the extension button through dconf.

Open the configuration file:

```bash
sudo nano /etc/dconf/db/gdm.d/99-gdm-extension
```

Find the following setting:

```ini
[org/gnome/shell/extensions/gdm-extension]
hide-gdm-extension-button=false
```

Change the value according to your preference:

| Value | Behavior |
|---|---|
| `false` | Show the GDM Extension button |
| `true` | Hide the GDM Extension button |

Update the dconf database after making changes:

```bash
sudo dconf update
```

Restart the system to apply the changes.

### Custom resource directories

The extension searches standard system directories for customization resources.

| Resource | Directories |
|---|---|
| Background images | `/usr/local/share/backgrounds`, `/usr/share/backgrounds` |
| Fonts | `/usr/local/share/fonts`, `/usr/share/fonts` |
| Icon themes | `/usr/local/share/icons`, `/usr/share/icons` |
| Shell themes | `/usr/local/share/themes`, `/usr/share/themes` |
| Logos | `/usr/local/share/pixmaps`, `/usr/share/pixmaps` |

**Important:** If you want to use a custom logo, its filename must contain the word `logo`.

For example:

```text
/usr/local/share/pixmaps/custom-logo.png
```

Place your custom resources in the appropriate directories before configuring them through the GDM Extension interface.

---

## Uninstallation

To remove the extension, execute:

```bash
sudo ./uninstall.sh
```

The root uninstaller detects your GNOME Shell version and invokes the corresponding version-specific uninstaller.

The uninstallation process removes the extension and its associated dconf configuration.

A reboot is recommended after uninstallation.

**Note:** The GNOME 51 uninstaller preserves the GDM user dconf database to avoid unnecessarily removing unrelated GDM preferences.

---

## Troubleshooting

### GDM Extension button is not visible

Check whether the extension is enabled:

```bash
sudo env \
  DCONF_PROFILE=gdm \
  XDG_CONFIG_HOME=/var/lib/gdm/seat0/config \
  gsettings get org.gnome.shell enabled-extensions
```

Expected output:

```text
['gdm-extension@pratap.fastmail.fm']
```

Check whether GNOME Shell extensions are globally disabled:

```bash
sudo env \
  DCONF_PROFILE=gdm \
  XDG_CONFIG_HOME=/var/lib/gdm/seat0/config \
  gsettings get org.gnome.shell disable-user-extensions
```

Expected output:

```text
false
```

**GNOME 51 note:** An existing GDM dconf user database containing `disable-user-extensions=true` can prevent the extension from activating even when it is listed in `enabled-extensions`. The GNOME 51 installer backs up and resets this database.

### Manual recovery

If the graphical login screen becomes inaccessible, switch to a TTY using:

```text
Ctrl + Alt + F3
```

Log in and remove the extension:

```bash
sudo rm -rf /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm

sudo rm -f /etc/dconf/db/gdm.d/99-gdm-extension

sudo dconf update
```

If necessary, restore the GDM dconf backup created during installation.

Reboot:

```bash
sudo reboot
```

Recovery procedures may vary depending on the distribution and GDM configuration.

---

## Project structure

```text
gse-gdm-extension/
│
├── install.sh
├── uninstall.sh
│
├── scripts/
│   ├── install/
│   │   ├── v-45-46-47-48-49-install.sh
│   │   ├── v-50-install.sh
│   │   └── v-51-install.sh
│   │
│   └── uninstall/
│       ├── v-45-46-47-48-49-uninstall.sh
│       ├── v-50-uninstall.sh
│       └── v-51-uninstall.sh
│
└── src/
    ├── v-45-46-47-48-49-50/
    └── v-51/
```

---

## Issues and Contributions

Found a bug or have a suggestion?

- [Report an issue](https://github.com/pratap-panabaka/gse-gdm-extension/issues)
- [View the source code](https://github.com/pratap-panabaka/gse-gdm-extension)
- Contributions and improvements are welcome.

If you encounter compatibility issues with a particular GNOME Shell version or Linux distribution, please include the GNOME Shell version, distribution, and relevant error logs in your issue report.

## License

This project is licensed under the **GNU General Public License v3.0 (GPL-3.0)**.

See [LICENSE](LICENSE) for details.
