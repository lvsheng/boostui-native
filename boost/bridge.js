define(function (require, exports, module) {
    "use strict";

    var genQueue = require("boost/genQueue");
    var hasOwnProperty = require("base/hasOwnProperty");
    var copyProperties = require("base/copyProperties");
    var assert = require("base/assert");
    var methodMap = require("boost/methodMap");

    var methodList = [ //TODO: remove
        "createView",
        "updateView",
        "addView",
        "removeView",
        "createAnimation",
        "startAnimation",
        "cancelAnimation"
    ];

    var queue = genQueue(function (list) {
        //for test
        //console.log(JSON.stringify(list, null, 2));
        lc_bridge.callQueue(list);
        clearHeap();
    });
    queue.run();


    var createHeap;
    var updateHeap;

    function clearHeap() {
        createHeap = {};
        updateHeap = {};
    }

    clearHeap();

    var TAG_IDX = 0;
    var METH_IDX = 1;
    var ARGS_IDX = 2;

    var bridge = {
        call: function (tag, method, args) { //TODO: remove
            var cmd = [];
            var viewTag;
            var config;
            var methodIdOrName;
            // 对createView、updateView 等做优化
            if (tag === null) {
                switch (method) {
                case "createView":
                    viewTag = "_" + args[0];

                    //将 config 参数存起来,方便 update 的时候改动
                    config = copyProperties({}, args[2]);
                    createHeap[viewTag] = config;
                    args[2] = config;
                    //args[2] = {};
                    break;

                case "updateView":

                    viewTag = "_" + args[0];

                    //如果 create 堆里有需要 update 的节点,则直接更新 config
                    if (hasOwnProperty(createHeap, viewTag)) {
                        copyProperties(createHeap[viewTag], args[2]);
                        return;
                    }

                    //如果 update 堆里有需要 update 的节点,则直接更新 config
                    if (hasOwnProperty(updateHeap, viewTag)) {
                        copyProperties(updateHeap[viewTag], args[2]);
                        return;
                    }

                    //将 config 参数存起来,方便下次 update 的时候改动
                    config = copyProperties({}, args[2]);
                    updateHeap[viewTag] = config;
                    args[2] = config;
                    //args[2] = {};
                    break;

                default:
                    // nothing
                }
            }

            if (tag !== null) {
                cmd.push(tag);
            }
            methodIdOrName = methodList.indexOf(method);
            if (methodIdOrName < 0) {
                methodIdOrName = method;
                //throw new Error("Native 不支持此方法或者未绑定");
            }
            cmd.push(methodIdOrName);
            cmd.push(args);
            queue.push(cmd);
        },
        flush: function () {
            queue.flush();
        },

        //对应native的PageEntityBase
        invoke: function (objId, methodName, params) {
            queue.push([objId, methodMap.tryGetMethodId(methodName), params]);
        },
        create: function (typeId, objId, conf) {
            this.__callNative("create", [objId, typeId, conf || {}]);
        },
        destroy: function (objId) {
            this.__callNative("destroy", [objId]);
        },
        destroyAll: function () {
            this.__callNative("destroyAll", []);
            queue.flush();
        },
        postMessage: function (message) {
            this.__callNative("postMessage", [message]);
        },
        addLayer: function (layerId, zIndex) {
            this.__callNative("addLayer", [layerId, zIndex]);
        },
        __callNative: function (methodName, params) {
            queue.push([0, methodMap.tryGetMethodId(methodName), params]);
        }
    };

    module.exports = bridge;
});
