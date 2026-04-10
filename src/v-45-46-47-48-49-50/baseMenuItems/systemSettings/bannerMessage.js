import Gio from 'gi://Gio';
import St from 'gi://St';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const dconfLoginSettings = new Gio.Settings({schema_id: LOGIN_SCREEN_SCHEMA});

let inputText, getInput;

//
const bannerMessage = () => {
    const item = new PopupMenu.PopupBaseMenuItem();

    inputText = new St.Entry({
        hint_text: 'Please enter Banner Message',
        text: dconfLoginSettings.get_string('banner-message-text'),
        track_hover: true,
        can_focus: true,
    });

    inputText.clutter_text.connect('activate', actor => {
        getInput = actor.get_text();
        dconfLoginSettings.set_string('banner-message-text', getInput);
    });

    item.connect('notify::active', () => inputText.grab_key_focus());
    item.add_child(inputText);

    return item;
};

export default bannerMessage;
