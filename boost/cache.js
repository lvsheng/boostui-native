define(function (require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var nativeVersion = require("boost/nativeVersion");

    var SUPPORT_VERSION = 2.4; //TODO: 目前2.3开发中，还未支持，故先写为2.4
    var OBJ_ID = -10; //TODO: edit
    /**
     * 提供离线缓存的能力
     * 目前提供的接口比较简单粗暴
     */
    var OfflineCache = derive(NativeObject, function () {
        NativeObject.call(this, null, OBJ_ID);
    }, {
        /**
         * 增加规则
         *  string内的'*'字符可匹配任意子串
         *  string中可以使用"./"与"../"书写相对路径
         *  若string以'/'开头，表示从当前域根目录开始匹配
         *  若string以非"http://"或"https://"开头，表示从当前目录开始匹配
         * @param rule {string}
         */
        addRule: function (rule) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("addRule", [ruleToRegStr(rule)]);
        },
        /**
         * 删除规则
         * @param rule
         */
        removeRule: function (rule) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeRule", [ruleToRegStr(rule)]);
        },
        /**
         * 更新url对应的缓存内容
         * @param url
         */
        updateContent: function (url) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("updateContent", [url]);
        },
        /**
         * 删除url对应的缓存内容
         * @param url
         */
        removeContent: function (url) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeContent", [url]);
        },
        /**
         * 删除所有缓存的内容
         * 注：目前会删除其他页面缓存的内容。后续需改良缓存方案以解决此问题
         */
        removeAllContent: function () {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeAllContent", []);
        }
    });

    /**
     *  若string以'/'开头，表示从当前域根目录开始匹配
     *  若string以非"http://"或"https://"开头，表示从当前目录开始匹配
     *  string内的'*'字符可匹配任意子串
     *  string中可以使用"./"与"../"书写相对路径
     * @param rule
     * @returns {string}
     */
    function ruleToRegStr (rule) {
        var h = dropHash(location.href);
        var str = rule;

        //把所有./去掉
        str = str.replace(/(^|\/)\.\//g, "$1");

        //根目录补全
        if (str[0] === "/") {
            str = location.origin + str;
        }

        if (!/^https?:\/\//.test(str)) {
            //当前目录补全
            str = h.slice(0, h.lastIndexOf("/")) + "/" + str;
        } else {
            //去除hash部分
            str = dropHash(str);
        }

        //处理所有../
        str = str.replace(/\/([^\/]*)\/\.\.\//g, "/");

        //转义特殊字符
        //var reg = new RegExp(rule.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        //var reg = new RegExp(rule.replace(/([\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        //str = str.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, "\\$1");
        str = str.replace(/([\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, "\\$1");

        var magicStr = "#LKDSJFOINJlkasdfjoi21223400asjdflkj";
        //处理** (这里将2个以上的*都处理掉)
        str = str.replace(/\*{2,}/g, "." + magicStr); //防止直接替换成*与用户写的*混淆，这里替换成一个临时魔术数

        //处理单个的*
        str = str.replace(/\*/g, "[^/]*");

        //将magicStr再换回*
        str = str.replace(magicStr, "*");

        //加^与$
        str = "^" + str + "$";

        //console.log(str);
        return str;
    }
    function dropHash (url) {
        if (url.indexOf("#") === -1) {
            return url;
        }
        return url.slice(0, url.indexOf("#"));
    }

    module.exports = new OfflineCache();
});
