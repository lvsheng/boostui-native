define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var StyleSheet = require("boost/StyleSheet");

    var NATIVE_VIEW_TYPE = 20;
    var ViewStyle = derive(StyleSheet, LayoutPropTypes);
    var FgBoostPage = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "FgBoostPage");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "FgBoostPage");
    }, {
        __onEvent: function (type, event) {
            // 从前台页面传来的消息与页面刷新事件，抛出事件供背景页监听
            if (type === "message") {
                this.dispatchEvent({
                    type: "message",
                    data: event.data
                });
            } else if (type === "pagestarted") {
                this.dispatchEvent({
                    type: "pagestarted",
                    data: event.data
                });
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            return new ViewStyle();
        },
        loadUrl: function (url) {
            this.nativeObject.__callNative("loadUrl", [url]);
        },
        reload: function () {
            this.nativeObject.__callNative("reload", []);
        },
        canGoBackOrForward: function (steps, callback) {
            this.nativeObject.__callNative("canGoBackOrForward", [steps], callback);
        },
        goBackOrForward: function (steps) {
            this.nativeObject.__callNative("goBackOrForward", [steps]);
        },
        goBack: function () {
            this.nativeObject.__callNative("goBack", []);
        },
        dispatchEventToWebView: function (type, data) {
            var javascriptUrl = [
                "javascript:  (function(){" +
                "console.info('event from bg: " + type + ", " + JSON.stringify(data) + "');",
                "   var data = " + JSON.stringify(data) + ";",
                "   var event = document.createEvent('Event');",
                "   event.initEvent(\"" + type + "\" , false, false);",
                "   event.data = data;",
                "   window.dispatchEvent(event);" +
                "})();"
            ].join('');
            this.loadUrl(javascriptUrl);
            console.info("loadUrl of boostPage: ", javascriptUrl);
        },

        updateMenu: function (menuNativeObjectId) {
            this.nativeObject.__callNative("updateMenu", [menuNativeObjectId]);
        },
        dismissMenu: function () {
            this.nativeObject.__callNative("dismissMenu", []);
        },
        //展示关闭按钮
        showExitButton: function (show) {
            this.nativeObject.__callNative("showExitButton", [show]);
        },

        //loading相关
        //FIXME: 背景页有可能调用到（只不过目前没有前景页给背景页发命令触发调用场景），但native有此方法的代码已回退，后续看是否需要恢复，若不需要，删除此处方法
        handleLoading: function () {
            this.__invokeOnBridge("handleLoading", [true]);
        },
        cancelHandleLoading: function () {
            this.__invokeOnBridge("handleLoading", [false]);
        },
        showLoading: function (text) {
            this.__invokeOnBridge("showLoading", [text || "正在加载..."]);
        },
        hideLoading: function () {
            this.__invokeOnBridge("hideLoading", []);
        },
        setLoadingTextOnce: function (text) {
            this.nativeObject.__callNative("setLoadingText", [text]);
        },

        onResume: function () {
            this.nativeObject.__callNative("onResume", []);
        }
    });
    module.exports = FgBoostPage;
});
