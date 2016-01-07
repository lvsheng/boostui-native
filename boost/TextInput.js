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
    var generateBoostEventFromWeb = require("boost/generateBoostEventFromWeb");

    var TextStyle = derive(StyleSheet, TextStylePropTypes);

    var TextInput = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "TextInput");
        NativeElement.call(this, TYPE_ID.TEXT_INPUT, "TextInput");
        this.multiline = "false"; //FIXME: 由native设置默认值
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
                case "submit":
                case "search":
                    event = new Event(this, "submit");
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
        "set type": function (value) {
            this.__config__.type = value;

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.type = value;
                return;
            }

            switch (value) {
                case "text":
                    this.__update("keyboardType", validator.string("text"));
                    break;
                case "search":
                    this.__update("keyboardType", validator.string("web-search"));
                    break;
                case "number":
                    this.__update("keyboardType", validator.string("numeric"));
                    break;
                case "email":
                    this.__update("keyboardType", validator.string("email-address"));
                    break;
                case "url":
                    this.__update("keyboardType", validator.string("url"));
                    break;

                case "password":
                    this.__update("password", validator.boolean(value));
                    break;
            }
        },
        "get type": function () {
            return this.__config__.type;
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
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.blur();
            }
            this.__native__.__callNative("blur", []);
        },
        focus: function () {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.focus();
            }
            this.__native__.__callNative("focus", []);
        },

        __createWebElement: function () {
            var input = document.createElement("input");

            input.addEventListener("focus", generateBoostEventFromWeb);
            input.addEventListener("blur", generateBoostEventFromWeb);
            input.addEventListener("change", generateBoostEventFromWeb);
            input.addEventListener("input", detectChange);
            input.addEventListener("keyup", detectChange);
            //input.addEventListener("propertychange", detectChange);
            //input.addEventListener("change", detectChange);
            //input.addEventListener("click", detectChange);
            //input.addEventListener("paste", detectChange);
            input.addEventListener("keyup", function (e) {
                if (e.keyCode === 13) {
                    generateBoostEventFromWeb(e, "submit");
                }
            });

            function detectChange (e) {
                var el = e.target;
                if (el.getAttribute("data-oldValue") !== el.value) {
                    el.setAttribute("data-oldValue", el.value);
                    generateBoostEventFromWeb(e, "change");
                }
            }

            return input;
        }
    });
    module.exports = TextInput;
});
