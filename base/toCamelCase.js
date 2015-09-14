define(function (require, exports, module) {
    module.exports = function toCamelCase(str) {
        return str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
    };
});
