define(function (require, exports, module) {
    /**
     * 驼峰/中划线命名转下划线命名
     * @param {string} string
     * @returns {string}
     */
    module.exports = function (string) {
        var result = string;
        result = result.replace(/([A-Z])/g, "-$1").toLowerCase();

        if (result.charAt(0) === "-") {
            return result.substring(1);
        } else {
            return result;
        }
    };
});
