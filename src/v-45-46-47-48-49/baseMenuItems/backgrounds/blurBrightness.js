import St from 'gi://St';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

let inputText, getInput;

//
const blurBrightness = (gdmExt, n) => {
    const item = new PopupMenu.PopupBaseMenuItem();

    inputText = new St.Entry({
        hint_text: 'Enter Blur Brightness Value',
        text: String(gdmExt._settings.get_double(`blur-brightness-${n}`)),
        track_hover: true,
        can_focus: true,
    });

    inputText.clutter_text.connect('activate', actor => {
        getInput = actor.get_text();
        gdmExt._settings.set_double(`blur-brightness-${n}`, getInput);
    });

    item.connect('notify::active', () => inputText.grab_key_focus());
    item.add_child(inputText);

    return item;
};

export default blurBrightness;
