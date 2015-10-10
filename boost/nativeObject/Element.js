define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var toCamelCase = require("base/toCamelCase");

    var ElementNativeObject = derive(NativeObject, function (typeId, objId) {
            NativeObject.call(this, typeId, objId);
        },
        {
            addView: function (child, index) {
                this.__callNative("addView", [child.__native__.__tag__, index]);
            },

            updateView: function (key, value) {
                this.__callNative("set" + toCamelCase(key, true), [value]);
            },

            removeViewAt: function (index) {
                this.__callNative("removeViewAt", [index]);
            }
        }
    );

    module.exports = ElementNativeObject;
});
