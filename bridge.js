"use strict";
(function(window) {
    var INJECT_PREFIX = 'O2OZone#YIFMWBUIQ98S38FR:';
    var lc_bridge = window.lc_bridge = window.lc_bridge || {};
    var console = window.console;
    lc_bridge.callQueue = function(list) {
        send(list);
    };

    var queue = [];
    var isReady = false;
    var inAndroid = navigator.userAgent.indexOf("BaiduRuntimeO2OZone") > -1; //FIXME
    if (inAndroid) {
        isReady = true;
    } else {
        window.addEventListener("load", function () {
            setTimeout(function () {
                isReady = true;
                send();
            }, 1);
        });
    }

    function send (cmds) {
        if (cmds) {
            queue = queue.concat(cmds);
        }

        if (isReady) {
            console.log(INJECT_PREFIX + JSON.stringify(queue)); //for android
            window.sendIOSData && window.sendIOSData(JSON.stringify(queue)); //for ios
            queue = [];
        }
    }

    function sendIOSData (data) {
    }
})(window);
