define(function (require, exports, module) {
    var assert = require("base/assert");

    /**
     * 比较两个元素在树中的顺序（深度优先先根序）
     * 若a先于b，返回-1
     * 若b先于a，返回1
     * 否则(a与是同一个节点或两者不在同一棵树上)返回0
     * @param a
     * @param b
     * @return {int}
     */
    module.exports = function (a, b) {
        if (!a || !b || a === b) {
            return 0;
        }

        var aAncestors = [];
        var bAncestors = [];
        var curA;
        var curB;
        for (curA = a; curA; curA = curA.parentNode) {
            aAncestors.push(curA);
        }
        for (curB = b; curB; curB = curB.parentNode) {
            bAncestors.push(curB);
        }

        var rootA = aAncestors.pop();
        var rootB = bAncestors.pop();
        if (rootA !== rootB) {
            return 0;
        }

        do {
            curA = aAncestors.pop();
            curB = bAncestors.pop();
        } while (curA === curB);

        if (!curA) {
            //a是b的祖先
            return -1;
        }
        if (!curB) {
            //b是a的祖先
            return 1;
        }

        //curA与curB是兄弟
        assert(curA.parentNode === curB.parentNode, "logic error: curA and curB should be brothers");
        var parent = curA.parentNode;
        var indexA = parent.__children__.indexOf(curA);
        var indexB = parent.__children__.indexOf(curB);
        return indexA < indexB ? -1 : 1;
    };
});
