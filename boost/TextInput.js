define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var TextStylePropTypes = require("boost/TextStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");
    var Event = require("boost/Event");
    var TouchEvent = require("boost/TouchEvent");
    var FocusEvent = require("boost/FocusEvent");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var TextStyle = derive(StyleSheet, TextStylePropTypes);

    var TextInput = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "TextInput");
        NativeElement.call(this, TYPE_ID.TEXT_INPUT, "TextInput");
    }, {
        __getStyle: function () {
            return new TextStyle();
        },
        __onEvent: function (type, e) {
            var event;
            switch (type) {
                case "focus":
                case "blur":
                    event = new FocusEvent(this, type);
                    this.dispatchEvent(event);
                    break;
                case "change":
                    this.__config__.value = e.data.text;
                    event = new Event(this, "change");
                    this.dispatchEvent(event);
                    break;
                case "search":
                    event = new Event(this, "search");
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        "get value": function () {
            return this.__config__.value || "";
        },
        "set value": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.value = value;
            }
            this.__update("value", value);

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "value",
                attributeValue: value,
                propagationStoped: true
            })
        },
        "get editable": function () {
            return this.__config__.editable || true;
        },
        "set editable": function (value) {
            this.__update("editable", validator.boolean(value));
        },
        "get multiline": function () {
            return this.__config__.multiline || true;
        },
        "set multiline": function (value) {
            this.__update("multiline", validator.boolean(value));
        },
        "get password": function () {
            return this.__config__.password || false;
        },
        "set password": function (value) {
            this.__update("password", validator.boolean(value));
        },
        "set keyboardType": function (value) {
            this.__update("keyboardType", validator.string(value));
        },
        "set numberOfLines": function (value) {
            this.__update("numberOfLines", validator.number(value));
        },
        "set placeholder": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.placeholder = value;
            }

            this.__update("placeholder", validator.string(value));
        },
        "get placeholder": function (value) {
            return this.__config__.placeholder || "";
        },
        "set placeholderTextColor": function (value) {
            this.__update("placeholderTextColor", validator.color(value));
        },
        blur: function () {
            this.__native__.__callNative("blur", []);
        },
        focus: function () {
            this.__native__.__callNative("focus", []);
        },

        __createWebElement: function () {
            var input = document.createElement("input");
            input.type = "text";
            return input;
        }
    });
    module.exports = TextInput;
});
