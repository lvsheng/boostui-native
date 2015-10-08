define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var slice = require("base/slice");
    var EventTarget = require("boost/EventTarget");
    var tagMap = require("boost/tagMap");
    var bridge = require("boost/bridge");
    var toCamelCase = require("base/toCamelCase");

    var NativeObject = derive(
        EventTarget,
        /**
         * @param typeId
         * @param [objId]
         */
        function (typeId, objId) {
            assert(tagMap.get(objId) === null, objId + " already exist");
            EventTarget.call(this);
            if (objId === undefined) {
                objId = tagMap.genTag();
            }

            tagMap.set(objId, this);
            this.__tag__ = objId;

            if (objId > 1) { //TODO: 要这样来过滤吗？0为rootElement、1为nativeGlobal、负数为已有对象
                bridge.create(typeId, this.__tag__);
            }
        },
        {
            "get tag": function () {
                return this.__tag__;
            },

            addView: function (child, index) {
                bridge.invoke(this.__tag__, "addView", [child.__native__.__tag__, index]);
            },

            updateView: function (key, value) {
                bridge.invoke(this.__tag__, "set" + toCamelCase(key, true), [value]);
            },

            removeViewAt: function (index) {
                //bridge.invoke(this.__tag__, "removeView", [child.__native__.__tag__]);
                bridge.invoke(this.__tag__, "removeViewAt", [index]);
            },

            __callNative: function (method, args) { //TODO: remove
                bridge.call(this.__tag__, method, args);
            },

            __onEvent: function (type, event) {
                //do nothing
            },

            destroy: function () {
                bridge.destroy(this.__tag__); //TODO: 待验证
            }
        }
    );

    NativeObject.bindNative = function (method) {
        return function () {
            this.__callNative(method, slice(arguments));
        };
    };

    var GLOBAL_TAG = null;
    var GLOBAL_OBJ_ID = 1;
    var NativeGlobalObject = derive(NativeObject, function () {
        //this._super(GLOBAL_TAG);
         NativeObject.call(this, GLOBAL_TAG, GLOBAL_OBJ_ID);
    }, {
        removeAllViews: NativeObject.bindNative("removeAllViews"),
        createAnimation: NativeObject.bindNative("createAnimation"),
        startAnimation: NativeObject.bindNative("startAnimation"),
        cancelAnimation: NativeObject.bindNative("cancelAnimation"),
        //FOR TEST
        test: NativeObject.bindNative("test"),

        //__destroy: NativeObject.bindNative("destroy"),
        destroyObject: function (tag) {
            this.__destroy(tag);
        }
    });

    //TODO: remove this?
    var nativeGlobal = new NativeGlobalObject();
    NativeObject.global = nativeGlobal;

    NativeObject.getByTag = function (tag) {
        var obj = tagMap.get(tag);
        if (obj !== null && obj instanceof NativeObject) {
            return obj;
        }
        return null;
    };


    // 监听统一的 boost 事件
    document.addEventListener("boost", function (e) {
        var origin = e.origin;
        var target = NativeObject.getByTag(origin);
        var type = e.boostEventType.toLowerCase();
        //console.log("origin:" + origin, "type:" + type, e);
        if (target) {
            // 这里为了提高效率，就不用 dispatchEvent 那一套了。
            target.__onEvent(type, e);
        } else if (type === "boosterror") {
            console.error(e.stack);
            //TODO 构建错误显示界面
            //throw new NativeError(e.stack);
        }
    }, false);

    // 页面卸载时,删除所有的 NativeView
    //TODO
    //window.addEventListener("unload", function (e) {
    //    nativeGlobal.removeAllViews();
    //    bridge.flush();
    //});

    // 页面加载时，先尝试删除所有 NativeView
    //nativeGlobal.removeAllViews();

    module.exports = NativeObject;
});
