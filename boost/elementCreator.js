define(function (require, exports, module) {
    var assert = require("base/assert");
    var hasOwnProperty = require("base/hasOwnProperty");
    var each = require("base/each");

    var tagMap = {};
    exports.register = function (tagName, options) {
        tagMap[tagName.toUpperCase()] = options.constructor;
    };
    exports.create = function (tagName) {
        tagName = tagName.toUpperCase();
        assert(hasOwnProperty(tagMap, tagName), "unknow tag \"" + tagName + "\"");
        return new tagMap[tagName]();
    };
});
