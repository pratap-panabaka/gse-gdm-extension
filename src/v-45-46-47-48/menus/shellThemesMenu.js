import St from 'gi://St';
import Gio from 'gi://Gio';
import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import getShellThemes from '../getNamesAsync/getShellThemes.js';
import updateOrnament from '../utils/updateOrnament.js';

const THEME_DIRECTORIES = ['/usr/local/share/themes', '/usr/share/themes'];

const shellThemesMenu = async (gdmExtension) => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('Shell Themes', false);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    const items = [];

    const shellThemes = await getShellThemes();

    // Add Default Theme Item
    const shellDefaultThemeItem = new PopupMenu.PopupMenuItem('Default');
    items.push(shellDefaultThemeItem);

    shellDefaultThemeItem.connect('key-focus-in', () => {
        AnimationUtils.ensureActorVisibleInScrollView(scrollView, shellDefaultThemeItem);
    });

    shellDefaultThemeItem.connect('activate', () => {
        Main.setThemeStylesheet(null);
        Main.loadTheme();
        gdmExtension._settings.set_string('shell-theme', '');
        updateOrnament(items, 'Default');
    });

    section.addMenuItem(shellDefaultThemeItem);
    //

    shellThemes.forEach(theme => {
        const themeItem = new PopupMenu.PopupMenuItem(theme);
        items.push(themeItem);

        themeItem.connect('activate', () => {
            let styleSheet = null;
            const stylesheetPaths = THEME_DIRECTORIES
                .map(dir => `${dir}/${theme}/gnome-shell/gnome-shell.css`);

            styleSheet = stylesheetPaths.find(path => {
                let file = Gio.file_new_for_path(path);
                return file.query_exists(null);
            });

            if (styleSheet) {
                gdmExtension._settings.set_string('shell-theme', theme);
                updateOrnament(items, theme);
            } else {
                gdmExtension._settings.set_string('shell-theme', '');
                updateOrnament(items, 'Default');
            }

            Main.setThemeStylesheet(styleSheet);
            Main.loadTheme();
        });

        themeItem.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, themeItem);
        });

        section.addMenuItem(themeItem);
    })

    const text = gdmExtension._settings.get_string("shell-theme") || 'Default'
    updateOrnament(items, text);

    return menu;
}

export default shellThemesMenu;