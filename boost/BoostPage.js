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
            } else if (type === "resume") {
                this.dispatchEvent({
                    type: "resume",
                    data: event.data
                });
            } else if (type === "stat") {
                this.dispatchEvent({
                    type: "stat",
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
        /**
         * @param type
         * @param data
         * @param [e]
         * @param [sendTo="window"]
         */
        dispatchEventToWebView: function (type, data, e, sendTo) {
            sendTo = sendTo || "window";
            var javascriptUrl = [
                "javascript:  (function(){",
                "console.info('event from bg: " + type + ", " + JSON.stringify(data) + ", " + JSON.stringify(e) + "');",
                "   var data = " + JSON.stringify(data) + ";",
                "   var event = document.createEvent('Event');",
                "   event.initEvent(\"" + type + "\" , false, false);",
                "   event.data = data;"
            ].join('');
            if (e) {
                javascriptUrl += [
                    "   var e = " + JSON.stringify(e) + ";",
                    "   for (var key in e) {",
                    "       event[key] = e[key];",
                    "   }"
                ].join('');
            }
            javascriptUrl += [
                "   " + sendTo + ".dispatchEvent(event);" +
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

        onResume: function () {
            //1. 通知native
            this.nativeObject.__callNative("onResume", []);
            //2. 派发事件（供背景页中更新右上角菜单、通知前景页以刷新前景页服务导航）
            this.dispatchEvent({ type: "resume" });
        }
    });
    module.exports = FgBoostPage;
});
