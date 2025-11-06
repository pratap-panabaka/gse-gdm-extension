import Gio from 'gi://Gio';
import St from 'gi://St';
import updateOrnament from '../utils/updateOrnament.js';

import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import getLogos from '../getNamesAsync/getLogos.js';

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const dconfLoginSettings = new Gio.Settings({schema_id: LOGIN_SCREEN_SCHEMA});

const logosMenu = async () => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('Logo (small icon at bottom of login screen)', false);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    const items = [];

    const logos = await getLogos();

    // Add None Item to not to show the logo
    const logoNoneItem = new PopupMenu.PopupMenuItem('None');
    logoNoneItem.connect('key-focus-in', () => {
        AnimationUtils.ensureActorVisibleInScrollView(scrollView, logoNoneItem);
    });
    logoNoneItem.connect('activate', () => {
        dconfLoginSettings.set_string('logo', '');
        updateOrnament(items, 'None');
    });
    items.push(logoNoneItem);
    section.addMenuItem(logoNoneItem);
    //

    logos.forEach(logoName => {
        const logoNameItem = new PopupMenu.PopupMenuItem(logoName);
        items.push(logoNameItem);

        section.addMenuItem(logoNameItem);

        logoNameItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, logoNameItem);
        });

        logoNameItem.connect('activate', () => {
            dconfLoginSettings.set_string('logo', logoName);
            updateOrnament(items, logoName);
        });
    });

    const text = dconfLoginSettings.get_string('logo') || 'None';
    updateOrnament(items, text);

    return menu;
};

export default logosMenu;
