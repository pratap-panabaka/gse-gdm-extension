const {Gio, St} = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {updateOrnament} = Me.imports.utils.updateOrnament;
const {GetFonts} = Me.imports.getNamesAsync.getFonts;

const DESKTOP_SCHEMA = 'org.gnome.desktop.interface';
const dconfDesktopSettings = new Gio.Settings({schema_id: DESKTOP_SCHEMA});

var subMenuFonts = gdmExtension => {
    gdmExtension._subMenuMenuItemFonts = new PopupMenu.PopupSubMenuMenuItem('Fonts', false);
    setFonts(gdmExtension._subMenuMenuItemFonts);

    return gdmExtension._subMenuMenuItemFonts;
};

const setFonts = async item => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    scrollView.add_actor(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetFonts();
    const FONTS = await object._collectFonts();

    const colletFonts = fonts => {
        let _items = [];
        fonts.forEach(fontName => {
            const fontNameItem = new PopupMenu.PopupMenuItem(fontName);
            _items.push(fontNameItem);

            section.addMenuItem(fontNameItem);

            fontNameItem.connect('activate', () => {
                dconfDesktopSettings.set_string('font-name', `${fontName} 11`);
                updateOrnament(fontItems, fontName);
            });
        });
        return _items;
    };

    const fontItems = colletFonts(FONTS);
    const text = dconfDesktopSettings.get_string('font-name').split(' ').slice(0, -1).join(' ');
    updateOrnament(fontItems, text);
};
