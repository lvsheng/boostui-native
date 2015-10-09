define(function (require, exports, module) {
    module.exports = function randomColor (a) {
        var r = Math.random() * 255;
        var g = Math.random() * 255;
        var b = Math.random() * 255;
        if (a === undefined) {
            a = 1;
        }
        return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
    }
});
