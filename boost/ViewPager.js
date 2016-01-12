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
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ViewPager = derive(NativeElement, function () {
        NativeElement.call(this, TYPE_ID.VIEW_PAGER, "ViewPager");

        this.__curItemIndex = 0; //默认认为第一个元素被选中
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "selected":
                    var event = new Event(this, "selected");
                    event.data = { position: e.data.position };
                    this.dispatchEvent(event);

                    this.__curItemIndex = e.data.position;
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
            this.__config__.currentItem = index;

            if (nativeVersion.shouldUseWeb()) {
                //web下自己派发选中事件，而native下由nativeObject派发

            } else {
                this.nativeObject.__callNative("", [index, smooth || true]);
            }
        },

        __createWebElement: function (info) {
            return document.createElement("div");
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
    module.exports = ViewPager;
});
