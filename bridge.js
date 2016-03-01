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
    var inIOS = navigator.userAgent.match(/(iPad|iPhone|iPod)\s+OS\s([\d_\.]+)/);
    if (!inIOS) {
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
            window.webkit && window.webkit.messageHandlers.sendIOSData.postMessage(queue); //for ios8+
            queue = [];
        }
    }

    function sendIOSData (data) {
    }
})(window);
