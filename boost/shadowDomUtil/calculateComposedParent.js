define(function (require, exports, module) {
    var getRecursivelyAssignedSlot = require("boost/shadowDomUtil/getRecursivelyAssignedSlot");

    /**
     * @pre
     *  node.assignedSlot已经计算完毕
     *  node.parentNode的shadowTree及其所有descendant tree中的slot的assignedSlot已经计算完毕
     * @param node
     */
    module.exports = function (node) {
        var composedParent;
        var nodeParent = node.parentNode;

        if (node.tagName === "SHADOWROOT") {
            composedParent = null; //shadowRoot不展示
        } else if (node.tagName === "SLOT" && node.__isEffective()) {
            composedParent = null; //有效的slot也不展示
        } else if (!nodeParent) {
            composedParent = null;
        } else if (!nodeParent.__shadowRoot__) { //node不是shadowHost的子元素
            composedParent = nodeParent;
        } else if (!node.__assignedSlot__) { //是shadowHost的子元素，但没有assignedSlot
            composedParent = null;
        } else { //是shadowHost的子元素，并且有assignedSlot
            composedParent = getRecursivelyAssignedSlot(node).parentNode;
        }

        if (composedParent && composedParent.tagName === "SHADOWROOT") { //对于shadowRoot，取其host
            composedParent = composedParent.host; //目前不允许shadowRoot再attachShadow，故只取一层即可
        }

        return composedParent;
    };
});
