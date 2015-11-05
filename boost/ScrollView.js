define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
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

        //吞掉ScrollView在scroll中子元素的touch与click事件
        var UN_CLICKABLE_TIME = 180;
        var lastScrollTime;
        //console.error("4"); //for debug
        this.addEventListener("scroll", function (e) {
            console.info("time,scroll", e.timeStamp, e);
            lastScrollTime = e.timeStamp;
        });
        this.addEventListener("touchstart", function (e) {
            console.info("time,touchstart", e.timeStamp, e);
            if (e.origin === this.tag) {
                // 自己身上的touchend不屏蔽
                return;
            }
            if (!lastScrollTime) {
                return;
            }
            if (e.timeStamp - lastScrollTime < UN_CLICKABLE_TIME) {
                e.stopPropagation();
            }
        }, true);
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "scroll":
                    var event = new Event(this, "scroll");
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
