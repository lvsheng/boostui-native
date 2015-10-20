define(function (require, exports, module) {
    "use strict";

    var slice = require("base/slice");
    var assert = require("base/assert");
    var trim = require("base/trim");
    var hasOwnProperty = require("base/hasOwnProperty");

    var DEVICE_PIXEL_RATIO = window.devicePixelRatio;


    var validator = {
        map: function (set) {
            return function (value) {
                value = trim(value);
                assert(hasOwnProperty(set, value), "unknow key \"" + value + "\"");
                return set[value];
            };
        },
        oneOf: function ( /*list*/ ) {
            var list = slice(arguments);
            return function (value) {
                value = trim(value);
                assert(list.indexOf(value) > -1, "value mast be one of " + list.join());
                return value;
            };
        },

        string: function (value) {
            return String(value);
        },

        font: function (value) {
            return String(value);
        },

        px: function (value) {
            var regResult = /^(\-?\d+(?:\.\d+)?)(?:px)?$/.exec(value); //TODO: 目前阶段为了容错，暂时仍支持不加px单位，后续考虑不允许不写单位
            assert(!!regResult, "value must be number, unit must be px");
            return parseFloat(regResult[1]);
        },

        number: function (value) {
            assert(!isNaN(value) && isFinite(value), "must be number");
            value = parseFloat(value);
            return value;
        },

        boolean: function (value) {
            if (value !== true && value !== false) {
                value = trim(String(value)).toLowerCase();
                value = value === "true" ? true : value === "false" ? false : assert(false, "must be boolean");
            }
            return value;
        },

        color: (function () {
            var NAMEED_COLORS = {
                "transparent" : 0x00000000|0,
                "black"       : 0xff000000|0,
                "silver"      : 0xffc0c0c0|0,
                "gray"        : 0xff808080|0,
                "white"       : 0xffffffff|0,
                "maroon"      : 0xff800000|0,
                "red"         : 0xffff0000|0,
                "purple"      : 0xff800080|0,
                "fuchsia"     : 0xffff00ff|0,
                "green"       : 0xff008000|0,
                "lime"        : 0xff00ff00|0,
                "olive"       : 0xff808000|0,
                "yellow"      : 0xffffff00|0,
                "navy"        : 0xff000080|0,
                "blue"        : 0xff0000ff|0,
                "teal"        : 0xff008080|0,
                "aqua"        : 0xff00ffff|0,
                "orange"      : 0xffffa500|0
            };
            var REG_HEX_RGB = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/;
            var REG_HEX_RRGGBB = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
            var REG_RGB = /^rgb\s*\(\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*\)$/;
            var REG_RGBA = /^rgba\s*\(\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*\)$/;
            //^[1-9]/d*/./d*|0/./d*[1-9]/d*$

            function getHexValue(value, maxValue) {
                return Math.round(value * 0xFF / maxValue) | 0;
                //value = Math.round(value * 0xFF / maxValue);
                //return value < 0x10 ? "0" + value.toString(16) : value.toString(16);
            }

            return function (value) {

                value = trim(value).toLowerCase();

                if (hasOwnProperty(NAMEED_COLORS, value)) {
                    return NAMEED_COLORS[value];
                }
                if (REG_HEX_RGB.test(value)) {
                    return parseInt("0xff" +
                        RegExp.$1 + RegExp.$1 +
                        RegExp.$2 + RegExp.$2 +
                        RegExp.$3 + RegExp.$3) | 0;
                }
                if (REG_HEX_RRGGBB.test(value)) {
                    return parseInt("0xff" +
                        RegExp.$1 +
                        RegExp.$2 +
                        RegExp.$3) | 0;
                }
                if (REG_RGB.test(value)) {
                    return
                        0xFF << 24 |
                        (getHexValue(parseFloat(RegExp.$1), 0xFF) << 16) | // r
                        (getHexValue(parseFloat(RegExp.$2), 0xFF) << 8 ) | // g
                        (getHexValue(parseFloat(RegExp.$3), 0xFF) << 0 ); // b
                }
                if (REG_RGBA.test(value)) {
                    return
                        (getHexValue(parseFloat(RegExp.$4), 1)    << 24) | // a
                        (getHexValue(parseFloat(RegExp.$1), 0xFF) << 16) | // r
                        (getHexValue(parseFloat(RegExp.$2), 0xFF) << 8 ) | // g
                        (getHexValue(parseFloat(RegExp.$3), 0xFF) << 0 ); // b
                }
                assert(false, "unknow color: \"" + value + "\"");
            };
        })()

    };

    module.exports = validator;

});
