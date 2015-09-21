define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var View = require("boost/View");
    var compareElementOrder = require("boost/compareElementOrder");

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
            assert(root && root.host === node.parentNode, "only child node of shadowTree's host can be assign to the slot that in the shadowTree");

            if (node.__assignedSlot__) {
                node.__assignedSlot__.__unAssignNode(node);
            }

            var unEffectiveBefore = self.__assignNodes__.length === 0;
            var insertIndex = self.__assignNodes__.length; //默认值，都先序于node时插到最后
            each(self.__assignNodes__, function (existedNode, index) {
                if (compareElementOrder(existedNode, node) === 1) { //插在第一个后序于自己的节点前面
                    insertIndex = index;
                    return false;
                }
            });
            self.__assignNodes__.splice(insertIndex, 0, node);

            node.__assignedSlot__ = this;

            if (node.tagName !== "SLOT" || !node.__isEffective()) {
                var composedParent = self.__calculateComposedParent(node);
                if (composedParent) {
                    //TODO: index
                    composedParent.__addComposedChildAt(node, ??);
                }
            } else {
                //TODO
            }
            //TODO: distributedNodes等
            //TODO: 实现所有“具体当个元素的assignedSlot变化时，影响有：”的部分
        },

        "__unAssignNode": function (node) {
            var assignNodeIndex = this.__assignNodes__.indexOf(node);
            assert(assignNodeIndex > -1, "can't unAssign node from slot which is not assign to the slot");
            this.__assignNodes__.splice(assignNodeIndex, 1);

            assert(node.__assignedSlot__ === this);
            node.__assignedSlot__ = null;

            if (node.__composedParent__) {
                node.__composedParent__.__removeComposedChild(node);
            }

            if (node.tagName !== "SLOT" || !node.__isEffective()) {
                var distributedNodeIndex = this.__distributedNodes__.indexOf(node);
                assert(distributedNodeIndex > -1);
                this.__distributedNodes__.splice(distributedNodeIndex, 1);
            } else {
                assert(node.__distributedNodes__.length > 0);
                var oldDistributedNodes = this.__distributedNodes__;
                this.__distributedNodes__ = oldDistributedNodes.filter(function (distributedNode) {
                    return node.__distributedNodes__.indexOf(distributedNode) === -1;
                });
                assert(oldDistributedNodes.length - this.__distributedNodes__.length === node.__distributedNodes__.length);
            }
        }
    });
});
