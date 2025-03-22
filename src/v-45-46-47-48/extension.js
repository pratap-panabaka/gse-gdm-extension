/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

// GI
import Gio from 'gi://Gio';
import St from 'gi://St';
import Shell from 'gi://Shell';

// Resources
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

// Local
import GdmExtension from './gdmExtension.js';
import GNOME_SHELL_VERSION from './utils/shellVersion.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

let m1Widget, m2Widget, m3Widget, m4Widget;

export default class GdmExtensionExtension extends Extension {
    enable() {
        this._settings = this.getSettings();

        // for disconnecting signals
        this._keys = this._settings.list_keys();
        this._keys.forEach(key => {
            this[`_${key}_changedId`] = null;
        })
        //

        this._indicator = new GdmExtension(this._settings); // Gdm Extension button
        Main.panel.addToStatusArea(this.uuid, this._indicator, 0, 'left'); // Added to panel left

        this._onVisibilityChange(); // show the extension settings icon on Admin decision

        this._connectionSettings(); // trigger setting changes

        let styleSheet = null;
        let themeName = this._settings.get_string('shell-theme');

        const stylesheetPaths = THEME_DIRECTORIES
            .map(dir => `${dir}/${themeName}/gnome-shell/gnome-shell.css`);

        styleSheet = stylesheetPaths.find(path => {
            let file = Gio.file_new_for_path(path);
            return file.query_exists(null);
        });

        Main.setThemeStylesheet(styleSheet);
        Main.loadTheme();

        this._starupPreparedId = Main.layoutManager.connect('startup-prepared', () => this._applyMonitorSettings());
        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed', () => this._applyMonitorSettings());
    }

    _applyMonitorSettings() {
        let nMonitors = Main.layoutManager.monitors.length;
        nMonitors = nMonitors > 4 ? 4 : nMonitors;
        let n = 1;
        while (nMonitors > 0) {
            this._onChangesFromGDMScreen(n);
            n += 1;
            nMonitors -= 1;
        }
    }

    _callMonitorConnectionSettings(n) {
        [
            `primary-color-${n}`,
            `gradient-direction-${n}`,
            `secondary-color-${n}`,
            `background-image-path-${n}`,
            `background-size-${n}`,
            `blur-radius-${n}`,
            `blur-brightness-${n}`,
        ]
            .forEach(key => {
                this[`_${key}_changedId`] = this._settings.connect(`changed::${key}`, this._onChangesFromGDMScreen.bind(this, n))
            });
    }

    _connectionSettings() {
        let nMonitors = Main.layoutManager.monitors.length;
        nMonitors = nMonitors > 4 ? 4 : nMonitors;
        let n = 1;
        while (nMonitors > 0) {
            switch (n) {
                case 1:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 2:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 3:
                    this._callMonitorConnectionSettings(n);
                    break;
                case 4:
                    this._callMonitorConnectionSettings(n);
                    break;
                default:
                    break;
            }
            n += 1;
            nMonitors -= 1;
        }

        let visibilityKey = "hide-gdm-extension-button";
        let shellThemeKey = "shell-theme";
        this[`_${visibilityKey}_changedId`] = this._settings.connect(`changed::${visibilityKey}`, this._onVisibilityChange.bind(this));
        this[`_${shellThemeKey}_changedId`] = this._settings.connect(`changed::${shellThemeKey}`, this._onShellThemeChanged.bind(this));
    }

    _createWidget(n) {
        let monitors = Main.layoutManager.monitors;
        let monitorIdx = n - 1;
        let monitor = monitors[monitorIdx];

        let imagePath = this._settings.get_string(`background-image-path-${n}`);
        let file = Gio.file_new_for_uri(imagePath);
        let isPathExists = file.query_exists(null);

        let blurRadius = this._settings.get_int(`blur-radius-${n}`);
        let blurBrightness = this._settings.get_double(`blur-brightness-${n}`);

        let themeContext = St.ThemeContext.get_for_stage(global.stage);
        let blurEffect = GNOME_SHELL_VERSION === 45 ? {
            name: 'gdm-extension-blur',
            sigma: blurRadius * themeContext.scale_factor,
            brightness: blurBrightness,
        } : {
            name: 'gdm-extension-blur',
            radius: blurRadius * themeContext.scale_factor,
            brightness: blurBrightness,
        };

        let widget = new St.Widget({
            style: `
            background-color: ${this._settings.get_string(`primary-color-${n}`)};
            background-gradient-direction: ${this._settings.get_string(`gradient-direction-${n}`)};
            background-gradient-start: ${this._settings.get_string(`primary-color-${n}`)};
            background-gradient-end: ${this._settings.get_string(`secondary-color-${n}`)};
            background-image: ${isPathExists ? `url(${imagePath})` : 'none'};
            background-size: ${this._settings.get_string(`background-size-${n}`)};
            `,
            x: monitor.x,
            y: monitor.y,
            width: monitor.width,
            height: monitor.height,
            effect: new Shell.BlurEffect(blurEffect),
        });

        switch (n) {
            case 1:
                m1Widget = widget;
                break;
            case 2:
                m2Widget = widget;
                break;
            case 3:
                m3Widget = widget;
                break;
            case 4:
                m4Widget = widget;
                break;
            default:
                break;
        }
        return widget;
    }

    _onChangesFromGDMScreen(n) {
        switch (n) {
            case 1:
                if (m1Widget)
                    m1Widget.destroy();
                break;
            case 2:
                if (m2Widget)
                    m2Widget.destroy();
                break;
            case 3:
                if (m3Widget)
                    m3Widget.destroy();
                break;
            case 4:
                if (m4Widget)
                    m4Widget.destroy();
                break;
            default:
                break;
        }

        Main.screenShield._lockDialogGroup.insert_child_below(this._createWidget(n), null);
    }

    _onShellThemeChanged() {
        let themeName = this._settings.get_string('shell-theme');
        if (themeName) {
            Main.setThemeStylesheet(themeName);
            Main.loadTheme();
        } else {
            Main.loadTheme();
        }
    }

    _onVisibilityChange() {
        if (this._settings.get_boolean('hide-gdm-extension-button'))
            this._indicator.hide();
        else
            this._indicator.show();
    }

    _disconnectSignals() {
        this._keys.forEach(key => {
            if (this[`_${key}_changedId`]) {
                this._settings.disconnect(this[`_${key}_changedId`]);
                this[`_${key}_changedId`] = null;
            }
        })
        this._keys = null;
    }

    // session-mode used is ['gdm'] only because this extension purpose
    // is to tweak the settings of GDM Login screen itself
    disable() {
        this._indicator.destroy();
        this._indicator = null;

        this._disconnectSignals(); // disconnect all signals

        [m1Widget, m2Widget, m3Widget, m4Widget].forEach(widget => {
            if (widget) {
                widget.destroy();
                widget = null;
            }
        });

        Main.layoutManager.disconnect(this._starupPreparedId);
        Main.layoutManager.disconnect(this._monitorsChangedId);

        this._settings = null;
    }
}
