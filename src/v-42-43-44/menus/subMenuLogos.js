const {Gio, St} = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {updateOrnament} = Me.imports.utils.updateOrnament;
const {GetLogos} = Me.imports.getNamesAsync.getLogos;

const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const dconfLoginSettings = new Gio.Settings({schema_id: LOGIN_SCREEN_SCHEMA});

var subMenuLogos = gdmExtension => {
    gdmExtension._subMenuMenuItemLogos = new PopupMenu.PopupSubMenuMenuItem('Logo (small icon at bottom of login screen)', false);
    setLogos(gdmExtension._subMenuMenuItemLogos);

    return gdmExtension._subMenuMenuItemLogos;
};

const setLogos = async item => {
    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    scrollView.add_actor(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetLogos();
    const LOGOS = await object._collectLogos();

    const collectLogos = logos => {
        let _items = [];

        // Add None Item to not to show the logo
        const logoNoneItem = new PopupMenu.PopupMenuItem('None');
        logoNoneItem.connect('activate', () => {
            dconfLoginSettings.set_string('logo', '');
            updateOrnament(logoItems, 'None');
        });
        _items.push(logoNoneItem);
        section.addMenuItem(logoNoneItem);
        //

        logos.forEach(logoName => {
            const logoNameItem = new PopupMenu.PopupMenuItem(logoName);
            _items.push(logoNameItem);

            section.addMenuItem(logoNameItem);

            logoNameItem.connect('activate', () => {
                dconfLoginSettings.set_string('logo', logoName);
                updateOrnament(logoItems, logoName);
            });
        });
        return _items;
    };

    const logoItems = collectLogos(LOGOS);
    const text = dconfLoginSettings.get_string('logo') || 'None';
    updateOrnament(logoItems, text);
};
