define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var boolean = require("boost/validator").boolean;
    var number = require("boost/validator").number;
    var Couple = require("boost/nativeObject/Couple");

    //var NATIVE_VIEW_PAGER_TYPE = "WrappedToastViewGroup";
    var NATIVE_VIEW_PAGER_TYPE = 15;
    var ViewPager = derive(NativeElement, function () {
        NativeElement.call(this, NATIVE_VIEW_PAGER_TYPE, "ViewPager");
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "selected":
                    var event = new Event(this, "selected");
                    event.data = { position: e.data.position };
                    this.dispatchEvent(event);
                    break;
                case "pagescroll":
                    var event = new Event(this, "pagescroll");
                    event.stopPropagation(); //scroll不冒泡与捕获
                    event.data = {  }; //TODO
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            return new ViewStyle();
        },
        "set loop": function (value) {
            this.__update("loop", boolean(value));
        },
        "set duration": function (value) { //多久滚一次
            this.__update("duration", number(value));
        },
        "set loopScrollDuration": function (value) { //一次要多久
            this.__update("loopScrollDuration", number(value));
        },
        setLinkage: function (couple) {
            assert(couple instanceof Couple);
            this.nativeObject.__callNative("setLinkage", [couple.tag]);
        },
        /**
         * @param index {int}
         * @param [smooth] {boolean}
         */
        setCurrentItem: function (index, smooth) {
            this.nativeObject.__callNative("setCurrentItem", [index, smooth || false]);
        }
    });
    module.exports = ViewPager;
});
