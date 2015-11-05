define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");

    var Event = derive(Object, function (target, type, data) {
        this.__target__ = target;
        this.__type__ = type;
        this.__defaultPrevented__ = false;
        this.__propagationStopped__ = false;
        this.__timeStamp__ = (new Date()).getTime();
    }, {
        "get target": function () {
            return this.__target__;
        },
        "get type": function () {
            return this.__type__;
        },
        preventDefault: function () {
            this.__defaultPrevented__ = true;
        },
        "get defaultPrevented": function () {
            return this.__defaultPrevented__;
        },
        stopPropagation: function () {
            this.__propagationStopped__ = true;
        },
        "get propagationStoped": function () {
            return this.__propagationStopped__;
        },
        "get timeStamp": function () {
            return this.__timeStamp__;
        }
    });

    module.exports = Event;

});
