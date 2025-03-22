import St from 'gi://St';

import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as AnimationUtils from 'resource:///org/gnome/shell/misc/animationUtils.js';

import GNOME_SHELL_VERSION from '../utils/shellVersion.js';

import blurRadius from '../baseMenuItems/backgrounds/blurRadius.js';
import blurBrightness from '../baseMenuItems/backgrounds/blurBrightness.js';
import gradientDirection from '../baseMenuItems/backgrounds/gradientDirection.js';
import imageSize from '../baseMenuItems/backgrounds/imageSize.js';
import primaryColor from '../baseMenuItems/backgrounds/primaryColor.js';
import secondaryColor from '../baseMenuItems/backgrounds/secondaryColor.js';
import backgroundImages from '../baseMenuItems/backgrounds/backgroundImages.js';

const backgroundsMenu = async (gdmExtension, n) => {
    const menu = new PopupMenu.PopupSubMenuMenuItem(`Monitor - ${n} - Backgrounds`, false);
    const catchItems = []; // catch items for adding visibility in scroll view

    const scrollView = new St.ScrollView();
    const section = new PopupMenu.PopupMenuSection();

    if (GNOME_SHELL_VERSION === 45)
        scrollView.add_actor(section.actor);
    else
        scrollView.add_child(section.actor);

    menu.menu.box.add_child(scrollView);

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Primary Color')); //

    // primary color
    const pColor = primaryColor(gdmExtension, n);
    section.addMenuItem(pColor);
    catchItems.push(pColor);

    //
    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Secondary Color')); //

    // secondary color
    const sColor = secondaryColor(gdmExtension, n);
    section.addMenuItem(sColor);

    catchItems.push(sColor);
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Gradient Direction')); //

    // gradient direction
    gdmExtension._catchGradientDirection = [];
    const gDirection = gradientDirection(gdmExtension, n, gdmExtension._catchGradientDirection);
    gDirection.forEach(direction => {
        section.addMenuItem(direction);
        catchItems.push(direction);
    });
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Background Size')); //

    // gradient direction
    const iSize = imageSize(gdmExtension, n);
    iSize.forEach(direction => {
        section.addMenuItem(direction);
        catchItems.push(direction);
    });
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Blur Radius | 0 to 100')); //

    // blur radius
    const bRadius = blurRadius(gdmExtension, n);
    section.addMenuItem(bRadius);
    catchItems.push(bRadius);
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Blur Brightness | 0 to 1 | applicable only when blur radius > 0')); //

    // blur brightness
    const bBrightness = blurBrightness(gdmExtension, n);
    section.addMenuItem(bBrightness);
    catchItems.push(bBrightness);
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem('Backgroud Images')); //

    // background images
    const backgroundFiles = await backgroundImages(gdmExtension, n);
    backgroundFiles.forEach(fileName => {
        fileName.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, fileName);
        });
        section.addMenuItem(fileName);
    })
    //

    section.addMenuItem(new PopupMenu.PopupSeparatorMenuItem()); //

    // set actor visible in scroll view
    catchItems.forEach(item => {
        item.connect('key-focus-in', () => {
            AnimationUtils.ensureActorVisibleInScrollView(scrollView, item);
        });
    });

    return menu;
};

export default backgroundsMenu;