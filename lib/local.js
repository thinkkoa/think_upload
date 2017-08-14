/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const lib = require('think_lib');

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 * @param {any} newFilePath 
 * @returns 
 */
module.exports = function (options, file) {
    let localSavePath = options.file_save_path + file.newFilePath;
    if (!lib.isDir(localSavePath)) {
        lib.mkDir(localSavePath);
    }
    //重命名移动文件
    return lib.reFile(file.path, localSavePath + file.newFileName).then(() => (options.file_save_url + file.newFilePath + file.newFileName));
};