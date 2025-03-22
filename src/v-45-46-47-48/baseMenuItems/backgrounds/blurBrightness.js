import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import Slider from '../../utils/slider.js';

const blurBrightness = (lockscreenExt, n) => {
    const item = new PopupMenu.PopupBaseMenuItem({can_focus: false});
    item.add_child(new Slider(lockscreenExt._settings, `blur-brightness-${n}`));

    return item;
};

export default blurBrightness;
