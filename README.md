# 介绍
-----

[![npm version](https://badge.fury.io/js/think_upload.svg)](https://badge.fury.io/js/think_upload)
[![Dependency Status](https://david-dm.org/thinkkoa/think_upload.svg)](https://david-dm.org/thinkkoa/think_upload)

Upload files for ThinkKoa.

# 安装
-----

```
npm i think_upload
```

# 使用
-----

1、项目中增加中间件 middleware/upload.js
```
module.exports = require('think_upload');
```

2、项目中间件配置 config/middleware.js:
```
list: [...,'upload'], //加载的中间件列表
config: { //中间件配置
    ...,
    upload: {
        
    }
}
```

3、使用：

```js
let info = await ctx.uploadFile(); // [{filename: '..', fileurl: '..', filesize: 10}] or null
```