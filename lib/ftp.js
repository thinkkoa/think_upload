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
    let ftp = require('ftp');
    let config = {
        host: options.ftp_server,
        port: options.ftp_port,
        user: options.ftp_user,
        password: options.ftp_pwd
    };
    return new Promise(function (fulfill, reject) {
        let client = new ftp();
        let fileUrl = options.ftp_url + file.newFilePath + file.newFileName;
        client.on('ready', function () {
            client.mkdir(file.newFilePath, true, function (err) {
                if (err) {
                    reject(err);
                } else {
                    client.put(file.path, file.newFilePath + file.newFileName, function (er, res) {
                        if (er) {
                            reject(er);
                        } else {
                            //删除临时文件
                            var fn = function () { };
                            try {
                                fs.unlink(file.path, fn);
                                fulfill(fileUrl);
                            } catch (e) { }
                        }
                    });
                }
            });
        });
        client.connect(config);
    });
};