import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';

import hideExtensionButton from './buttons/hideExtensionButton.js';

// menus
import backgroundsMenu from './menus/backgroundsMenu.js';
import shellThemesMenu from './menus/shellThemesMenu.js';
import accentColorsMenu from './menus/accentColorsMenu.js';
import iconThemesMenu from './menus/iconThemesMenu.js';
import fontsMenu from './menus/fontsMenu.js';
import logosMenu from './menus/logosMenu.js';
import systemSettingsMenu from './menus/systemSettingsMenu.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });
const haveAccentColor = dconfDesktopSettings.list_keys().includes('accent-color');

const gdmExtension = GObject.registerClass(
    class gdmExtension extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'gdm-extension indicator');
            this._settings = settings;

            this._box = new St.BoxLayout();
            this.add_child(this._box);

            this._box.add_child(new St.Icon({
                icon_name: 'preferences-system-symbolic',
                style_class: 'system-status-icon',
            }));

            this._box.add_child(new St.Label({ text: 'gdm-extension', y_align: Clutter.ActorAlign.CENTER }));

            this._order();
        }

        async _order() {
            const monitors = await this._createBackgroundsMenu(); // creates background menu for each monitor
            const systemSettings = this._createSystemSettingsMenu(); // create system settings menu
            const accentColors = this._createAccentColorsMenu(); // accent colors if they exists
            const shellThemes = await this._createShellThemesMenu(); // creates shell themes menu
            const icons = await this._createIconThemesMenu(); // create icon themes menu
            const fonts = await this._createFontsMenu(); // create fonts menu
            const logos = await this._createLogosMenu(); // creat logos menu
            const hideExtensionButton = this._createHideExtensionButton(); // create hide extension button

            Promise.all([monitors, systemSettings, accentColors, shellThemes, icons, fonts, logos, hideExtensionButton])
                .then((promises) => {
                    promises.forEach((promise) => {
                        if (promise) {
                            if (Array.isArray(promise)) {
                                promise.forEach(menuItem => {
                                    this.menu.addMenuItem(menuItem);
                                });
                            } else {
                                this.menu.addMenuItem(promise);
                            }
                        }
                    })
                })
        }

        _createHideExtensionButton() {
            let menuItem = hideExtensionButton(this);
            return menuItem
        }

        _createSystemSettingsMenu() {
            let menuItem = systemSettingsMenu()
            return menuItem
        }

        async _createLogosMenu() {
            let menuItem = await logosMenu();
            return menuItem
        }

        async _createFontsMenu() {
            let menuItem = await fontsMenu();
            return menuItem
        }

        async _createIconThemesMenu() {
            let menuItem = await iconThemesMenu();
            return menuItem
        }

        _createAccentColorsMenu() {
            if (!haveAccentColor) return;
            let menuItem = accentColorsMenu();
            return menuItem
        }

        async _createShellThemesMenu() {
            let menuItem = await shellThemesMenu(this);
            return menuItem
        }

        async _createBackgroundsMenu() {
            const menuItems = [];
            let nMonitors;
            nMonitors = Main.layoutManager.monitors.length;
            nMonitors = Math.min(nMonitors, 4);
            let n = 1;
            while (nMonitors > 0) {
                let menuItem = await backgroundsMenu(this, n);
                menuItems.push(menuItem);
                n += 1;
                nMonitors -= 1;
            }
            return menuItems;
        }
    }
);

export default gdmExtension;