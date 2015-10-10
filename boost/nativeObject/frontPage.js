define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有背景页可以使用？
    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var FRONTPAGE_ID = -2;
    /**
     * 供背景页用作与前景页通信的中介（向前景页发送消息，监听前景页发来的消息）
     */
    var FrontPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, FRONTPAGE_ID);
    }, {
        __onEvent: function (type, event) {
            //console.info(type, event);
            // 从前台页面传来的消息与页面刷新事件，抛出事件供背景页监听
            if (type === "message") {
                this.dispatchEvent({
                    type: "message",
                    data: event.data
                });
            } else if (type === "pagestarted") {
                this.dispatchEvent({
                    type: "pagestarted"
                });
            }
        },
        reload: function () {
            this.__callNative("reload", []);
        },
        loadUrl: function (url) {
            this.__callNative("loadUrl", [url]);
        }
    });

    module.exports = new FrontPageNativeObject();
});
