import Gio from 'gi://Gio';
import St from 'gi://St';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import {
    addTapToClick,
    addShowBannerMessage,
    addClockShowDate,
    addClockShowSeconds,
    addClockShowWeekday,
    addShowBatteryPercentage,
    addDisableRestartButtons,
    addDisableUserList
} from '../systemSettings.js';

import clockFormat from '../baseMenuItems/systemSettings/clockFormat.js';
import GNOME_SHELL_VERSION from '../utils/shellVersion.js';
import bannerMessage from '../baseMenuItems/systemSettings/bannerMessage.js';

const systemSettingsMenu = () => {
    const menu = new PopupMenu.PopupSubMenuMenuItem('System Settings', false);
    const catchItems = []; // catch items for adding visibility in scroll view

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    let menuItem;

    // tap to click
    menuItem = addTapToClick();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // battery percentage
    menuItem = addShowBatteryPercentage();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // disable restart buttons
    menuItem = addDisableRestartButtons();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // disable user list
    menuItem = addDisableUserList();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Clock')); //

    // clock show date
    menuItem = addClockShowDate();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // clock show week day
    menuItem = addClockShowWeekday();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // clock show seconds
    menuItem = addClockShowSeconds();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // clock format
    const cFormats = clockFormat();
    cFormats.forEach(format => {
        section.addMenuItem(format);
        catchItems.push(format);
    });
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Banner Message')); //

    // show banner message
    menuItem = addShowBannerMessage();
    section.addMenuItem(menuItem);
    catchItems.push(menuItem);

    // banner message
    const bMessage = bannerMessage();
    section.addMenuItem(bMessage);
    catchItems.push(bMessage);
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem()); //

    // set actor visible in scroll view
    catchItems.forEach(item => {
        item.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, item);
        });
    });

    return menu;
}

export default systemSettingsMenu;