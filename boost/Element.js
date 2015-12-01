define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var StyleSheet = require("boost/StyleSheet");
    var trim = require("base/trim");
    var each = require("base/each");
    //var shadowRoot = require("boost/ShadowRoot");
    var compareElementOrder = require("boost/shadowDomUtil/compareElementOrder");
    var getIndexInComposedParent = require("boost/shadowDomUtil/getIndexInComposedParent");
    var push = [].push;

    var _super = EventTarget.prototype;
    var Element = derive(EventTarget, function (tagName) {
        //this._super();
        EventTarget.call(this);
        this.__tag__ = tagName.toUpperCase();
        this.__id__ = null;
        this.__style__ = null;
        this.__className__ = null;
        this.__classList__ = [];
        this.__children__ = [];
        this.__parent__ = null;

        this.__composedParent__ = null; //其计算依赖parent的shadowTree及其后代shadowTree中slot的assignedSlot
        this.__composedChildren__ = [];
        this.__shadowRoot__ = null;
        this.__slot__ = ""; //slotName
        this.__assignedSlot__ = null;
        /**
         * 其内slot按先序排列
         * 只有根节点(未append到其他节点上，包括shadowRoot)才维护、非根节点不维护（创建时都是根节点）
         */
        this.__descendantSlots__ = [];

        if (this.tagName === "SLOT") {
            this.__descendantSlots__.push(this);
        }
    }, {
        "get slot": function () {
            return this.__slot__;
        },
        "set slot": function (slot) {
            this.__slot__ = slot;
            //TODO
        },
        "get shadowRoot": function () {
            return this.__shadowRoot__;
        },
        "get assignedSlot": function () {
            return this.__assignedSlot__;
        },

        /**
         * 暂未实现shadowRootInitDict参数
         */
        "attachShadow": function () {
            assert(false, "todo");
            return;

            var self = this;
            var NOT_SUPPORTED_TAGS = [
                "TEXT",
                "TEXTINPUT",
                // ShadowRoot是规范里其并非继承Element而是继承自DocumentFragment，故没有此方法。本实现里只能在这儿排除之。
                "SHADOWROOT"
            ];
            assert(NOT_SUPPORTED_TAGS.indexOf(self.tagName) === -1, "Failed to execute 'attachShadow' on 'Element': Author-created shadow roots are disabled for this element.");
            assert(self.__shadowRoot__ === null, "Calling Element.attachShadow() for an element which already hosts a user-agent shadow root is deprecated.");

            var ShadowRoot = shadowRoot.getShadowRoot();
            self.__shadowRoot__ = new ShadowRoot(self);
            // 自己变成了shadowHost，并且shadowTree中没有slot。故child元素的assignedSlot与composedParent都为null
            each(self.__children__, function (child) {
                assert(child.__assignedSlot__ === null, "the assignedSlot of normal node's child should be null");
                //TODO: child可能为有效slot，则其不会出现在composedTree上
                assert(child.__composedParent__ === self, "the composedParent of normal node's child should be the normal node");
                self.__removeComposedChild(child);
            });

            return self.__shadowRoot__;
        },

        "set id": function (value) {
            this.__id__ = value;

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "id",
                attributeValue: value,
                propagationStoped: true
            });
        },
        "get id": function () {
            return this.__id__;
        },
        "set className": function (value) {
            //if (value.indexOf("j-") < 0) { //FIXME: 票务临时方案
            //    return;
            //}

            this.__className__ = value;
            var classList = [];
            var list = value.split(" ");
            var count = list.length;
            var index;
            var item;
            for (index = 0; index < count; index++) {
                item = trim(list[index]);
                if (item.length > 0) {
                    classList.push(item);
                }
            }
            this.__classList__ = classList;

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "className",
                attributeValue: value,
                propagationStoped: true
            });

            //TODO: just for debug
            //this.nativeObject.__callNative("setContentDescription", [this.__className__]);
        },
        "get className": function () {
            return this.__className__;
        },
        "get classList": function () {
            return this.__classList__;
        },
        "get tagName": function () {
            return this.__tag__;
        },
        "get style": function () {
            var style;
            var self = this;
            if (this.__style__ === null) {
                style = this.__getStyle();
                style.__onPropertyChange = function (key, value, origValue) {
                    self.__styleChange(key, value, origValue);
                };

                //style.addEventListener("propertychange", function (e) {
                //    self.__styleChange(e.key, e.value, e.origValue);
                //});

                this.__style__ = style;
            }
            return this.__style__;
        },
        "get childNodes": function () {
            return this.__children__;
        },
        "get firstChild": function () {
            return this.hasChildNodes() ? this.childNodes[0] : null;
        },
        "get lastChild": function () {
            var index = this.childNodes.length - 1;
            return this.hasChildNodes() ? this.childNodes[index] : null;
        },
        "get nextSibling": function () {
            var index;
            var count;
            var parentNode = this.parentNode;
            var parentNodeChildren;
            if (parentNode !== null) {
                parentNodeChildren = parentNode.childNodes;
                count = parentNodeChildren.length;
                index = parentNodeChildren.indexOf(this);
                if (index > -1 && index + 1 < count) {
                    return parentNodeChildren[index + 1];
                }
            }

            return null;
        },
        "get parentNode": function () {
            return this.__parent__;
        },
        "get previousSibling": function () {
            var index;
            var parentNode = this.parentNode;
            var parentNodeChildren;
            if (parentNode !== null) {
                parentNodeChildren = parentNode.childNodes;
                index = parentNodeChildren.indexOf(this);
                if (index > 0) {
                    return parentNodeChildren[index - 1];
                }
            }

            return null;
        },
        "get nodeType": function () {
            return 1; //ELEMENT_NODE;
        },
        __getStyle: function () {
            return new StyleSheet();
        },
        __styleChange: function (key, value, origValue) {
            // do nothing

            //TODO 为了性能暂时注释，影响：webDebugger
            //this.dispatchEvent({
            //    type: "styleChange",
            //    key: key,
            //    value: value,
            //    propagationStoped: true
            //});
        },

        /**
         * @returns {Element} 可能是documentElement，也可能是不在documentTree里的普通Element，也可能是shadowRoot
         */
        __getRoot: function () {
            var root;
            for (root = this; root.parentNode !== null; root = root.parentNode) {
            }
            return root;
        },
        __addChildAt: function (addedChild, index) {
            assert(addedChild.tagName !== "SHADOWROOT", "shadowRoot can't be child of other node");
            var self = this;

            var childParentNode = addedChild.parentNode;
            if (childParentNode !== null) {
                childParentNode.removeChild(addedChild);
            }

            self.__children__.splice(index, 0, addedChild);
            addedChild.__parent__ = self;

            // 1. 先计算添加的子树中slot接收的节点
            var hasNewSlot = addedChild.__descendantSlots__.length > 0;
            if (hasNewSlot) {
                var root = self.__getRoot();
                var oldSlots = root.__descendantSlots__.slice();
                var newSlots = addedChild.__descendantSlots__.slice();

                addedChild.__descendantSlots__ = null; //已经不再是root，不需再维护

                //维持先序：找到第一个后序元素，插入其前
                for (var i = 0; i < oldSlots.length && compareElementOrder(newSlots[0], oldSlots[i]) !== -1; ++i) {}
                root.__descendantSlots__ = oldSlots.slice(0, i).concat(newSlots).concat(oldSlots.slice(i));

                var inShadowTree = root.tagName === "SHADOWROOT";
                // 下面为计算新增子树中的slot对host的子的assignedSlot的影响
                if (inShadowTree) {
                    var shadowHost = root.host;
                    var unAssignedChildren = shadowHost.__children__.filter(function (hostChild) {
                        return hostChild.__assignedSlot__ === null;
                    });

                    var newSlotMap = {};
                    each(newSlots, function (newSlot) {
                        if (!newSlotMap[newSlot.__name__]) { //若有同名，靠前者在树中先序，优先
                            newSlotMap[newSlot.__name__] = newSlot;
                        }
                    });
                    each(newSlotMap, function (newSlot) {
                        var sameNameOldSlot; //存放按先序第一个同名slot
                        var indexOld;
                        for (indexOld = 0; !sameNameOldSlot && indexOld < oldSlots.length; ++indexOld) {
                            if (oldSlots[indexOld].__name__ === newSlot.__name__) {
                                sameNameOldSlot = oldSlots[indexOld];
                            }
                        }

                        if (!sameNameOldSlot) { //旧树中没有同名
                            var matchedHostChildren = unAssignedChildren.filter(function (hostChild) {
                                return hostChild.__slot__ === newSlot.__name__; //含默认的""的比较
                            });
                            matchedHostChildren.forEach(function (hostChild) {
                                newSlot.__assignNode(hostChild);
                            });
                        } else { //旧树中有同名
                            var newSlotIndex = root.__descendantSlots__.indexOf(newSlot);
                            var oldSlotIndex = root.__descendantSlots__.indexOf(sameNameOldSlot);
                            //先序的生效。若newSlot生效，取代oldSlot；若newSlot不生效，其只作为替补
                            var newSlotEffect = newSlotIndex < oldSlotIndex;
                            if(newSlotEffect) {
                                sameNameOldSlot.__assignNodes__.forEach(function (node) {
                                    assert(node.__assignedSlot__ === sameNameOldSlot);
                                    newSlot.__assignNode(node);
                                });
                            }
                        }
                    });
                }
            }

            // 2. 再计算添加的子树被添加到的composedTree中的位置
            var childAssignedSlot = self.__calculateAssignedSlot(addedChild);
            if (childAssignedSlot) {
                childAssignedSlot.__assignNode(addedChild);
            }
            var composedParent = self.__calculateComposedParent(addedChild);
            if (composedParent) {
                composedParent.__addComposedChildAt(addedChild, getIndexInComposedParent(addedChild));
            }
        },

        //TODO: 把工具方法移出至单独文件
        /**
         * @pre node.parentNode.shadowRoot.__descendantSlots__若存在，则其内slot以在树中的先序排序
         * @param node
         * @returns {null|Slot}
         */
        __calculateAssignedSlot: function (node) {
            return null; //TODO
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
        },
        __getRecursivelyAssignedSlot: function (node) {
            var result = node;
            while (result.__assignedSlot__) {
                result = result.__assignedSlot__;
            }
            return result;
        },
        /**
         * @pre
         *  node.assignedSlot已经计算完毕
         *  node.parentNode的shadowTree及其所有descendant tree中的slot的assignedSlot已经计算完毕
         * @param node
         */
        __calculateComposedParent: function (node) {
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
                composedParent = this.__getRecursivelyAssignedSlot(node).parentNode;
            }

            if (composedParent && composedParent.tagName === "SHADOWROOT") { //对于shadowRoot，取其host
                composedParent = composedParent.host; //目前不允许shadowRoot再attachShadow，故只取一层即可
            }

            return composedParent;
        },

        __removeChildAt: function (index) {
            var child = this.childNodes[index];
            this.childNodes.splice(index, 1);
            child.__parent__ = null;

            child.__composedParent__ && child.__composedParent__.__removeComposedChild(child);
            // __descendantSlots__中属于此child的，由其继续维护
            child.__descendantSlots__ = [];
            var root = this.__getRoot();
            for (var i = 0; i < root.__descendantSlots__.length; ++i) {
                var eachDescendantSlot = root.__descendantSlots__[i];
                if (eachDescendantSlot.__getRoot() === child) {
                    child.__descendantSlots__.push(eachDescendantSlot);
                    root.__descendantSlots__.splice(i, 1);
                    --i;
                }
            }
            if (child.tagName === "SLOT") {
                assert(child.__descendantSlots__.indexOf(child) === 0, "__descendantSlots__ of root SLOT should include itself, and should be first");
            }
        },
        __addComposedChildAt: function (child, index) {
            var childParentNode = child.__composedParent__;
            if (childParentNode !== null) {
                childParentNode.__removeComposedChild(child);
            }
            this.__composedChildren__.splice(index, 0, child);
            child.__composedParent__ = this;
        },
        __removeComposedChild: function (child) {
            var index = this.__composedChildren__.indexOf(child);
            if (index > -1) {
                this.__removeComposedChildAt(index);
            }
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            this.__composedChildren__.splice(index, 1);
            child.__composedParent__ = null;
        },
        appendChild: function (child) {
            this.__addChildAt(child, this.__children__.length);

            this.dispatchEvent({
                type: "appendChild",
                child: child,
                propagationStoped: true
            });
            return child;
        },
        hasChildNodes: function () {
            return this.childNodes.length > 0;
        },
        insertBefore: function (newNode, referenceNode) {
            var childNodes = this.childNodes;
            var index = childNodes.indexOf(referenceNode);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            this.__addChildAt(newNode, index);

            this.dispatchEvent({
                type: "insertBefore",
                child: newNode,
                reference: referenceNode,
                propagationStoped: true
            });
            return newNode;
        },
        removeChild: function (child) {
            var index = this.childNodes.indexOf(child);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            this.__removeChildAt(index);

            this.dispatchEvent({
                type: "removeChild",
                child: child,
                propagationStoped: true
            });
            return child;
        },
        replaceChild: function (newChild, oldChild) {
            var index = this.childNodes.indexOf(oldChild);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            if (newChild.parentNode !== null) {
                newChild.parentNode.removeChild(newChild);
            }
            this.childNodes.splice(index, 1, newChild);
            oldChild.__parent__ = null;

            this.dispatchEvent({
                type: "replaceChild",
                newChild: newChild,
                oldChild: oldChild,
                propagationStoped: true
            });
            return oldChild;
        },
        __findChild: function (callback) {
            var childNodes = this.childNodes;
            var index;
            var count = childNodes.length;
            var child;
            for (index = 0; index < count; index++) {
                child = childNodes[index];
                if (callback(child) === true) {
                    return true;
                }
                if (child.__findChild(callback)) {
                    return true;
                }
            }

            return false;
        },
        getElementById: function (id) {
            var ret = null;
            this.__findChild(function (element) {
                if (element.id === id) {
                    ret = element;
                    //如果找到指定 Element, 返回 true, 停止遍历
                    return true;
                }
                return false;
            });

            return ret;
        },
        getElementsByClassName: function (className) {
            var ret = [];

            this.__findChild(function (element) {
                if (element.classList.indexOf(className) > -1) {
                    ret.push(element);
                }
                //始终返回 false, 继续查找
                return false;
            });

            return ret;
        },
        getElementsByTagName: function (tag) {
            tag = tag.toUpperCase();
            var ret = [];

            this.__findChild(function (element) {
                if (element.tagName === tag) {
                    ret.push(element);
                }
                //始终返回 false, 继续查找
                return false;
            });

            return ret;
        },
        __findParent: function (callback) {
            var node = this;
            while ((node = node.parentNode) !== null) {
                if (callback(node) === true) {
                    return true;
                }
            }
            return false;
        },
        __parentSelect: function (selector) {
            var results = null;
            selector = trim(selector);
            var match = rquickExpr.exec(selector);
            var m;

            assert(match !== null, "不支持的选择器:\"" + selector + "\",现在只支持简单的选择器: #id .class tag");

            if ((m = match[1])) {
                // ID selector
                this.__findParent(function (element) {
                    if (element.id === m) {
                        results = element;
                        return true;
                    }
                });
            } else if (match[2]) {
                // Type selector
                this.__findParent(function (element) {
                    if (element.tagName === selector) {
                        results = element;
                        return true;
                    }
                });
            } else if (m = match[3]) {
                // Class selector
                this.__findParent(function (element) {
                    if (element.classList.indexOf(m) > -1) {
                        results = element;
                        return true;
                    }
                });
            }
            return results;
        },
        __select: function (selector, results, quick) {
            var self = this;
            results = results || [];
            quick = !!quick;
            selector = trim(selector);
            if (!selector) {
                return results;
            }

            var match = rquickExpr.exec(selector);
            var m;
            if (quick) {
                //assert(match !== null, "现在只支持简单的选择器: #id .class tag");
                assert(match !== null, "不支持的选择器:\"" + selector + "\",现在只支持简单的选择器: #id .class tag");
            }
            if (match !== null) {
                if ((m = match[1])) {
                    // ID selector
                    results.push(this.getElementById(m));
                } else if (match[2]) {
                    // Type selector
                    push.apply(results, this.getElementsByTagName(selector));
                } else if (m = match[3]) {
                    // Class selector
                    push.apply(results, this.getElementsByClassName(m));
                }
            } else {
                each(selector.split(","), function (selector) {
                    var items = selector.split(" ").filter(function (item) {
                        return trim(item).length > 0;
                    });
                    //找出所有满足需求的
                    var list = [];
                    self.__select(items.pop(), list, true);

                    //过滤不满足条件的节点
                    var count = items.length;
                    each(list, function (element) {
                        var index = count;
                        var node = element;
                        while (index--) {
                            // 没有找到符合条件的父节点，就过滤掉
                            // FIXME 以当前节点作为根节点
                            node = node.__parentSelect(items[index]);
                            if (node === null) {
                                //没有找到选择器指定的父节点
                                return;
                            }
                        }
                        //在当前文档能找到符合条件的父节点，添加进结果集
                        results.push(element);
                    });
                });
            }
            return results;
        },
        querySelectorAll: function (selector) {
            return this.__select(selector);
        },
        /*
        querySelector: function (selector) {
            var func = getSelectorFunction(selector);
            var ret = [];
            func(this, ret, 1);
            return ret;
        },
        querySelectorAll: function (selector, __results__) {
            __results__ = __results__ || [];
            var match = rquickExpr.exec(selector);
            var m;

            //assert(match !== null, "现在只支持简单的选择器: #id .class tag");
            if (match !== null) {
                if ((m = match[1])) {
                    // ID selector
                    push.apply(__results__, this.getElementById(m));
                } else if (match[2]) {
                    // Type selector
                    push.apply(__results__, this.getElementsByTagName(selector));
                } else if (m = match[3]) {
                    // Class selector
                    push.apply(__results__, this.getElementsByTagName(selector));
                }
            } else {

            }

            return __results__;
        },
       */
        setAttribute: function (name, value) {
            switch (name.toLowerCase()) {
                case "class":
                    this.className = value;
                    break;
                case "style":
                    this.style.cssText = value;
                    break;
                default:
                    this[name] = value;

                    this.dispatchEvent({
                        type: "attributeChange",
                        attributeName: name,
                        attributeValue: value,
                        propagationStoped: true
                    });
                break;
            }
        },
        getAttribute: function (name) {
            return this[name];
        },
        dispatchEvent: function (event) {
            if (event.propagationStoped === true) {
                //之前用法为propagationStoped即不向上传播，但会在元素本身派发，这里保留
                return this._dispatchEventOnPhase(event, "target");
            }

            var ret = event.defaultPrevented;
            var ancestors = [];
            var curNode = this;
            while (curNode = curNode.parentNode) {
                ancestors.push(curNode); //根在后
            }
            ancestors.reverse(); //根在前

            //capture phase
            each(ancestors, function (curNode) {
                ret = curNode._dispatchEventOnPhase(event, "capture");
                return !event.propagationStoped;
            });
            if (event.propagationStoped) {
                return ret; //不再继续
            }

            //target phase
            ret = this._dispatchEventOnPhase(event, "target");
            if (event.propagationStoped) {
                return ret; //不再继续
            }

            //bubbling phase
            ancestors.reverse(); //根在后
            each(ancestors, function (curNode) {
                ret = curNode._dispatchEventOnPhase(event, "bubbling");
                return !event.propagationStoped;
            });
            return ret;
        }
    });

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;

    module.exports = Element;
});
