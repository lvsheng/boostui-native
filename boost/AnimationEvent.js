define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");

    var AnimationEvent = derive(Event, function (target, type) {
        assert(type === "start" || type === "end" || type === "cancel", "unknow animation event type:\"" + type + "\"")
        Event.call(this, target, type);
    });

    module.exports = AnimationEvent;
});
