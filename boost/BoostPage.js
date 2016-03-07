define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ViewStyle = derive(StyleSheet, LayoutPropTypes);
    var BoostPage = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "BoostPage");
        NativeElement.call(this, TYPE_ID.BOOST_PAGE, "BoostPage");
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
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            return new ViewStyle();
        },
        loadUrl: function (url) {
            if (nativeVersion.inIOS()) {
                //ios中不能存在特殊字符，见URLWithString方法接口：https://developer.apple.com/library/prerelease/ios/documentation/Cocoa/Reference/Foundation/Classes/NSURL_Class/index.html#//apple_ref/occ/clm/NSURL/URLWithString:
                //  故需前端encodeUri，并需与浏览器行为保持一致：浏览器会逐字符按需进行转义。
                //  如`location.href = "http://baidu.com?a=中%E4%B8%AD"`，执行后浏览器在发送请求前会将中字同样转义而已转义内容不重复进行转义
                var replacerOfPercent = "__aslfdko23r128__"; //随机输入
                url = url.replace(/%([A-Z0-9]{2})/g, function (all, code) { //替换掉已转义的部分以防止重复转义
                    return replacerOfPercent + code;
                });
                url = encodeURI(url);
                url = url.replace(new RegExp(replacerOfPercent, "g"), "%"); //将之前的替换恢复
            }
            this.nativeObject.__callNative("loadUrl", [url]);
        },
        reload: function () {
            this.nativeObject.__callNative("reload", []);
        },
        canGoBack: function (callback) {
            if (nativeVersion.inIOS()) {
                this.nativeObject.__callNative("canGoBack", [], callback);
            } else {
                this.nativeObject.__callNative("canGoBackOrForward", [-1], callback);
            }
        },
        canGoForward: function (callback) {
            if (nativeVersion.inIOS()) {
                this.nativeObject.__callNative("canGoForward", [], callback);
            } else {
                this.nativeObject.__callNative("canGoBackOrForward", [1], callback);
            }
        },
        goBack: function () {
            this.nativeObject.__callNative("goBack", []);
        },
        goForward: function () {
            this.nativeObject.__callNative("goForward", []);
        },
        /**
         * @param type
         * @param data
         * @param [e]
         * @param [sendTo="window"]
         */
        dispatchEventToWebView: function (type, data, e, sendTo) {
            sendTo = sendTo || "window";
            var inIOS = nativeVersion.inIOS();
            var javascriptUrl = [
                (inIOS ? "" : "javascript:") + "(function(){",
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
            if (inIOS) { //ios下loadUrl不能传输javascript，故设立单独接口
                this.nativeObject.__callNative("loadJavaScript", [javascriptUrl]);
            } else {
                this.loadUrl(javascriptUrl);
            }
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
    module.exports = BoostPage;
});
