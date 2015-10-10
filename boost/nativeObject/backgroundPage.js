define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有特定代码才能使用
    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var BACKGROUND_PAGE_TYPE_ID = -1; //TODO: 是这个吗？
    /**
     * 供前景页用作与背景页通信的中介（向背景页发送消息，监听背景页发来的消息）
     */
    var BackgroundPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, BACKGROUND_PAGE_TYPE_ID);
    }, {
        postMessage: function (action, data) {
            //console.info("---------- to background page ----------", action, data);
            lc_bridge.callQueue([
                ["postMessage", [{
                    action: action,
                    data: data
                }]]
            ]);
        }
    });

    module.exports = new BackgroundPageNativeObject();
});
