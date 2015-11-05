define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

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
        follow: function (conf) {
            this.__callNative("subscribe", [conf.appid, false]); //TODO: conf.is_silence参数的支持？
        },
        unfollow: function (conf) {
            this.__callNative("unsubscribe", [conf.appid]);
        },
        checkFollow: function (conf) {
            this.__callNative("querySubscribe", [conf.appid]);
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

        showInputMethod: function () {
            this.__callNative("showInputMethod", []);
        },
        hideInputMethod: function () {
            this.__callNative("hideInputMethod", []);
        }
    });

    module.exports = new LightApiNativeObject();
});
