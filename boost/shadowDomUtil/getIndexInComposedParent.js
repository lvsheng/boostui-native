define(function (require, exports, module) {
    var assert = require("base/assert");
    //FIXME: 可与__calculateComposedParent合并逻辑
    /**
     * @pre curNode的assignedSlot链已计算完
     * @param node
     * @returns {number}
     */
    module.exports = function (node) {
        var preNodeAmount = 0;
        for (var curNode = node; curNode.__assignedSlot__; curNode = curNode.__assignedSlot__) {
            preNodeAmount += getOlderBrothersNodeAmount(curNode.__assignedSlot__.__assignNodes__, curNode);
        }
        preNodeAmount += getOlderBrothersNodeAmount(curNode.parentNode.childNodes, curNode);
        return preNodeAmount;
    };

    function getOlderBrothersNodeAmount (siblings, curNode) {
        var result = 0;
        var curNodeIndex = siblings.indexOf(curNode);
        assert(curNodeIndex > -1);
        var olderBrothers = siblings.slice(0, curNodeIndex);
        olderBrothers.forEach(function (olderBrother) {
            result += getTotalNodeAmount(olderBrother);
        });
        return result;
    }
    function getTotalNodeAmount (node) {
        if (node.tagName !== "SLOT" || !node.__isEffective()) {
            return 1;
        }

        return node.__distributedNodes__.length;
    }
});
