define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有特定代码才能使用. TODO: 要不要继承自BoostPage
    var derive = require("base/derive");
    var assert = require("base/assert");
    var bridge = require("boost/bridge");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var Event = require("boost/Event");
    var mainFrontPage = require("boost/mainFrontPage");
    var BACKGROUND_PAGE_TYPE_ID = -1;
    /**
     * 供前景页用作与背景页通信的中介（向背景页发送消息，监听背景页发来的消息）
     * 也可用作背景页自己操作自己的boostPage
     */
    var BackgroundPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, BACKGROUND_PAGE_TYPE_ID);
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "back":
                    this.dispatchEvent(new Event(this, "back"));
                    break;
                case "closepage":
                    this.dispatchEvent(new Event(this, "closepage"));
                    break;
                default:
                    console.log("unknow event:" + type, e);
            }
            return event && event.propagationStoped;
        },

        /**
         * @param url
         * @param [useMiddlePage] {boolean}
         * @param [tipText]
         * @param [delay] {number} 毫秒为单位
         */
        openNewPage: function (url, useMiddlePage, tipText, delay) {
            var data = {
                url: completeUrl(url),
                useMiddlePage: useMiddlePage,
                tipText: tipText,
                delay: delay
            };
            this.postMessage("openPage", data);
        },
        openNewPageFromBg: function (url) {
            assert(/^https?:\/\//.test(url), "背景页打开新页面，必需传入完整url");
            mainFrontPage.dispatchEvent({
                type: "message",
                data: {
                    action: "openPage",
                    data: {
                        url: url
                    }
                }
            });
        },
        postMessage: function (action, data) {
            bridge.postMessage({
                action: action,
                data: data
            });
        },
        jsHandleBack: function () {
            this.__callNative("jsHandleBack", [true]);
        },
        exit: function () {
            this.__callNative("exit", []);
        }
    });

    module.exports = new BackgroundPageNativeObject();

    function completeUrl (inValue) {
        if (/^https?:\/\//.test(inValue)) {
            return inValue;
        }

        if (inValue[0] === "/") {
            return location.origin + inValue;
        }

        var h = location.href;
        return h.slice(0, h.lastIndexOf("/")) + "/" + inValue.slice(1);
    }
});
