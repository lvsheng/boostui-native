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
         * @param [conf]
         */
        function (typeId, objId, conf) {
            assert(tagMap.get(objId) === null, objId + " already exist");
            EventTarget.call(this);
            if (objId === undefined) {
                objId = tagMap.genTag();
            }

            tagMap.set(objId, this);
            this.__tag__ = objId;

            if (objId > 1) { //TODO: 要这样来过滤吗？0为rootElement、1为nativeGlobal、负数为已有对象
                bridge.create(typeId, this.__tag__, conf);
            }
        },
        {
            "get tag": function () {
                return this.__tag__;
            },

            /**
             * @param method {string}
             * @param args {Array}
             * @private
             */
            __callNative: function (method, args) {
                bridge.invoke(this.__tag__, method, args);
            },

            __onEvent: function (type, event) {
                //do nothing
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
        createAnimation: NativeObject.bindNative("createAnimation"), //TODO: remove
        startAnimation: NativeObject.bindNative("startAnimation"), //TODO: remove
        cancelAnimation: NativeObject.bindNative("cancelAnimation"), //TODO: remove
        //FOR TEST
        test: NativeObject.bindNative("test"), //TODO: remove

        //__destroy: NativeObject.bindNative("destroy"),
        destroyObject: function (tag) {
            this.__destroy(tag);
        }
    });

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
        console.info("origin:" + origin, "type:" + type, e);
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
    window.addEventListener("unload", function (e) {
        bridge.destroyAll();
    });

    // 页面加载时，先尝试删除所有 NativeView
    bridge.destroyAll();

    module.exports = NativeObject;
});
