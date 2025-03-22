
import Gio from 'gi://Gio';
import St from 'gi://St';
import updateOrnament from '../utils/updateOrnament.js';
import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import getIconThemes from '../getNamesAsync/getIconThemes.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';

const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

const iconThemesMenu = async () => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('Icon Themes', false);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    const items = [];

    const iconThemes = await getIconThemes();

    iconThemes.forEach(iconThemeName => {
        const iconThemeNameItem = new PopupMenu.PopupMenuItem(iconThemeName);
        items.push(iconThemeNameItem);

        section.addMenuItem(iconThemeNameItem);

        iconThemeNameItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, iconThemeNameItem);
        });

        iconThemeNameItem.connect('activate', () => {
            dconfDesktopSettings.set_string('icon-theme', iconThemeName);
            updateOrnament(items, iconThemeName);
        });
    });

    const text = dconfDesktopSettings.get_string('icon-theme');
    updateOrnament(items, text);

    return menu;
};

export default iconThemesMenu;