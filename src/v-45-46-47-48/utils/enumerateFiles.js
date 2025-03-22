// SPDX-FileCopyrightText: 2020 Florian Müllner <fmuellner@gnome.org>
//
// SPDX-License-Identifier: GPL-2.0-or-later

// -*- mode: js2; indent-tabs-mode: nil; js2-basic-offset: 4 -*-

// we use async/await here to not block the mainloop, not to parallelize
/* eslint-disable no-await-in-loop */

// source code: https://extensions.gnome.org/extension/19/user-themes/
// Below code is edited by PRATAP PANABAKA <pratap@fastmail.fm>

import Gio from 'gi://Gio';
import GLib from 'gi://GLib';

Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

const enumerateFiles = async dir => {
    const fileInfos = [];
    let fileEnum;
    try {
        fileEnum = await dir.enumerate_children_async(
            Gio.FILE_ATTRIBUTE_STANDARD_NAME,
            Gio.FileQueryInfoFlags.NONE,
            GLib.PRIORITY_DEFAULT, null);
    } catch (e) {
        if (!e.matches(Gio.IOErrorEnum, Gio.IOErrorEnum.NOT_FOUND))
            logError(e);
        return [];
    }

    let infos;
    do {
        infos = await fileEnum.next_files_async(100, GLib.PRIORITY_DEFAULT, null);
        const filterdInfos = infos.filter(info => info.get_file_type() === Gio.FileType.REGULAR);
        fileInfos.push(...filterdInfos);
    } while (infos.length > 0);

    return fileInfos.map(info => info.get_name());
};

export default enumerateFiles;