define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var TYPE_ID = require("boost/TYPE_ID");

    var Toast = derive(NativeElement, function (conf) {
        conf = conf || {};
        //this._super(NATIVE_VIEW_TYPE, "Toast");
        NativeElement.call(this, TYPE_ID.TOAST, "Toast");
        if (conf.duration) {
            this.duration = conf.duration;
        }
        if (conf.gravityVertical) {
            this.gravityVertical = conf.gravityVertical;
        }
        if (conf.gravityHorizontal) {
            this.gravityHorizontal = conf.gravityHorizontal;
        }
    }, {
        show: function () {
            this.nativeObject.__callNative("show", []);
        },
        cancel: function () {
            this.nativeObject.__callNative("cancel", []);
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
