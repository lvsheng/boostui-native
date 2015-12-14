"use strict";
(function(window) {
    var INJECT_PREFIX = 'O2OZone#YIFMWBUIQ98S38FR:';
    var lc_bridge = window.lc_bridge = window.lc_bridge || {};
    var console = window.console;
    lc_bridge.callQueue = function(list) {
        console.log(INJECT_PREFIX + JSON.stringify(list));
    };
})(window);
