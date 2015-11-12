define(function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var slice = require("base/slice");
    var EventTarget = require("boost/EventTarget");
    var tagMap = require("boost/tagMap");
    var bridge = require("boost/bridge");
    var toCamelCase = require("base/toCamelCase");
    require("boost/nativeEventHandler");

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
             * @param [callback] {Function}
             * @private
             */
            __callNative: function(method, args, callback) {
                bridge.invoke(this.__tag__, method, args, callback);
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

    module.exports = NativeObject;
});
