define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var boolean = require("boost/validator").boolean;
    var Couple = require("boost/nativeObject/Couple");

    //var NATIVE_VIEW_PAGER_TYPE = "WrappedToastViewGroup";
    var NATIVE_VIEW_PAGER_TYPE = 15;
    var ViewPager = derive(NativeElement, function () {
        NativeElement.call(this, NATIVE_VIEW_PAGER_TYPE, "ViewPager");
    }, {
        __getStyle: function () {
            return new ViewStyle();
        },
        "set loop": function (value) {
            this.__update("loop", boolean(value));
        },
        setLinkage: function (couple) {
            assert(couple instanceof Couple);
            this.nativeObject.__callNative("setLinkage", [couple.tag]);
        }
    });
    module.exports = ViewPager;
});
