define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var each = require("base/each");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var boolean = require("boost/validator").boolean;
    var number = require("boost/validator").number;
    var Linkage = require("boost/nativeObject/Linkage");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");
    var boostEventGenerator = require("boost/boostEventGenerator");

    var ViewPager = require("boost/ViewPager");
    var Carousel = derive(NativeElement, function () {
        ViewPager.call(this);
    }, {
        __getRealTagName: function () {
            return "Carousel";
        },
        "set loop": function (value) {
            this.__update("loop", boolean(value));
        },
        "set speed": function (value) { //多久滚一次
            this.__update("duration", number(value));
        },
        "set loopScrollDuration": function (value) { //一次要多久
            this.__update("loopScrollDuration", number(value));
        },
        setLinkage: function (linkage) {
            assert(linkage instanceof Linkage);
            this.nativeObject.__callNative("setLinkage", [linkage.tag]);
        },
        getCurrentItem: function () {
            return this.__currentItem__;
        },
        /**
         * @param index {int}
         * @param [smooth] {boolean}
         */
        setCurrentItem: function (index, smooth) {
            if (nativeVersion.shouldUseWeb()) {
                this.__showItemInWeb(index);
                //选中事件在o2o下由native派发，而web下自己派发
                boostEventGenerator.gen("selected", {position: index}, this.tag);
            } else {
                this.nativeObject.__callNative("setCurrentItem", [index, smooth || true]);
            }
            //真正对this.__currentItem__的修改在__onEvent里统一对web与o2o下进行
        },

        __createWebElement: function (info) {
            return document.createElement("div");
        },
        __addComposedChildAt: function (child, index) {
            if (nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.display = index === this.__currentItem__ ? "block" : "none";
            }
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            if (child && nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.display = "block";
            }
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
        },
        __showItemInWeb: function (index) {
            assert(index < this.__children__.length, "index of item to show could not exceed the amount of children");
            assert(nativeVersion.shouldUseWeb());

            each(this.__children__, function (child, childIndex) {
                var childWebElement = child.__native__.__webElement__;
                childWebElement.style.display = childIndex === index ? "block" : "none";
            });
        }
    });
    module.exports = Carousel;
});
