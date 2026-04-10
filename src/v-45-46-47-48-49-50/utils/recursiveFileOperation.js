import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

/* eslint-disable no-await-in-loop */
/* eslint-disable require-await */
/* eslint-disable consistent-return */

/* Gio.File */
Gio._promisify(Gio.File.prototype, 'enumerate_children_async');
Gio._promisify(Gio.File.prototype, 'query_info_async');

/* Gio.FileEnumerator */
Gio._promisify(Gio.FileEnumerator.prototype, 'next_files_async');

/**
 *
 * @param {Gio.File} file - the file or directory
 * @param {File.Type} fileType - single file or directory
 * @param {object} array - array to hold file names
 */
async function recursiveGetFileNamesCallback(file, fileType, array) {
    switch (fileType) {
    case Gio.FileType.REGULAR: {
        array.push(file.get_uri());
        return;
    }

    case Gio.FileType.DIRECTORY: {
        return recursiveFileOperation(file, recursiveGetFileNamesCallback, array);
    }

    default:
        return null;
    }
};

/**
 * Recursively operate on @file and any children it may have.
 *
 * @param {Gio.File} file - the file or directory
 * @param {Function} callback - a function that will be passed the file,
 *     file type (e.g. regular, directory), and @cancellable
 * @param {object} array - array to hold file names
 * @returns {Promise} a Promise for the operation
 */
async function recursiveFileOperation(file, callback, array) {
    const fileInfo = await file.query_info_async('standard::type',
        Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT,
        null);

    const fileType = fileInfo.get_file_type();

    // If @file is a directory, collect all the operations as Promise branches
    // and resolve them in parallel
    if (fileType === Gio.FileType.DIRECTORY) {
        const iter = await file.enumerate_children_async('standard::type', Gio.FileQueryInfoFlags.NOFOLLOW_SYMLINKS, GLib.PRIORITY_DEFAULT, null);

        const branches = [];

        while (true) {
            const fileInfos = await iter.next_files_async(100, GLib.PRIORITY_DEFAULT, null);

            if (fileInfos.length === 0)
                break;

            for (const info of fileInfos) {
                const child = iter.get_child(info);
                const childType = info.get_file_type();

                // The callback decides whether to process a file, including
                // whether to recurse into a directory
                const branch = callback(child, childType, array);

                if (branch)
                    branches.push(branch);
            }
        }

        await Promise.all(branches).catch(e => console.log(e));
    }

    // Return the Promise for the top-level file
    return callback(file, array);
}

export {recursiveFileOperation, recursiveGetFileNamesCallback};
