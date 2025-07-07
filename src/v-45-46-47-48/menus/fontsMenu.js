import Gio from 'gi://Gio';
import St from 'gi://St';
import updateOrnament from '../utils/updateOrnament.js';
import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import getFonts from '../getNamesAsync/getFonts.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const FONT_SIZE = 11;

const dconfDesktopSettings = new Gio.Settings({schema_id: DESKTOP_SCHEMA});

const fontsMenu = async () => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('Fonts', false);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    const items = [];

    const fonts = await getFonts();

    fonts.forEach(path => {
        const fontName = Gio.file_new_for_path(path).get_basename();
        const fontNameItem = new PopupMenu.PopupMenuItem(fontName);
        items.push(fontNameItem);

        section.addMenuItem(fontNameItem);

        fontNameItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, fontNameItem);
        });

        fontNameItem.connect('activate', () => {
            dconfDesktopSettings.set_string('font-name', `${fontName} ${FONT_SIZE}`);
            updateOrnament(items, fontName);
        });
    });

    const text = dconfDesktopSettings.get_string('font-name').split(' ').slice(0, -1).join(' ');
    updateOrnament(items, text);

    return menu;
};

export default fontsMenu;
