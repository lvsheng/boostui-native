define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var toCamelCase = require("base/toCamelCase");
    var TYPE_ID = require("boost/TYPE_ID");

    var FontNativeObject = derive(NativeObject, function (fontName, src) {
        this.__fontName = fontName;
        this.__src = src;
        NativeObject.call(this, TYPE_ID.FONT, undefined, { url: this.__src });
    }, {
        "get src": function () {
            return this.__src;
        },
        "get fontName": function () {
            return this.__fontName;
        }
    });

    module.exports = FontNativeObject;
});
