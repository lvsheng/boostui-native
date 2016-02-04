define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var htmlEscape = require("base/htmlEscape");
    var NativeElement = require("boost/NativeElement");
    var TextStylePropTypes = require("boost/TextStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var TextStyle = derive(StyleSheet, TextStylePropTypes);

    var Text = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Text");
        NativeElement.call(this, TYPE_ID.TEXT, "Text");
    }, {
        __getStyle: function () {
            return new TextStyle();
        },
        "get value": function () {
            return this.__config__.value || "";
        },
        "set value": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                //这里为了与native统一，value中的空格与换行都按原样展示，用innerHTML并转义为html实体
                this.__native__.__webElement__.innerHTML = escapeValueInWeb(value);
            }
            this.__update("value", value);

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "value",
                attributeValue: value,
                propagationStoped: true
            });

            function escapeValueInWeb (value) {
                return htmlEscape(value)
                    .replace(/ /g, "&nbsp;")
                    .replace(/\n/g, "<br/>");
            }
        },
        "set numberOfLines": function (value) {
            this.__update("numberOfLines", validator.number(value));
        },
        "set multiline": function (value) {
            this.__update("multiline", validator.boolean(value));

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.style["display"] = "-webkit-box";
                this.__native__.__webElement__.style["-webkit-line-clamp"] = value === "false" ? 1 : "initial";
            }
        },
        "set ellipsize": function (value) {
            this.__update("ellipsize", validator.string(value));

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.style["-webkit-box-orient"] = "vertical";
            }
        },
        "get innerHTML": function () {
            return this.value;
        }
    });
    module.exports = Text;
});
