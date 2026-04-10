import Gio from 'gi://Gio';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import getBackgrounds from '../../getNamesAsync/getBackgrounds.js';
import updateOrnament from '../../utils/updateOrnament.js';

const backgroundImages = async (gdmExtension, n) => {
    const items = [];

    const backgrounds = await getBackgrounds();
    backgrounds.forEach(backgroundName => {
        const backgroundNameItem = new PopupMenu.PopupImageMenuItem(backgroundName, Gio.icon_new_for_string(backgroundName));
        backgroundNameItem._icon.set_icon_size(96);

        backgroundNameItem.connect('activate', () => {
            gdmExtension._settings.set_string(`background-image-path-${n}`, backgroundName);
            gdmExtension._settings.set_string(`gradient-direction-${n}`, 'none');
            updateOrnament(items, backgroundName);
            updateOrnament(gdmExtension._catchGradientDirection, 'none');
        });

        items.push(backgroundNameItem);
    });

    const text = gdmExtension._settings.get_string(`background-image-path-${n}`);
    updateOrnament(items, text);

    return items;
};

export default backgroundImages;
