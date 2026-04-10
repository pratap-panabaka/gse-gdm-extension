import * as Config from 'resource:///org/gnome/shell/misc/config.js';

const GNOME_SHELL_VERSION = Number(Config.PACKAGE_VERSION.split('.')[0]);

export default GNOME_SHELL_VERSION;
