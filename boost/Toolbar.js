//native版服务导航 TODO: 从boost基础库中抽离，改为用户自定义标签元素
define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var LayoutStyle = require("boost/LayoutStyle");

    //var NATIVE_VIEW_TYPE = "ToolbarWrapper";
    var NATIVE_VIEW_TYPE = 19;

    var Toolbar = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Toolbar");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "Toolbar");
    }, {
        __getStyle: function () {
            return new LayoutStyle();
        },
        //show之前应先setData
        setData: function (data) {
            this.__update("data", JSON.stringify(data));
        },
        show: function () {
            this.nativeObject.__callNative("showToolbar", []);
        },
        hide: function () {
            this.nativeObject.__callNative("hideToolbar", []);
        }
    });
    module.exports = Toolbar;
});
