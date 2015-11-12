define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var NativeElement = require("boost/NativeElement");
    var AnimationEvent = require("boost/AnimationEvent");
    var AnimationCancelEvent = require("boost/AnimationCancelEvent");
    var copyProperties = require("base/copyProperties");

    var TYPE_ANIMATION = 11;
    /**
     * @param typeId {int}
     * @param config {Object}
     * @param config.element {NativeElement}
     * @param config.* {*} 其他子Animation的配置
     */
    var Animation = derive(EventTarget, function (typeId, config) {
        EventTarget.call(this);
        this.__native__ = null;
        this.__create(typeId, config);
    }, {
        __create: function (typeId, config) {
            var self = this;
            var nativeConfig = copyProperties({}, config);
            delete nativeConfig.element;
            if (config.element) {
                assert(!config.element || config.element instanceof NativeElement, "Animation must apply on NativeElement");
                nativeConfig.target = config.element.tag;
            }

            var nativeObj = this.__native__ = new NativeObject(typeId, undefined, nativeConfig);
            nativeObj.__onEvent = function (type, e) {
                return self.__onEvent(type, e);
            };
        },
        start: function () {
            this.__native__.__callNative("start", []);
        },
        cancel: function () {
            this.__native__.__callNative("cancel", []);
        },
        __onEvent: function (type, e) {
            var event;
            switch (type) {
            case "start":
            case "end":
                event = new AnimationEvent(this, type);
                this.dispatchEvent(event);
                break;
            case "cancel":
                var nowValue; //cancel时会将当前值传入
                for (var key in e.data) { //只会传入一个值（动画处理的属性的值） TODO: 放在ProPAnimation里处理更合适？
                    nowValue = e.data[key];
                }
                event = new AnimationCancelEvent(this, type, nowValue);
                this.dispatchEvent(event);
                break;
            default:
                console.log("unknow event:" + type, e);
            }
            return event && event.propagationStoped;
        }
    });

    module.exports = Animation;
});
