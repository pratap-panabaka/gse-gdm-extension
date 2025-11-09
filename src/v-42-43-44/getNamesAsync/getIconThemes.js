// SPDX-FileCopyrightText: 2020 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

// source code: https://extensions.gnome.org/extension/19/user-themes/
// Below code is edited by PRATAP PANABAKA <pratap@fastmail.fm>


const {Gio, GObject} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {enumerateDir} = Me.imports.utils.enumerateDir;

const ICON_DIRECTORIES = ['/usr/local/share/icons', '/usr/share/icons'];

var GetIconThemes = GObject.registerClass(
    class GetIconThemes extends GObject.Object {
        async _collectIconThemes() {
            const iconThemes = [];
            for (const dirName of ICON_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                if (dir.query_exists(null)) {
                    for (const name of await enumerateDir(dir))
                        iconThemes.push(name);
                } // push all Icon folder names
            }
            return iconThemes;
        }
    }
);
