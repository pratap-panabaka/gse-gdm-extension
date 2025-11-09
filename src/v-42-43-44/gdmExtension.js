const {Clutter, GObject, GLib, St} = imports.gi;

const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const Config = imports.misc.config;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {subMenuSystemSettings} = Me.imports.menus.subMenuSystemSettings;
const {subMenuMonitorBackgrounds} = Me.imports.menus.subMenuMonitorBackgrounds;
const {subMenuIconThemes} = Me.imports.menus.subMenuIconThemes;
const {subMenuShellThemes} = Me.imports.menus.subMenuShellThemes;
const {subMenuLogos} = Me.imports.menus.subMenuLogos;
const {subMenuFonts} = Me.imports.menus.subMenuFonts;

var GdmExtension = GObject.registerClass(
    class GdmExtension extends PanelMenu.Button {
        _init(settings) {
            super._init(0.0, 'GDM Settings Icon Indicator');
            this._settings = settings;

            this._box = new St.BoxLayout();
            this.add_child(this._box);

            this._box.add_child(new St.Icon({
                icon_name: 'preferences-system-symbolic',
                style_class: 'system-status-icon',
            }));

            this._customLabel = 'gdm-extension';
            this._box.add_child(new St.Label({text: this._customLabel, y_align: Clutter.ActorAlign.CENTER}));

            this._subMenuMonitorBackgrounds();  // Monitor background settings

            const generateIconThemes = subMenuIconThemes(this);
            this.menu.addMenuItem(generateIconThemes); // Icon Themes

            const generateShellThemes = subMenuShellThemes(this);
            this.menu.addMenuItem(generateShellThemes); // Shell Themes

            const generateFonts = subMenuFonts(this);
            this.menu.addMenuItem(generateFonts); // Font Themes

            const generateSystemSettings = subMenuSystemSettings(this);
            this.menu.addMenuItem(generateSystemSettings); // System Settings Menu

            const generateLogos = subMenuLogos(this);
            this.menu.addMenuItem(generateLogos); // Logos
        }

        _subMenuMonitorBackgrounds() {
            let nMonitors = Main.layoutManager.monitors.length;
            nMonitors = nMonitors > 4 ? 4 : nMonitors;
            let n = 1;
            while (nMonitors > 0) {
                const generateMonitorBackgrounds = subMenuMonitorBackgrounds(this, n);
                this.menu.addMenuItem(generateMonitorBackgrounds); // Add per Monitor background settings
                n += 1;
                nMonitors -= 1;
            }
        }
    }
);
