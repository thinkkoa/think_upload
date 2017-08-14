/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const mime = require('mime-types');
const lib = require('think_lib');
const aliyun = require('./aliyun.js');
const ftp = require('./ftp.js');
const local = require('./local.js');

/**
 * 
 * 
 * @param {any} options 
 * @param {any} ctx 
 * @param {any} file 
 */
module.exports = function* (options, ctx, file) {
    if (!lib.isEmpty(file.originalFilename) && !lib.isEmpty(file.path) && !lib.isEmpty(file.size)) {
        let mimetype = mime.extension(file.type);
        if ((options.file_allow_type || '').split('|').indexOf(mimetype) < 0) {
            ctx.throw('上传的文件类型非法');
        }
        if (file.size > options.max_file_size) {
            ctx.throw('上传的文件大小超过限制');
        }
        file.newFileName = lib.md5(file.originalFilename + file.size) + '.' + mimetype;
        file.newFilePath = lib.datetime('', 'YYYY/MM/DD') + '/';
        let newFileUrl = '';
        switch (options.upload_type) {
            case 'ftp':
                newFileUrl = yield ftp(options, file);
                break;
            case 'ftp':
                newFileUrl = yield aliyun(options, file);
                break;
            default:
                newFileUrl = yield local(options, file);
                break;
        }
        if (!lib.isEmpty(newFileUrl)) {
            return { filename: file.newFileName, fileurl: newFileUrl, filesize: file.size, fileType: mimetype };
        } else {
            ctx.throw('上传文件错误');
            return null;
        }
    }
    return null;
};