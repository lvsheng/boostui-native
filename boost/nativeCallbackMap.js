define(function (require, exports, module) {
    var tagMap = require("boost/tagMap");

    /**
     * @param {Function} callback
     * @returns {int} callbackId
     */
    exports.genCallback = function (callback) {
        var callbackId = tagMap.genTag();
        tagMap.set(callbackId, callback);
        return callbackId;
    };
    exports.get = function (callbackId) {
        return tagMap.get(callbackId);
    };
});
