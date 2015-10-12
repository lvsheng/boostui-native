define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");

    //var NATIVE_VIEW_TYPE = "WrappedToastViewGroup";
    var NATIVE_VIEW_TYPE = 8;
    var Toast = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Toast");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "Toast");
    }, {
        show: function (view) {
            this.nativeObject.__callNative("show", [view.nativeObject.tag]);
        },
        "get duration": function () {
            return this.__config__.duration;
        },
        "get gravityVertical": function () {
            return this.__config__.gravityVertical;
        },
        "get gravityHorizontal": function () {
            return this.__config__.gravityHorizontal;
        },
        "set duration": function (value) {
            assert(value === "long" || value === "short", "duration只能为long|short");
            this.__update("duration", value);
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
    module.exports = Toast;
});
