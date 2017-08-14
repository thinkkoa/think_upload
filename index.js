/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/11
 */
const lib = require('think_lib');
const upload = require('./lib/upload.js');
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

module.exports = function (options) {
    options = options ? lib.extend(defaultOptions, options, true) : defaultOptions;
    return function (ctx, next) {
        lib.define(ctx, 'uploadFile', function () {
            if (!lib.isEmpty(ctx._file)) {
                let ps = [];
                for (let n in ctx._file) {
                    ps.push(lib.generatorToPromise(upload)(options, ctx._file[n]));
                }
                return Promise.all(ps);
            }
            return Promise.resolve();
        });
        return next();
    };
};