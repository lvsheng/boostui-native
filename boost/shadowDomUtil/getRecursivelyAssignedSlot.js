define(function (require, exports, module) {
    module.exports = function (node) {
        var result = node;
        while (result.__assignedSlot__) {
            result = result.__assignedSlot__;
        }
        return result;
    };
});
