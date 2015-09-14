/**
 * @file isolated from boost/xml.js
 */
define(function (require, exports, module) {
    var assert = require("base/assert");
    var derive = require("base/derive");
    var each = require("base/each");
    var trim = require("base/trim");
    var boost = require("boost/boost");
    var copyProperties = require("base/copyProperties");
    var toCamelCase = require("base/toCamelCase");

    var StyleParser = derive(Object, function () {
        this._code = null;
        this._codeChar = null;
        this._index = 0;
        this._count = 0;
    }, {
        /**
         * @param str {string}
         * @param ret {Array} 返回值收集器
         * @returns {Array}
         */
        parse: function (str, ret) {
            this._code = this.preProcess(str);
            this._codeChar = this._code.split("");
            this._index = 0;
            this._count = this._codeChar.length;
            var selector;
            var rule;

            ret = ret || [];
            while (true) {
                this.ignoreWhiteSpace();
                selector = this.getSelector();
                rule = this.getRule();
                if (selector && rule) {
                    ret.push({
                        selector: selector,
                        rule: rule
                    });
                    continue;
                }
                break;
            }

            return ret;
        },
        preProcess: function (str) {
            return str.replace(/\/\*[\s\S]*?\*\//g, "");
        },
        ignoreWhiteSpace: function () {
            var count = this._count;
            var _codeChar = this._codeChar;
            var code;
            var index;

            for (index = this._index; index < count; index++) {
                code = _codeChar[index];
                if (code !== " " && code !== "\t" && code !== "\r" && code !== "\n") {
                    break;
                }
            }
            this._index = index;
        },
        getSelector: function () {
            var code = this._code;
            var end = code.indexOf("{", this._index);
            var selector;
            if (end < 0) {
                this.end();
                return false;
            }
            selector = code.substring(this._index, end);
            this._index = end;
            return trim(selector);
        },
        getRule: function () {
            var code = this._code;
            var index = this._index;
            var start = code.indexOf("{", index);
            var end;

            if (start < 0) {
                this.end();
                return false;
            }

            end = code.indexOf("}", start);
            if (end < 0) {
                this.end();
                return false;
            }

            this._index = end + 1;
            return this.parseRule(code.substring(start + 1, end));
        },
        parseRule: function (str) {
            var list = str.split(";");
            var count = list.length;
            var index;
            var item;
            var parts;
            var key;
            var ret = {};

            for (index = 0; index < count; index++) {
                item = list[index];
                parts = item.split(":");
                if (parts.length > 1) {
                    key = toCamelCase(trim(parts[0]));
                    ret[key] = trim(parts[1]);
                }
            }
            return ret;
        },
        end: function () {
            this._index = this._count;
        }
    });

    /**
     * @constructor
     */
    function StyleRender (xmlParser) {
        this._xmlParser = xmlParser;
        this._parser = new StyleParser();
        this._ruleList = [];
    }
    StyleRender.prototype = {
        parse: function (str) {
            this._parser.parse(str, this._ruleList);
        },

        /**
         * @param rootElement {Element}
         */
        apply: function (rootElement) {
            var self = this;
            each(self._ruleList, function (item) {
                var selector = item.selector;
                var elements = rootElement.querySelectorAll(selector);

                if (self._satisfySelector(rootElement, selector)) {
                    elements.push(rootElement);
                }

                //过滤掉自定义handler返回的节点不渲染
                elements = elements.filter(function (element) {
                    return !self._xmlParser.fromCustomHandler(element, rootElement);
                });

                each(elements, function (element) {
                    self._applyRule(element, item.rule);
                });
            });
        },

        /**
         * 只(更新)渲染一个元素
         * @param element {Element}
         */
        applyOnOne: function (element) {
            var self = this;
            each(self._ruleList, function (item) {
                var selector = item.selector;
                if (self._satisfySelector(element, selector)) {
                    self._applyRule(element, item.rule);
                }
            });
        },

        _applyRule: function (element, rule) {
            copyProperties(element.style, rule);

            //保存以供_clearStyle中使用
            if (!element.__ruleFromStyleRender__) { element.__ruleFromStyleRender__ = {}; } //TODO: 在Element定义属性
            //TODO: 后续应考虑将元素不同来源比如cssRender与style对象甚至不同选择器应用上的样式都记录。综合按权重生效。不过也看效率与功能权衡
            copyProperties(element.__ruleFromStyleRender__, rule);
        },

        /**
         * 手动清除一个元素身上被本styleRender渲染上的样式规则
         * 目前因元素样式没有保留所有来源的规则再按优先级指定生效，故可能会清除掉非本styleRender（如js操作的）的样式
         * TODO 后续应考虑按选择器、内联（直接style属性或js操作style）分别记录并清除、并应适时自动clear
         * @param element
         */
        clearStyle: function (element) {
            each(element.__ruleFromStyleRender__, function (ruleValue, ruleName) {
                element.style[ruleName] = null;
            });
        },

        /**
         * TODO: 应由Element.js提供本功能
         * @param element
         * @param selector {string} 可含单元素选择器及','与' '
         * @return {Boolean}
         */
        _satisfySelector: function (element, selector) {
            var selectors = selector.split(',');
            var matchLast = false;
            for (var cur = selectors.pop(); !matchLast && cur; cur = selectors.pop()) {
                matchLast = this._satisfySingleSelector(element, cur);
            }
            return matchLast;
        },
        /**
         * @param element
         * @param singleSelector {string} 可含单元素选择器与' '，不可含','
         * @private
         */
        _satisfySingleSelector: function (element, singleSelector) {
            assert(singleSelector.indexOf(',') === -1, "unexpected ',' in single selector: " + singleSelector);

            assert(singleSelector.trim().length > 0, "empty selector is not valid");
            var list = singleSelector.split(/\s+/);

            var targetNodeMatch = this._satisfyOneElementSelector(element, list.pop());
            if (!targetNodeMatch) {
                return false;
            } else {
                var curSelector = list.pop();
                var curNode = element.parentNode;
                while (curSelector && curNode) {
                    if (this._satisfyOneElementSelector(curNode, curSelector)) {
                        curSelector = list.pop();
                        curNode = curNode.parentNode;
                    } else {
                        curNode = curNode.parentNode;
                    }
                }
                return !curSelector;
            }
        },
        /**
         * TODO: 应由Element.js提供本功能
         * @param element
         * @param selector {string} 单元素选择器：.xx|#xx|xx
         * @return {Boolean}
         */
        _satisfyOneElementSelector: function (element, selector) {
            var reg = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
            var match = reg.exec(selector);
            assert(match !== null, "not valid simple selector: " + selector + "(must be .xx,#xx,xx)");

            if (match[1]) {
                // ID selector
                return element.id === match[1];
            } else if (match[2]) {
                // Type selector
                return element.tagName === selector.toUpperCase();
            } else if (match[3]) {
                // Class selector
                return element.classList.indexOf(match[3]) > -1;
            }
        }
    };

    module.exports = StyleRender;
});
