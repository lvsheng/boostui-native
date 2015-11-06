define(function (require, exports, module) {
    var map = {};

    exports.tryGetMethodId = function (methodName) {
        return map[methodName] || methodName;
    };
    exports.setMap = function (newMap) {
        map = newMap;
    };
});
