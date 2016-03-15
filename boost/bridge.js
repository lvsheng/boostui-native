define(function (require, exports, module) {
    "use strict";

    var genQueue = require("boost/genQueue");
    var hasOwnProperty = require("base/hasOwnProperty");
    var copyProperties = require("base/copyProperties");
    var assert = require("base/assert");
    var methodMap = require("boost/methodMap");
    var nativeCallbackMap = require("boost/nativeCallbackMap");

    var lc_bridge = (function () {
        var INJECT_PREFIX = 'O2OZone#YIFMWBUIQ98S38FR:';
        var lc_bridge = {};
        var console = window.console;
        lc_bridge.callQueue = function(list) {
            send(list);
        };

        var queue = [];
        var isReady = false;
        var inIOS = navigator.userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/);
        if (!inIOS) {
            isReady = true;
        } else {
            var readyRE = /complete|loaded|interactive/;
            if (readyRE.test(document.readyState)) {
                isReady = true;
            } else {
                window.addEventListener("load", function () {
                    setTimeout(function () {
                        isReady = true;
                        send();
                    }, 1);
                });
            }
        }

        function send (cmds) {
            if (cmds) {
                queue = queue.concat(cmds);
            }

            if (isReady) {
                console.log(INJECT_PREFIX + JSON.stringify(queue)); //for android
                window.sendIOSData && window.sendIOSData(JSON.stringify(queue)); //for ios
                window.webkit && window.webkit.messageHandlers.sendIOSData.postMessage(queue); //for ios8+
                queue = [];
            } else {
                //未ready之时(认为一定在ios下)用网络请求来发
                location.href = "o2o://sendIOSData" + encodeURIComponent(JSON.stringify(queue));
                queue = [];
            }
        }

        function sendIOSData (data) {
        }

        return lc_bridge
    })();

    var queue = genQueue(function (list) {
        lc_bridge.callQueue(list);
    });
    queue.run();

    var interceptedCommandsCollector = null;
    //一定程度上可认为对应native的PageEntity
    var bridge = {
        /**
         * 截获之后的cmd至commandsCollector中
         * 被截获的命令将不再被执行
         * 最初应用：在ListView中生成命令并交给native以便其重复执行
         * @param commandsCollector
         */
        interceptCommands: function (commandsCollector) {
            assert(!interceptedCommandsCollector, "commands已被截获，暂不支持嵌套截获");
            interceptedCommandsCollector = [];
        },
        finishIntercept: function () {
            var result = interceptedCommandsCollector;
            interceptedCommandsCollector = null;
            return result;
        },

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
            if (interceptedCommandsCollector) {
                interceptedCommandsCollector.push(cmd);
                return;
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
        removeLayer: function (layerId) {
            this.__invokeOnBridge("removeLayer", [layerId]);
        },
        getMethodMapping: function () {
            //TODO: 拿到map后把bridge里已有cmd也更新为数字?
            this.__invokeOnBridge("getMethodMapping", [], function (obj) {
                if (obj.state === "success" && obj.data) {
                    console.log("methodMapping got", obj);
                    methodMap.setMap(obj.data);
                }
            });
            this.flush();
        },

        flush: function () {
            queue.flush();
        },

        //loading相关
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
