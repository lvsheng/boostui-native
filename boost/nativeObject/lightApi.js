define(function (require, exports, module) {
    //TODO: 改名: commonUtil
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var nativeVersion = require("boost/nativeVersion");

    var LIGHT_API_TYPE_ID = -7;
    /**
     * 供背景页用作与前景页通信的中介（向前景页发送消息，监听前景页发来的消息）
     */
    var LightApiNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, LIGHT_API_TYPE_ID);
    }, {
        __onEvent: function (type, event) {
            switch (type) {
                case "subscribe":
                case "unsubscribe":
                case "subscribestate":
                    this.dispatchEvent({
                        type: type,
                        data: event.data
                    });
                    break;
            }
            return event && event.propagationStoped;
        },
        follow: function (conf, callback) {
            this.__callNative("subscribe", [conf], callback);
        },
        unfollow: function (conf, callback) {
            this.__callNative("unsubscribe", [conf], callback);
        },
        checkFollow: function (conf, callback) {
            this.__callNative("querySubscribe", [conf], callback);
        },
        /**
         * @param conf
         * @param [callback]
         */
        share: function (conf, callback) {
            var data = {
                title: conf.title,
                url: conf.linkUrl,
                content: conf.content,
                weixin_send_url: true,
                share_type: 0, //mediaType不生效，全为0
                weibo_title: conf.title,
                weixin_title: conf.title,
                weixin_timeline_title: conf.title,
                weixin_description: conf.content,
                thumb_img_url: conf.imageUrl,
                img_url: conf.imageUrl
            };
            if (nativeVersion.get() < 2.3) {
                this.__callNative("shareApp", [data]);
            } else {
                //2.3之后支持了回调
                this.__callNative("shareApp", [data], callback || function () {});
            }
        },
        IMConsult: function (conf) {
            this.__callNative("consult", [conf], function () {});
        },

        showInputMethod: function () {
            this.__callNative("showInputMethod", []);
        },
        hideInputMethod: function () {
            this.__callNative("hideInputMethod", []);
        },
        getO2OWindowSize: function (callback) {
            this.__callNative("getNativeLayerSize", [], callback);
        },
        getLocatedCity: function (callback) {
            this.__callNative("getLocationCityName", [], callback);
        },

        /**
         * 只应由背景页调用
         * 用于通知native背景页ready了
         * 背景：开始没网时，背景页与前景页都加载失败，但有网后点击刷新如果只刷新前景页则背景页仍然不出现导致前景页打开新页面等功能不能被响应
         * 故背景页ready后通知native，native在刷新前景页且背景页没有ready时同时刷新背景页
         * add at v2.3
         */
        setBackgroundPageReady: function () {
            this.__callNative("setBackgroundPageReady", []);
        }
    });

    module.exports = new LightApiNativeObject();
});
