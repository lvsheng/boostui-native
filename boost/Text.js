define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var TextStylePropTypes = require("boost/TextStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");
    var TYPE_ID = require("boost/TYPE_ID");

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
            this.__update("value", value);

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "value",
                attributeValue: value,
                propagationStoped: true
            })
        },
        "set numberOfLines": function (value) {
            this.__update("numberOfLines", validator.number(value));
        },
        "set multiline": function (value) {
            this.__update("multiline", validator.boolean(value));
        },
        "set ellipsize": function (value) {
            this.__update("ellipsize", validator.string(value));
        },
        "get innerHTML": function () {
            return this.value;
        }
    });
    module.exports = Text;
});
