// SPDX-FileCopyrightText: 2020 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

// source code: https://extensions.gnome.org/extension/19/user-themes/
// Below code is tweaked by PRATAP PANABAKA <pratap@fastmail.fm>

const {Gio, GObject} = imports.gi;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const {recursiveFileOperation, recursiveGetFileNamesCallback} = Me.imports.utils.recursiveFileOperation;

const BACKGROUND_DIRECTORIES = ['/usr/local/share/backgrounds', '/usr/share/backgrounds'];

var GetBackgrounds = GObject.registerClass(
    class GetBackgrounds extends GObject.Object {
        async _collectBackgrounds() {
            let backgroundFileNames = [];
            for (const dirName of BACKGROUND_DIRECTORIES) {
                const dir = Gio.File.new_for_path(dirName);
                if (dir.query_exists(null))
                    await recursiveFileOperation(dir, recursiveGetFileNamesCallback, backgroundFileNames, 'bg');
            }

            const filtered = backgroundFileNames
                .map(name => name.trim())
                .filter(
                    name =>
                        name.endsWith('.jpg') ||
                        name.endsWith('.jpeg') ||
                        name.endsWith('.png') ||
                        name.endsWith('.gif') ||
                        name.endsWith('.webp') ||
                        name.endsWith('.JPG') ||
                        name.endsWith('.JPEG') ||
                        name.endsWith('.PNG') ||
                        name.endsWith('.GIF') ||
                        name.endsWith('.WEBP')
                );

            return filtered;
        }
    }
);
