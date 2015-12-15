define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var toCamelCase = require("base/toCamelCase");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ElementNativeObject = derive(NativeObject, function (typeId, objId, nativeElement) {
            NativeObject.call(this, typeId, objId);
            this.__nativeElement__ = nativeElement;

            if (nativeVersion.shouldUseWeb()) {
                if (typeId === TYPE_ID.ROOT_VIEW) {
                    this.__webElement__ = document.createElement("div");
                    this.__webElement__.id = "BOOST_ROOT_VIEW_" + this.__tag__;
                } else {
                    this.__webElement__ = document.createElement("div");
                }
            }
        },
        {
            addView: function (child, index) {
                if (nativeVersion.shouldUseWeb()) {
                    var el = this.__webElement__;
                    var referEl = this.__webElement__.childNodes[index];
                    var childEl = child.__native__.__webElement__;
                    if (index === el.childNodes.length) {
                        el.appendChild(childEl);
                    } else {
                        assert(!!referEl);
                        el.insertBefore(childEl, referEl);
                    }
                } else {
                    this.__callNative("addView", [child.__native__.__tag__, index]);
                }
            },

            updateView: function (key, value) {
                this.__callNative("set" + toCamelCase(key, true), [value]);
            },

            removeViewAt: function (index) {
                if (nativeVersion.shouldUseWeb()) {
                    this.__webElement__.removeChild(this.__webElement__.childNodes[index]);
                } else {
                    this.__callNative("removeViewAt", [index]);
                }
            },

            "get element": function () {
                return this.__nativeElement__;
            }
        }
    );

    module.exports = ElementNativeObject;
});
