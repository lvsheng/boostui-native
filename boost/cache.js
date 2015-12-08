define(function (require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var TYPE_ID = -107; //TODO: edit
    /**
     * 提供离线缓存的能力
     * 目前提供的接口比较简单粗暴
     */
    var OfflineCache = derive(NativeObject, function () {
        NativeObject.call(this, null, TYPE_ID);
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
            this.__callNative("addRule", [ruleToRegStr(rule)]);
        },
        /**
         * 删除规则
         * @param rule
         */
        removeRule: function (rule) {
            this.__callNative("removeRule", [ruleToRegStr(rule)]);
        },
        /**
         * 更新url对应的缓存内容
         * @param url
         */
        updateContent: function (url) {
            this.__callNative("updateContent", [url]);
        },
        /**
         * 删除url对应的缓存内容
         * @param url
         */
        removeContent: function (url) {
            this.__callNative("removeContent", [url]);
        },
        /**
         * 删除所有缓存的内容
         * 注：目前会删除其他页面缓存的内容。后续需改良缓存方案以解决此问题
         */
        removeAllContent: function () {
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
        var h = location.href;
        h = h.slice(0, h.indexOf("#"));
        var str = rule;
        str.replace(/(^|\/)\.\//g, "$1"); //把所有./去掉
        if (str[0] === "/") {
            str = location.origin + str;
        }
        if (!/^https?:\/\//.test(str)) {
            str = h.slice(0, h.lastIndexOf("/")) + "/" + str;
        }
        str.replace(/\/([^\/]*)\/\.\.\//g, "/"); //处理所有../
        str.replace(/\*/g, ".*");

        //var reg = new RegExp(rule.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        //var reg = new RegExp(rule.replace(/([\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        str = str.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, "\\$1"); //转义特殊字符
        return str;
    }

    module.exports = new OfflineCache();
});
