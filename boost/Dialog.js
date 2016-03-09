define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");
    var lightApi = require("boost/nativeObject/lightApi");

    var Dialog = derive(NativeElement, function (conf) {
        conf = conf || {};
        //this._super(NATIVE_VIEW_TYPE, "Dialog");
        NativeElement.call(this, TYPE_ID.DIALOG, "Dialog");
        if (conf.gravityVertical) {
            this.gravityVertical = conf.gravityVertical;
        }
        if (conf.gravityHorizontal) {
            this.gravityHorizontal = conf.gravityHorizontal;
        }
    }, {
        show: function () {
            this.nativeObject.__callNative("show", []);

            if (nativeVersion.inIOS()) { //ios下展现弹窗时不会自动收起键盘，由web兼容
                lightApi.hideInputMethod();
            }

            if (nativeVersion.shouldUseWeb()) {
                this._webDialogLayer = boost.addLayer(10);
                this._webDialogLayer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                this._updateWebLocation();
                this._webDialogLayer.appendChild(this);
            }
        },
        close: function () {
            this.nativeObject.__callNative("dismiss", []);

            if (nativeVersion.shouldUseWeb()) {
                this._webDialogLayer.removeChild(this);
                boost.removeLayer(this._webDialogLayer);
                this._webDialogLayer = null;
            }
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
            this._updateWebLocation();
        },
        "set gravityHorizontal": function (value) {
            assert(value === "left" || value === "center" || value === "right", "gravityHorizontal只能为left|center|right");
            this.__update("gravityHorizontal", value);
            this._updateWebLocation();
        },

        _updateWebLocation: function () {
            if (!this._webDialogLayer) {
                return;
            }

            var gravityToFlexLocation = {
                "top": "flex-start",
                "left": "flex-start",
                "bottom": "flex-end",
                "right": "flex-end",
                "center": "center"
            };
            this._webDialogLayer.style.alignItems = gravityToFlexLocation[this.gravityVertical] || "center";
            this._webDialogLayer.style.justifyContent = gravityToFlexLocation[this.gravityHorizontal] || "center";
        }
    });
    module.exports = Dialog;
});
