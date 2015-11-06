define(function (require, exports, module) {
    "use strict";

    var genQueue = require("boost/genQueue");
    var hasOwnProperty = require("base/hasOwnProperty");
    var copyProperties = require("base/copyProperties");
    var assert = require("base/assert");
    var methodMap = require("boost/methodMap");
    var nativeCallbackMap = require("boost/nativeCallbackMap");

    var queue = genQueue(function (list) {
        lc_bridge.callQueue(list);
    });
    queue.run();

    //一定程度上可认为对应native的PageEntity
    var bridge = {
        /**
         * @param objId
         * @param methodName
         * @param params
         * @param [callback]
         */
        invoke: function (objId, methodName, params, callback) {
            var cmd = [objId, methodMap.tryGetMethodId(methodName), params];
            if (callback) {
                cmd.push(nativeCallbackMap.genCallback(callback));
            }
            queue.push(cmd);
        },

        create: function (typeId, objId, conf) {
            this.__invokeOnBridge("create", [objId, typeId, conf || {}]);
        },
        destroy: function (objId) {
            this.__invokeOnBridge("destroy", [objId]);
        },
        destroyAll: function () {
            this.__invokeOnBridge("destroyAll", []);
            queue.flush();
        },
        postMessage: function (message) {
            this.__invokeOnBridge("postMessage", [message]);
        },
        addLayer: function (layerId, zIndex) {
            this.__invokeOnBridge("addLayer", [layerId, zIndex]);
        },
        getMethodMapping: function (callback) {
            this.__invokeOnBridge("getMethodMapping", [], callback);
        },

        flush: function () {
            queue.flush();
        },

        /**
         * @param methodName
         * @param params
         * @param [callback]
         * @private
         */
        __invokeOnBridge: function (methodName, params, callback) {
            this.invoke(0, methodName, params, callback);
        }
    };

    //TODO: 拿到map后把bridge里已有cmd也更新为数字?
    bridge.getMethodMapping(function (obj) {
        if (obj.state === "success" && obj.data) {
            methodMap.setMap(obj.data);
        }
    });

    module.exports = bridge;

    //TODO: 合并命令(NativeElement中)：
    //var createHeap;
    //var updateHeap;
    //
    //function clearHeap() {
    //    createHeap = {};
    //    updateHeap = {};
    //}
    //
    //clearHeap();
    //switch (method) {
    //    case "createView":
    //        viewTag = "_" + args[0];
    //
    //        //将 config 参数存起来,方便 update 的时候改动
    //        config = copyProperties({}, args[2]);
    //        createHeap[viewTag] = config;
    //        args[2] = config;
    //        //args[2] = {};
    //        break;
    //
    //    case "updateView":
    //
    //        viewTag = "_" + args[0];
    //
    //        //如果 create 堆里有需要 update 的节点,则直接更新 config
    //        if (hasOwnProperty(createHeap, viewTag)) {
    //            copyProperties(createHeap[viewTag], args[2]);
    //            return;
    //        }
    //
    //        //如果 update 堆里有需要 update 的节点,则直接更新 config
    //        if (hasOwnProperty(updateHeap, viewTag)) {
    //            copyProperties(updateHeap[viewTag], args[2]);
    //            return;
    //        }
    //
    //        //将 config 参数存起来,方便下次 update 的时候改动
    //        config = copyProperties({}, args[2]);
    //        updateHeap[viewTag] = config;
    //        args[2] = config;
    //        //args[2] = {};
    //        break;
    //
    //    default:
    //    // nothing
    //}

});
