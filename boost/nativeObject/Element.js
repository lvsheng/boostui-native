define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var bridge = require("boost/bridge");
    var toCamelCase = require("base/toCamelCase");

    var ElementNativeObject = derive(NativeObject, function (typeId, objId) {
            NativeObject.call(this, typeId, objId);
        },
        {
            addView: function (child, index) {
                bridge.invoke(this.__tag__, "addView", [child.__native__.__tag__, index]);
            },

            updateView: function (key, value) {
                bridge.invoke(this.__tag__, "set" + toCamelCase(key, true), [value]);
            },

            removeViewAt: function (index) {
                bridge.invoke(this.__tag__, "removeViewAt", [index]);
            }
        }
    );

    module.exports = ElementNativeObject;
});
