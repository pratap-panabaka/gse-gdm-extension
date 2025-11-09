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

const {enumerateFiles} = Me.imports.utils.enumerateFiles;

const LOGO_DIRECTORIES = ['/usr/local/share/pixmaps', '/usr/share/pixmaps'];

var GetLogos = GObject.registerClass(
    class GetLogs extends GObject.Object {
        async _collectLogos() {
            const logos = [];
            for (const dirName of LOGO_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                if (dir.query_exists(null)) {
                    for (const name of await enumerateFiles(dir)) {
                        if (
                            name.endsWith('.jpg') ||
                            name.endsWith('.jpeg') ||
                            name.endsWith('.png') ||
                            name.endsWith('.svg') ||
                            name.endsWith('.gif') ||
                            name.endsWith('.JPG') ||
                            name.endsWith('.JPEG') ||
                            name.endsWith('.PNG') ||
                            name.endsWith('.SVG') ||
                            name.endsWith('GIF')
                        )
                            logos.push(`${dirName}/${name}`); // push all file names
                    }
                }
            }
            return logos;
        }
    }
);
