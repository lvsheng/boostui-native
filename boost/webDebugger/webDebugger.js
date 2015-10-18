define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var webMonitor = require("boost/webDebugger/webMonitor");
    var boostMonitor = require("boost/webDebugger/boostMonitor");
    var webContainer = require("boost/webDebugger/webContainer");

    exports.start = function () {
        webMonitor.start();
        boostMonitor.start();
        document.documentElement.insertBefore(webContainer.getContainerElement(), document.body);
    };
});
