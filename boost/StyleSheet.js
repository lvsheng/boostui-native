define(function (require, exports, module) {
    "use strict";

    var DEVICE_PIXEL_RATIO = window.devicePixelRatio;
    var derive = require("base/derive");
    var trim = require("base/trim");
    var copyProperties = require("base/copyProperties");
    var hasOwnProperty = require("base/hasOwnProperty");
    var each = require("base/each");
    var slice = require("base/slice");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var PropertyChangeEvent = require("boost/PropertyChangeEvent");
    var validator = require("boost/validator");
    var validatorCache = require("boost/validatorCache");
    var toCamelCase = require("base/toCamelCase");

    var StyleSheet = derive(EventTarget, function () {
        //this._super();
        EventTarget.call(this);
        this.__styleProps__ = {};
    }, {

        //TODO
        // 现在的 cssText 是 Native 的格式，需要转换
        /*
         "get cssText": function () {
         return JSON.stringify(this.__getProps());
         },
         */
        "set cssText": function (value) {
            this.__styleProps__ = {};
            var list = String(value).split(";");
            var count = list.length;
            var index;
            var item;
            var parts;
            var key;

            for (index = 0; index < count; index++) {
                item = list[index];
                parts = item.split(":");
                key = toCamelCase(trim(parts[0]));
                this[key] = trim(parts[1]);
            }
        },
        __getProps: function () {
            return this.__styleProps__;
        },
        __onPropertyChange: function (key, value, origValue) {
            // nothing
        }
    });

    StyleSheet.createPropTypes = function ( /*base..., */ config) {
        var proto = {};
        var count = arguments.length;
        var index = 0;

        for (index = 0; index < count - 1; index++) {
            copyProperties(proto, arguments[index]);
        }

        config = arguments[index];

        each(config, function (array, key) {
            var curValidator = array[0];
            var defaultValue = array[1];

            //为了性能，直接从 __styleProps__ 获取值
            proto["get " + key] = function () {
                var value = hasOwnProperty(this.__styleProps__, key) ? this.__styleProps__[key] : "";
                return value;
            };

            proto["set " + key] = function (value) {
                var origValue = this.__styleProps__[key];
                //var event;

                var cachedValue = validatorCache.get(key, value);
                if (cachedValue === undefined) {
                    //null对应css中取消设置该值, "auto"对应css中设置值为"auto"
                    if (value === null || value === "auto") {
                        value = defaultValue;
                    } else {
                        value = curValidator(value);
                    }
                    validatorCache.set(key, value, value);
                } else {
                    value = cachedValue;
                }

                if (value !== origValue) {
                    this.__styleProps__[key] = value;
                    //改为直接的函数调用，提高性能
                    this.__onPropertyChange(key, value, origValue);
                    //event = new PropertyChangeEvent(this, key, value, origValue);
                    //this.dispatchEvent(event);
                }
            };
        });

        return proto;
    };

    module.exports = StyleSheet;

});
