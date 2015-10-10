define(function (require, exports, module) {
    "use strict";

    //TODO: 怎样限制只有背景页里我们自己的代码才能使用？
    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var BACKGROUNDPAGETPAGE_ID = -3; //TODO: 是这个吗？
    var FrontPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, BACKGROUNDPAGETPAGE_ID);
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

    module.exports = new FrontPageNativeObject();
});
