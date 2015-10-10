define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有背景页可以使用？
    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var O2OPage_TYPE_ID = -3;
    /**
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
        }
    });

    module.exports = new O2OPageNativeObject();
});
