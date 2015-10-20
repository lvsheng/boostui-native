define("base/isPlainObject", function (require, exports, module) {
    var type = require("base/type");

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }
    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    module.exports = isPlainObject;
});
