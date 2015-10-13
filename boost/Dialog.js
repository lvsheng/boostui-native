define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");

    //var NATIVE_VIEW_TYPE = "WrappedDialogViewGroup";
    var NATIVE_VIEW_TYPE = 9;
    var Dialog = derive(NativeElement, function (conf) {
        conf = conf || {};
        //this._super(NATIVE_VIEW_TYPE, "Dialog");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "Dialog");
        if (conf.gravityVertical) {
            this.gravityVertical = conf.gravityVertical;
        }
        if (conf.gravityHorizontal) {
            this.gravityHorizontal = conf.gravityHorizontal;
        }
    }, {
        show: function (view) {
            this.nativeObject.__callNative("show", [view.nativeObject.tag]);
        },
        close: function () {
            this.nativeObject.__callNative("dismiss", []);
        },
        "get gravityVertical": function () {
            return this.__config__.gravityVertical;
        },
        "get gravityHorizontal": function () {
            return this.__config__.gravityHorizontal;
        },
        "set gravityVertical": function (value) {
            assert(value === "top" || value === "center" || value === "bottom", "gravityVertical只能为top|center|bottom");
            this.__update("gravityVertical", value);
        },
        "set gravityHorizontal": function (value) {
            assert(value === "left" || value === "center" || value === "right", "gravityHorizontal只能为left|center|right");
            this.__update("gravityHorizontal", value);
        }
    });
    module.exports = Dialog;
});
