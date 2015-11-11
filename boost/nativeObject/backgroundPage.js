define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有特定代码才能使用
    var derive = require("base/derive");
    var assert = require("base/assert");
    var bridge = require("boost/bridge");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var Event = require("boost/Event");

    var BACKGROUND_PAGE_TYPE_ID = -1;
    /**
     * 供前景页用作与背景页通信的中介（向背景页发送消息，监听背景页发来的消息）
     * 也可用作背景页自己操作自己的boostPage
     */
    var BackgroundPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, BACKGROUND_PAGE_TYPE_ID);
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "back":
                    this.dispatchEvent(new Event(this, "back"));
                    break;
                default:
                    console.log("unknow event:" + type, e);
            }
            return event && event.propagationStoped;
        },
        postMessage: function (action, data) {
            bridge.postMessage({
                action: action,
                data: data
            });
        }
    });

    module.exports = new BackgroundPageNativeObject();
});
