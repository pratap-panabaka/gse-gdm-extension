import Gio from 'gi://Gio';
import St from 'gi://St';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import updateOrnament from '../utils/updateOrnament.js';
import GNOME_SHELL_VERSION from '../utils/shellVersion.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({ schema_id: DESKTOP_SCHEMA });

const accentColorsMenu = () => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('Accent Colors', false);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    const ACCENT_COLORS =
        new Gio.Settings({ schema_id: "org.gnome.desktop.interface" })
            .get_range('accent-color')
            .print(true)
            .match(/\[[^\][]*]/)[0]
            .replace(/[\]\[\s']/g, '')
            .split(',') || []

    const items = [];

    ACCENT_COLORS.forEach(color => {
        const accentColorItem = new PopupMenu.PopupMenuItem(color);
        items.push(accentColorItem);

        section.addMenuItem(accentColorItem);

        accentColorItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, accentColorItem);
        });

        accentColorItem.connect('activate', () => {
            dconfDesktopSettings.set_string('accent-color', color);
            updateOrnament(items, color);
        });
    });

    const accent_color = dconfDesktopSettings.get_string('accent-color');
    updateOrnament(items, accent_color);

    return menu;
};

export default accentColorsMenu;
