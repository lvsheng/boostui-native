define(function (require, exports, module) {
    /**
     * @param str
     * @param [upperFirstChar=false] {boolean}
     * @returns {string}
     */
    module.exports = function toCamelCase(str, upperFirstChar) {
        var camel = str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
        return upperFirstChar ? camel[0].toUpperCase() + camel.slice(1) : camel;
    };
});
