/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const fs = require('fs');
const mime = require('mime');
const lib = require('think_lib');
/**
 * default options
 */
const defaultOptions = {
    upload_type: 'local', //上传方式 local, ftp, aliyun
    max_file_size: 100 * 1024 * 1024, //上传文件大小限制，默认100M
    file_allow_type: 'jpg|jpeg|png|bmp|gif|xls|doc|docx|zip|rar|ipa|apk', //允许上传的文件类型

    // upload_type='local'
    file_save_path: `${think.root_path}/static/uploads/`, //上传文件保存目录
    file_save_url: '/uploads/', //上传文件目录访问URL

    // upload_type='ftp'
    ftp_server: '', //ftp服务器ip或域名
    ftp_port: '', //ftp服务器端口
    ftp_user: '', //ftp服务器用户
    ftp_pwd: '', //ftp服务器密码
    ftp_url: '', //ftp服务器保存目录

    // upload_type='aliyun'
    ali_access_key: '', //阿里云OSS access_key
    ali_access_secret: '', //阿里云OSS access_secret
    ali_bucket: '', //阿里云OSS bucket
    ali_path: '', //阿里云OSS 保存目录
    ali_url: '', //阿里云OSS url,可以是OSS默认域名，也可以是绑定的自定义域名
};

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 * @param {any} newFilePath 
 * @returns 
 */
const doUploadFtp = function (options, file) {
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

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 * @param {any} newFilePath 
 * @returns 
 */
const doUploadAli = function (options, file) {
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

/**
 * 
 * 
 * @param {any} options 
 * @param {any} file 
 * @param {any} newFilePath 
 * @returns 
 */
const doUploadLocal = function (options, file) {
    let localSavePath = options.file_save_path + file.newFilePath;
    if (!lib.isDir(localSavePath)) {
        lib.mkDir(localSavePath);
    }
    //重命名移动文件
    return lib.reFile(file.path, localSavePath + file.newFileName).then(() => (options.file_save_url + file.newFilePath + file.newFileName));
};

/**
 * 
 * 
 * @param {any} options 
 * @param {any} ctx 
 * @param {any} file 
 */
const doUpload = function* (options, ctx, file) {
    if (!lib.isEmpty(file.originalFilename) && !lib.isEmpty(file.path) && !lib.isEmpty(file.size)) {
        let mimetype = mime.extension(mime.lookup(file.path));
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
                newFileUrl = yield doUploadFtp(options, file);
                break;
            case 'ftp':
                newFileUrl = yield doUploadAli(options, file);
                break;
            default:
                newFileUrl = yield doUploadLocal(options, file);
                break;
        }
        if (!lib.isEmpty(newFileUrl)) {
            return { filename: file.newFileName, fileurl: newFileUrl, filesize: file.size };
        } else {
            ctx.throw('上传文件错误');
            return null;
        }
    }
    return null;
};

/**
 * 
 * 
 * @param {any} options 
 * @param {any} ctx 
 * @returns 
 */
const upload = function (options, ctx) {
    if (!lib.isEmpty(ctx._file)) {
        let ps = [];
        for (let n in ctx._file) {
            ps.push(doUpload(options, ctx, ctx._file[n]));
        }
        return Promise.all(ps);
    }
    return Promise.resolve();
};

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    return function (ctx, next) {
        lib.define(ctx, 'uploadFile', function (){
            return upload(options, ctx);
        });
        return next();
    };
};