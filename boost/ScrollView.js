define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var Couple = require("boost/nativeObject/Couple");

    //var NATIVE_VIEW_TYPE = "WrappedScrollView";
    var NATIVE_VIEW_TYPE = 3;
    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var ScrollView = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "ScrollView");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "ScrollView");
    }, {
        __getStyle: function () {
            //assert(false, "ScrollView 不支持 style 属性");
            return new ViewStyle();
        },
        scrollTo: function (location) {
            this.nativeObject.__callNative("scrollTo", [location]);
        },
        setLinkage: function (couple) {
            assert(couple instanceof Couple);
            this.nativeObject.__callNative("setLinkage", [couple.tag]);
        }
    });
    module.exports = ScrollView;
});
