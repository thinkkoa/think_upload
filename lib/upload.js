/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const lib = require('think_lib');
const path = require('path');
const fileType = require('file-type');
const readChunk = require('read-chunk');
const mime = require('mime-types');
const aliyun = require('./aliyun.js');
const ftp = require('./ftp.js');
const local = require('./local.js');
const miniTypes = ['jpg', 'png', 'gif', 'webp', 'zip', 'tar', 'rar', 'gz', '7z', 'pdf', 'epub', 'docx', 'pptx', 'xlsx']; //, 'mp4', 'webm', 'mov', 'avi', '3gp', 'mp3'

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 */
module.exports = function* (options, file) {
    if (!lib.isEmpty(file.name) && !lib.isEmpty(file.path) && !lib.isEmpty(file.size)) {
        let mimetype, ftype;
        try {
            mimetype = path.extname(file.path).replace('.', '');
            if (miniTypes.indexOf(mimetype) > -1) {
                const buffer = readChunk.sync(file.path, 0, 4100);
                ftype = fileType(buffer);
            }
            //if file-type not support
            if (ftype) {
                mimetype = ftype.ext;
            } 
            // else {
            //     mimetype = mime.extension(file.type);
            // }
        } catch (e) { }
        if (!mimetype || (options.file_allow_type || '').split('|').indexOf(mimetype) < 0) {
            throw Error('上传的文件类型非法');
        }
        if (file.size > options.max_file_size) {
            throw Error('上传的文件大小超过限制');
        }
        file.newFileName = lib.md5(file.name + file.size) + '.' + mimetype;
        file.newFilePath = lib.datetime('', 'YYYY/MM/DD') + '/';
        let newFileUrl = '';
        switch (options.upload_type) {
            case 'ftp':
                newFileUrl = yield ftp(options, file);
                break;
            case 'aliyun':
                newFileUrl = yield aliyun(options, file);
                break;
            default:
                newFileUrl = yield local(options, file);
                break;
        }
        if (!lib.isEmpty(newFileUrl)) {
            return { filename: file.newFileName, fileurl: newFileUrl, filesize: file.size, fileType: mimetype };
        } else {
            throw Error('上传文件错误');
        }
    }
    return null;
};