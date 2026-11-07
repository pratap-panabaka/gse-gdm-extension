import {ATIndicator} from 'resource:///org/gnome/shell/ui/status/accessibility.js';

const TAP_TO_CLICK_SCHEMA = 'org.gnome.desktop.peripherals.touchpad';
const LOGIN_SCREEN_SCHEMA = 'org.gnome.login-screen';
const INTERFACE_SCHEMA = 'org.gnome.desktop.interface';

let widget = null;

export const addTapToClick = () => {
    widget = ATIndicator.prototype._buildItem('Tap to Click', TAP_TO_CLICK_SCHEMA, 'tap-to-click');
    return widget;
};

export const addShowBannerMessage = () => {
    widget = ATIndicator.prototype._buildItem('Show Banner Message', LOGIN_SCREEN_SCHEMA, 'banner-message-enable');
    return widget;
};

export const addClockShowDate = () => {
    widget = ATIndicator.prototype._buildItem('Show Date', INTERFACE_SCHEMA, 'clock-show-date');
    return widget;
};

export const addClockShowSeconds = () => {
    widget = ATIndicator.prototype._buildItem('Show Seconds', INTERFACE_SCHEMA, 'clock-show-seconds');
    return widget;
};

export const addClockShowWeekday = () => {
    widget = ATIndicator.prototype._buildItem('Show Weekday', INTERFACE_SCHEMA, 'clock-show-weekday');
    return widget;
};

export const addShowBatteryPercentage = () => {
    widget = ATIndicator.prototype._buildItem('Show Battery Percentage', INTERFACE_SCHEMA, 'show-battery-percentage');
    return widget;
};

export const addDisableRestartButtons = () => {
    widget = ATIndicator.prototype._buildItem('Disable Restart Buttons', LOGIN_SCREEN_SCHEMA, 'disable-restart-buttons');
    return widget;
};

export const addDisableUserList = () => {
    widget = ATIndicator.prototype._buildItem('Disable User List', LOGIN_SCREEN_SCHEMA, 'disable-user-list');
    return widget;
};
