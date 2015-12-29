//native版服务导航 TODO: 从boost基础库中抽离，改为用户自定义标签元素
define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var LayoutStyle = require("boost/LayoutStyle");
    var backgroundPage = require("boost/nativeObject/backgroundPage");

    //var NATIVE_VIEW_TYPE = "ToolbarWrapper";
    var NATIVE_VIEW_TYPE = 19;

    var Toolbar = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Toolbar");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "Toolbar");
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "openpage":
                    //外界不需关心，不向外派发，这里直接处理
                    backgroundPage.postMessage("openPage", e.data);
                    break;
                case "share":
                    this.dispatchEvent(new Event(this, "share"));
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
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
