import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

const updateOrnament = (items, text) => {
    items.forEach(item => {
        if (item.label.get_text() === text)
            item.setOrnament(PopupMenu.Ornament.DOT);
        else
            item.setOrnament(PopupMenu.Ornament.NO_DOT);
    });
};

export default updateOrnament;
