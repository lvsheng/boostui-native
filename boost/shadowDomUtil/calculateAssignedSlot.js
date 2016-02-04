define(function (require, exports, module) {
    /**
     * @pre node.parentNode.shadowRoot.__descendantSlots__若存在，则其内slot以在树中的先序排序
     * @param node
     * @returns {null|Slot}
     */
    module.exports = function (node) {
        var shadowHost = node.parentNode;
        if (!shadowHost) {
            return null;
        }

        var shadowRoot = shadowHost.__shadowRoot__;
        if (!shadowRoot) {
            return null;
        }

        for (var i = 0; i < shadowRoot.__descendantSlots__.length; ++i) {
            var slot = shadowRoot.__descendantSlots__[i];
            if (slot.__name__ === node.__slot__) { //含默认的""的比较
                return slot;
            }
        }

        return null;
    };
});
