define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有背景页可以使用？
    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var FRONTPAGE_ID = -2;
    var FrontPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, FRONTPAGE_ID);
    }, {
        __onEvent: function (type, event) {
            //console.info(type, event);
            // 从前台页面传来的消息与页面刷新事件，继续抛出供背景页使用
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
        }
    });

    module.exports = new FrontPageNativeObject();
});
