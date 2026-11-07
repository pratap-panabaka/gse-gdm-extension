import Gio from 'gi://Gio';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import updateOrnament from '../../utils/updateOrnament.js';

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({schema_id: DESKTOP_SCHEMA});

const clockFormat = () => {
    let items = [];

    let keys = ['12h', '24h'];
    let dconfKey = 'clock-format';

    keys.forEach(key => {
        const item = new PopupMenu.PopupMenuItem(key);
        items.push(item);

        item.connect('activate', () => {
            dconfDesktopSettings.set_string(dconfKey, key);
            updateOrnament(items, key);
        });
    });

    updateOrnament(items, dconfDesktopSettings.get_string(dconfKey));

    return items;
};

export default clockFormat;
