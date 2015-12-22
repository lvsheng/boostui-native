define(function (require, exports, module) {
    //TODO: 改名: commonUtil
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var OBJ_ID = -7;
    /**
     * 供背景页用作与前景页通信的中介（向前景页发送消息，监听前景页发来的消息）
     */
    var LightApiNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, OBJ_ID);
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
        share: function (conf) {
            this.__callNative("shareApp", [{
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
            }]);
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
        }
    });

    module.exports = new LightApiNativeObject();
});
