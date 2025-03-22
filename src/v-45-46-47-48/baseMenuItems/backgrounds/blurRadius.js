import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import Slider from '../../utils/slider.js';

const blurRadius = (lockscreenExt, n) => {
    const item = new PopupMenu.PopupBaseMenuItem({can_focus: false});
    item.add_child(new Slider(lockscreenExt._settings, `blur-radius-${n}`));

    return item;
};

export default blurRadius;
