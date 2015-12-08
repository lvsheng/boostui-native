define(function (require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var TYPE_ID = -7; //TODO: edit
    /**
     * 提供离线缓存的能力
     * 目前提供的接口比较简单粗暴
     */
    var OfflineCache = derive(NativeObject, function () {
        NativeObject.call(this, null, TYPE_ID);
    }, {
        /**
         * 增加规则
         * 若rule为string，缓存其对应的url
         * 若rule为RegExp，缓存后续请求中正则匹配中的url
         * @param rule {string|RegExp}
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

    function ruleToRegStr (rule) {
        var reg;
        if (type(rule) === "string") {
            reg = new RegExp(rule.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        } else {
            assert(type(rule) === "regexp");
            reg = rule;
        }
        return reg.toString();
    }

    module.exports = new OfflineCache();
});
