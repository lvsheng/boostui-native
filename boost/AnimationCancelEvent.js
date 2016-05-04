define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var AnimationEvent = require("boost/AnimationEvent");

    var AnimationCancelEvent = derive(AnimationEvent, function (target, nowValue) {
        AnimationEvent.call(this, target, "cancel");
        this._nowValue = nowValue;
    }, {
        "get nowValue": function () {
            return this._nowValue;
        }
    });

    module.exports = AnimationCancelEvent;
});
