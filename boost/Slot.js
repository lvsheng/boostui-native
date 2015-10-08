define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var View = require("boost/View");
    var compareElementOrder = require("boost/compareElementOrder");
    var getIndexInComposedParent = require("boost/shadowDomUtil/getIndexInComposedParent");

    module.exports = derive(View, function () {
        this._super();

        this.__name__ = ""; //slotName
        this.__distributedNodes__ = [];
        this.__assignNodes__ = []; //按序存放assignedSlot为本节点的元素
    }, {
        /**
         * 内部API
         * slot是否有assignNodes（按w3c规范，如果没有assignNodes，将其作为未知html元素渲染，即后代与shadowTree(如果有)仍渲染）
         * @returns {boolean}
         */
        "__isEffective": function () {
            return this.__assignNodes__.length > 0;
        },

        "get name": function () {
            return this.__name__;
        },

        "set name": function (name) {
            this.__name__ = name;
            //TODO
        },

        "getDistributedNodes": function () {
            return this.__distributedNodes__.slice();
        },

        "__assignNode": function (node) {
            var self = this;
            var root = self.__getRoot();
            var unEffectiveBefore = !self.__isEffective();
            assert(root && root.host === node.parentNode, "only child node of shadowTree's host can be assign to the slot that in the shadowTree");

            // 1. assignedSlot、assignNodes
            if (node.__assignedSlot__) {
                node.__assignedSlot__.__unAssignNode(node);
            }
            node.__assignedSlot__ = self;
            for (var i = 0; i < self.__assignNodes__.length && compareElementOrder(node, self.__assignNodes__[i]) !== -1; ++i) {}
            self.__assignNodes__.splice(i, 0, node); // 维持先序：找到第一个后序元素，插入其前

            // 2. distributedNodes
            var nodeIsEffectiveSlot = node.tagName === "SLOT" && node.__isEffective();
            if (!nodeIsEffectiveSlot) {
                self.__distributedNodes__.push(node);
            } else {
                self.__distributedNodes__ = self.__distributedNodes__.concat(node.__distributedNodes__);
            }

            // 3. node.composedParent
            if (!nodeIsEffectiveSlot) {
                assert(node.__composedParent__ === null, "should remove from old composedParent when unAssign");
                var composedParent = self.__calculateComposedParent(node);
                assert(!!composedParent);
                composedParent.__addComposedChildAt(node, getIndexInComposedParent(node));
            } else { //有效slot的assignedSlot改变，其distributedNodes的composedParent都要变
                node.__distributedNodes__.forEach(function (distributedNode) {
                    assert(distributedNode.__composedParent__ === null, "should remove from old composedParent when unAssign");
                    var composedParent = self.__calculateComposedParent(distributedNode);
                    assert(!!composedParent);
                    composedParent.__addComposedChildAt(distributedNode, getIndexInComposedParent(distributedNode));
                });
            }

            // 4. self.composedParent
            if (unEffectiveBefore) { //自己从无效变为有效，不再参与渲染
                self.__composedParent__.__removeComposedChild(self);
            }
        },
        /**
         * @param node
         * @param [willAssignAnother=false] {boolean} 若为true，表示马上会为node分配另一个assignedSlot，则此时不计算其composedParent
         */
        "__unAssignNode": function (node, willAssignAnother) {
            var self = this;
            var assignNodeIndex = self.__assignNodes__.indexOf(node);
            assert(assignNodeIndex > -1, "can't unAssign node from slot which is not assign to the slot");

            // 1. assignedSlot、assignNodes
            assert(node.__assignedSlot__ === self);
            node.__assignedSlot__ = null;
            self.__assignNodes__.splice(assignNodeIndex, 1);

            // 2. distributedNodes
            var nodeIsEffectiveSlot = node.tagName === "SLOT" && node.__isEffective();
            if (!nodeIsEffectiveSlot) {
                var distributedNodeIndex = self.__distributedNodes__.indexOf(node);
                assert(distributedNodeIndex > -1);
                self.__distributedNodes__.splice(distributedNodeIndex, 1);
            } else {
                assert(node.__distributedNodes__.length > 0);
                var oldDistributedNodes = self.__distributedNodes__;
                self.__distributedNodes__ = oldDistributedNodes.filter(function (distributedNode) {
                    return node.__distributedNodes__.indexOf(distributedNode) === -1;
                });
                assert(oldDistributedNodes.length - self.__distributedNodes__.length === node.__distributedNodes__.length);
            }

            // 3. node.composedParent
            if (!nodeIsEffectiveSlot) {
                node.__composedParent__.__removeComposedChild(node);
            } else {
                node.__distributedNodes__.forEach(function (distributedNode) {
                    distributedNode.__composedParent__.__removeComposedChild(distributedNode);
                });

                if (!willAssignAnother) {
                    node.__distributedNodes__.forEach(function (distributedNode) {
                        var composedParent = self.__calculateComposedParent(distributedNode);
                        assert(!!composedParent);
                        composedParent.__addComposedChildAt(distributedNode, getIndexInComposedParent(distributedNode));
                    });
                }
            }

            // 4. self.composedParent
            if (!self.__isEffective()) { //从有效变为无效，作为普通元素渲染
                var composedParent = self.__calculateComposedParent(self);
                if (composedParent) { //自己有可能没有composedParent(没有assignedSlot)
                    composedParent.__addComposedChildAt(self, getIndexInComposedParent(self));
                }
            }
        }
    });
});
