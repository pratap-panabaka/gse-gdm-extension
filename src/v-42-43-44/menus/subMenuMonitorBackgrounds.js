const {Gio, St, Clutter} = imports.gi;
const PopupMenu = imports.ui.popupMenu;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {updateOrnament} = Me.imports.utils.updateOrnament;
const {createActor} = Me.imports.utils.createActor;
const {createMenuItem} = Me.imports.utils.createMenuItem;
const {Sliding} = Me.imports.utils.sliding;

const {GetBackgrounds} = Me.imports.getNamesAsync.getBackgrounds;

var subMenuMonitorBackgrounds = (gdmExtension, n) => {
    gdmExtension._subMenuMenuItemMonitorBackground = new PopupMenu.PopupSubMenuMenuItem(`Monitor - ${n}`, false);
    createBackgroundPrefs(gdmExtension, n);
    setBackgrounds(gdmExtension, n);

    return gdmExtension._subMenuMenuItemMonitorBackground;
};

let menuItem = null;

const createBackgroundPrefs = (gdmExtension, n) => {
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(createActor(gdmExtension._settings, 'Background Color/Gradient Start Color', '#123456', `background-color-${n}`, 'Must be a valid color'));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(createActor(gdmExtension._settings, 'Background End Color', '#456789', `background-gradient-end-color-${n}`, 'Must be a valid color or same as above color'));

    gdmExtension._catchGradientDirection = [];
    const gradientDirectionMenuItem = createMenuItem('Gradient Direction', ['none', 'horizontal', 'vertical'], gdmExtension._settings, `background-gradient-direction-${n}`, gdmExtension._catchGradientDirection);
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(gradientDirectionMenuItem);

    const backgroundSizeMenuItem = createMenuItem('Background size', ['center', 'cover', 'contain'], gdmExtension._settings, `background-size-${n}`);
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(backgroundSizeMenuItem);

    // Blur Sigma
    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({text: 'Blur Sigma 0 to 100', y_align: Clutter.ActorAlign.CENTER}));
    menuItem.add_child(new Sliding(gdmExtension._settings, `blur-sigma-${n}`));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(menuItem);
    //

    // Blur Brightness
    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({text: 'Blur Brightness 0 to 1', y_align: Clutter.ActorAlign.CENTER}));
    menuItem.add_child(new Sliding(gdmExtension._settings, `blur-brightness-${n}`));
    gdmExtension._subMenuMenuItemMonitorBackground.menu.box.add_child(menuItem);
    //
};

const setBackgrounds = async (gdmExtension, n) => {
    const item = gdmExtension._subMenuMenuItemMonitorBackground;

    menuItem = new PopupMenu.PopupBaseMenuItem();
    menuItem.add_child(new St.Label({text: 'Backgrounds', y_align: Clutter.ActorAlign.CENTER}));
    item.menu.box.add_child(menuItem);

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    scrollView.add_actor(section.actor);

    item.menu.box.add_child(scrollView);

    const object = new GetBackgrounds();
    const BACKGROUNDS = await object._collectBackgrounds();

    const collectBackgrounds = backgrounds => {
        let _items = [];
        backgrounds.forEach(backgroundName => {
            const backgroundNameItem = new PopupMenu.PopupMenuItem(backgroundName);
            _items.push(backgroundNameItem);

            section.addMenuItem(backgroundNameItem);

            backgroundNameItem.connect('activate', () => {
                gdmExtension._settings.set_string(`background-image-path-${n}`, backgroundName);
                gdmExtension._settings.set_string(`background-gradient-direction-${n}`, 'none');
                updateOrnament(backgroundItems, backgroundName);
                updateOrnament(gdmExtension._catchGradientDirection, 'none');
            });
        });
        return _items;
    };

    const backgroundItems = collectBackgrounds(BACKGROUNDS);
    const text = gdmExtension._settings.get_string(`background-image-path-${n}`);
    updateOrnament(backgroundItems, text);
};
