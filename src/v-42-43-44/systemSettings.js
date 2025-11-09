// import {ATIndicator} from 'resource:///org/gnome/shell/ui/status/accessibility.js';
const {ATIndicator} = imports.ui.status.accessibility;

const TAP_TO_CLICK_SCHEMA = 'org.gnome.desktop.peripherals.touchpad';
const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';

let widget = null;

var addTapToClick = () => {
    widget = ATIndicator.prototype._buildItem('Tap to Click', TAP_TO_CLICK_SCHEMA, 'tap-to-click');
    return widget;
};

var addShowBannerMessage = () => {
    widget = ATIndicator.prototype._buildItem('Show Banner Message', LOGIN_SCREEN_SCHEMA, 'banner-message-enable');
    return widget;
};

var addClockShowDate = () => {
    widget = ATIndicator.prototype._buildItem('Clock - Show Date', INTERFACE_SCHEMA, 'clock-show-date');
    return widget;
};

var addClockShowSeconds = () => {
    widget = ATIndicator.prototype._buildItem('Clock - Show Seconds', INTERFACE_SCHEMA, 'clock-show-seconds');
    return widget;
};

var addClockShowWeekday = () => {
    widget = ATIndicator.prototype._buildItem('Clock - Show Weekday', INTERFACE_SCHEMA, 'clock-show-weekday');
    return widget;
};

var addShowBatteryPercentage = () => {
    widget = ATIndicator.prototype._buildItem('Show Battery Percentage', INTERFACE_SCHEMA, 'show-battery-percentage');
    return widget;
};

var addDisableRestartButtons = () => {
    widget = ATIndicator.prototype._buildItem('Disable Restart Buttons', LOGIN_SCREEN_SCHEMA, 'disable-restart-buttons');
    return widget;
};

var addDisableUserList = () => {
    widget = ATIndicator.prototype._buildItem('Disable User List', LOGIN_SCREEN_SCHEMA, 'disable-user-list');
    return widget;
};
