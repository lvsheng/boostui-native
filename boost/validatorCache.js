define(function (require, exports, module) {
    var cache = {};

    exports.get = function (key, value) {
        return cache[getCacheKey(key, value)];
    };
    exports.set = function (key, value, validatorRes) {
        cache[getCacheKey(key, value)] = validatorRes;
    };

    function getCacheKey (key, value) {
        return key + value;
    }
});
