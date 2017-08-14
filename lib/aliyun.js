/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const fs = require('fs');

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 * @param {any} newFilePath 
 * @returns 
 */
module.exports = function (options, file) {
    let oss = require('aliyun-oss');
    let ossOptions = {
        accessKeyId: options.ali_access_key,
        accessKeySecret: options.ali_access_secret
    };

    return new Promise(function (fulfill, reject) {
        let store = oss.createClient(ossOptions);
        let fileUrl = options.ali_url + file.newFilePath + file.newFileName;
        store.putObject({
            bucket: options.ali_bucket,
            object: options.ali_path + file.newFilePath + file.newFileName,
            source: file.path
        }, function (err) {
            if (err) {
                reject(err);
            } else {
                //删除临时文件
                var fn = function () { };
                try {
                    fs.unlink(file.path, fn);
                    fulfill(fileUrl);
                } catch (e) { }
            }
        });
    });
};