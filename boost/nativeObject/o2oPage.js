define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var O2OPage_TYPE_ID = -3;
    /**
     * 只能在背景页中使用，前景页无法使用
     * 供背景页用作与前景页通信的中介（向前景页发送消息，监听前景页发来的消息）
     */
    var O2OPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, O2OPage_TYPE_ID);
    }, {
        exit: function () {
            this.__callNative("exit", []);
        },
        attachToPopWindow: function (menuNativeObjectId) {
            this.__callNative("attachToPopWindow", [menuNativeObjectId]);
        },
        follow: function (conf) {
            this.__callNative("subscribeLight", [conf.appid, 'clouda', false]); //TODO: conf.is_silence参数的支持？
        },
        unfollow: function (conf) {
            this.__callNative("unsubscribeLight", [conf.appid, 'clouda']);
        },
        checkFollow: function (conf) {
            this.__callNative("isSubscribeLight", [conf.appid]);
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
        }
    });

    module.exports = new O2OPageNativeObject();
});
