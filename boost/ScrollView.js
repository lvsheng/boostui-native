define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var generateBoostEventFromWeb = require("boost/generateBoostEventFromWeb");
    var Couple = require("boost/nativeObject/Couple");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var ScrollView = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "ScrollView");
        NativeElement.call(this, TYPE_ID.SCROLL_VIEW, "ScrollView");
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "scroll":
                    var event = new Event(this, "scroll");
                    event.data = e.data;
                    event.stopPropagation();
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            //assert(false, "ScrollView 不支持 style 属性");
            return new ViewStyle();
        },
        __createWebElement: function (info) {
            var el = document.createElement("div");
            el.style.overflow = "auto";

            //因为scroll事件不冒泡，故只能在单个元素上监听
            el.addEventListener("scroll", generateBoostEventFromWeb);

            return el;
        },
        scrollTo: function (location) {
            this.nativeObject.__callNative("scrollTo", [location]);
        },
        setLinkage: function (couple) {
            assert(couple instanceof Couple);
            this.nativeObject.__callNative("setLinkage", [couple.tag]);
        },
        __addComposedChildAt: function (child, index) {
            if (nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.overflow = "visible"; //scrollView的子元素如果也是overflow:hidden，滚动时会卡
            }
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            if (child && nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.overflow = "hidden"; //恢复__addComposedChildAt中所改的值
            }
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
        }
    });
    module.exports = ScrollView;
});
