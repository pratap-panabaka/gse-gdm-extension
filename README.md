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

The extension supports GNOME Shell versions **42 through 51**.

The installer automatically detects the installed GNOME Shell version and selects the corresponding extension source.

### Supported GNOME Shell versions

| GNOME Shell version | Extension source |
|---|---|
| 42, 43, 44 | `src/v-42-43-44/` |
| 45, 46, 47, 48, 49, 50, 51 | `src/v-45-46-47-48-49-50-51/` |

GNOME Shell versions below 42 or above 51 are not supported by the current installer.

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
3. The installer automatically configures the GDM extension activation.
4. Users with custom GDM configuration should review their dconf profile and database before installation.
5. Conflicts with other extensions or manual GDM configuration changes may cause unexpected behavior.

---

## Prerequisites

The installer requires:

| Dependency | Purpose |
|---|---|
| `bash` | Execute installation scripts |
| `dconf` | Configure and update GDM settings |

No additional packaging or extraction utilities are required by the installer.

**Note:** `gnome-shell` must also be installed so that the installer can detect the installed GNOME Shell version.

---

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

1. Checks for root privileges.
2. Verifies the required dependencies.
3. Detects the installed GNOME Shell version.
4. Checks whether the detected version is supported.
5. Selects the corresponding version-specific extension source.
6. Creates the GDM dconf profile.
7. Configures the extension activation and settings.
8. Updates the dconf database.
9. Copies the selected extension source files into:

   ```text
   /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm
   ```

If the detected GNOME Shell version is unsupported, the installer terminates with an appropriate error message.

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
sudo nano /etc/dconf/db/gdmextensionbypratappanabaka.d/99-gdm-extension
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

The uninstaller automatically:

1. Checks the installed GNOME Shell version.
2. Selects the corresponding version-specific cleanup procedure.
3. Removes the installed extension.
4. Removes the associated dconf configuration.

A reboot is recommended after uninstallation.


### Manual recovery

If the graphical login screen becomes inaccessible, switch to a TTY using:

```text
Ctrl + Alt + F3
```

Log in and remove the extension:

```bash
sudo rm -rf /usr/local/share/gnome-shell/extensions/gdm-extension@pratap.fastmail.fm

sudo rm -f /etc/dconf/db/gdmextensionbypratappanabaka.d/99-gdm-extension

sudo rm -f /etc/dconf/profile/gdm

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
└── src/
    ├── v-42-43-44/
    │   ├── getNamesAsync/
    │   ├── menus/
    │   ├── schemas/
    │   └── utils/
    │
    └── v-45-46-47-48-49-50-51/
        ├── baseMenuItems/
        │   ├── backgrounds/
        │   │
        │   └── systemSettings/
        │
        ├── getNamesAsync/
        ├── menus/
        ├── schemas/
        └── utils/
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

<p align="center">
  <a href="https://www.buymeacoffee.com/pratap.panabaka" target="_blank">
    <img
      src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
      alt="Buy Me A Coffee"
      width="200"
    />
  </a>
</p>
