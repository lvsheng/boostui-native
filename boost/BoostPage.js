define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var StyleSheet = require("boost/StyleSheet");

    var NATIVE_VIEW_TYPE = 20;
    var ViewStyle = derive(StyleSheet, LayoutPropTypes);
    var BoostPage = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "BoostPage");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "BoostPage");
    }, {
        __getStyle: function () {
            return new ViewStyle();
        },
        loadUrl: function (url) {
            this.nativeObject.__callNative("loadUrl", [url]);
        },
        reload: function () {
            this.nativeObject.__callNative("reload", []);
        },
        canGoBackOrForward: function (steps, callback) {
            this.nativeObject.__callNative("canGoBackOrForward", [steps], callback);
        },
        goBackOrForward: function (steps) {
            this.nativeObject.__callNative("goBackOrForward", [steps]);
        }
    });
    module.exports = BoostPage;
});
