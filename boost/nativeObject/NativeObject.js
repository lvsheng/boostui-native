define(function(require, exports, module) {
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
        function(typeId, objId, conf) {
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
        }, {
            "get tag": function() {
                return this.__tag__;
            },

            destroy: function() {
                bridge.destroy(this.__tag__);
            },

            /**
             * @param method {string}
             * @param args {Array}
             * @private
             */
            __callNative: function(method, args) {
                bridge.invoke(this.__tag__, method, args);
            },

            /**
             * @param type
             * @param event
             * @private
             * @returns {boolean} 事件是否被取消掉
             *  为了构造click事件的地方能拿到touchstart/touchend是否被取消进而作为是否产生click的判断依据，通过此方法返回
             *  子类必需记得返回此值！
             */
            __onEvent: function(type, event) {
                //do nothing
                return event && event.propagationStoped;
            }
        }
    );

    NativeObject.bindNative = function(method) {
        return function() {
            this.__callNative(method, slice(arguments));
        };
    };

    var GLOBAL_TAG = null;
    var GLOBAL_OBJ_ID = 1;
    var NativeGlobalObject = derive(NativeObject, function() {
        //this._super(GLOBAL_TAG);
        NativeObject.call(this, GLOBAL_TAG, GLOBAL_OBJ_ID);
    }, {
        createAnimation: NativeObject.bindNative("createAnimation"), //TODO: remove
        startAnimation: NativeObject.bindNative("startAnimation"), //TODO: remove
        cancelAnimation: NativeObject.bindNative("cancelAnimation"), //TODO: remove
        //FOR TEST
        test: NativeObject.bindNative("test"), //TODO: remove

        //__destroy: NativeObject.bindNative("destroy"),
        destroyObject: function(tag) {
            this.__destroy(tag);
        }
    });

    var nativeGlobal = new NativeGlobalObject();
    NativeObject.global = nativeGlobal;

    NativeObject.getByTag = function(tag) {
        var obj = tagMap.get(tag);
        if (obj !== null && obj instanceof NativeObject) {
            return obj;
        }
        return null;
    };


    var lastTouchStartX = null;
    var lastTouchStartY = null;
    var lastTouchTarget = null;
    var lastTouchType = ""; //"start"|"end"
    var lastTouchStartStopped = false;
    // 监听统一的 boost 事件
    document.addEventListener("boost", function(e) {
        var origin = e.origin;
        var target = NativeObject.getByTag(origin);
        var type = e.boostEventType.toLowerCase();
        var data = e.data;
        var tx;
        var ty;
        var eventStopped = false;

        //if (type == "touchend") return; //TODO:

        console.info("origin:" + origin, "type:" + type, e);
        if (target) {
            // 这里为了提高效率，就不用 dispatchEvent 那一套了。
            eventStopped = target.__onEvent(type, e);

            switch (type) {
                case "touchstart":
                    lastTouchStartX = data.x;
                    lastTouchStartY = data.y;
                    lastTouchTarget = target;
                    break;

                case "touchend":
                    if (
                        lastTouchTarget === target
                            //必需有连续并且未被stop的一对touchstart-touchend，才发出click （初衷: scrollview滚动中的点停不要触发内部子元素的click）
                        && lastTouchType === "start" && !lastTouchStartStopped && !eventStopped
                    ) {
                        // 判断距离，触发点击事件
                        tx = lastTouchStartX - data.x;
                        ty = lastTouchStartY - data.y;
                        if (Math.pow(tx, 2) + Math.pow(ty, 2) < Math.pow(2, 2)) {
                            target.__onEvent("click", e);
                        }
                    }
                    lastTouchStartX = 0;
                    lastTouchStartY = 0;
                    lastTouchTarget = null;
            }

            if (type === "touchstart") {
                lastTouchType = "start";
                lastTouchStartStopped = eventStopped;
            } else if (type === "touchend") {
                lastTouchType = "end";
            }
        }
    }, false);

    document.addEventListener("boosterror", function(e) {
        console.error(e.message + "\n" + e.stack);
    }, false);

    // 页面卸载时,删除所有的 NativeView
    window.addEventListener("unload", function(e) {
        bridge.destroyAll();
    });

    // 页面加载时，先尝试删除所有 NativeView
    bridge.destroyAll();

    module.exports = NativeObject;
});
