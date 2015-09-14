define(function (require, exports, module) {
    "use strict";

    var boost = require("boost/boost");
    var StyleRender = require("boost/styleRender");
    var FROM_CUSTOM_HANDLER = "__from_custom_handler__";
    var webMap = require("boost/webMap");
    var webDebugger = require("boost/webDebugger");

    function XmlParser (customHandler) {
        this._customHandler = customHandler;
        this._styleRender = new StyleRender(this); //每次实例一个以避免本次parse中的style影响外界
    }
    XmlParser.prototype = {
        /**
         * @param xmlStr {string} 不需包含<?xml>说明节点，需为单根
         * @return {Element}
         */
        parse: function (xmlStr) {
            var domParser = new DOMParser();
            var XML_DECLARE_STR = "<?xml version='1.0' encoding='UTF-8' ?>";
            var xmlDoc = domParser.parseFromString(XML_DECLARE_STR + xmlStr, "text/xml");
            return this._process(xmlDoc);
        },

        /**
         * 判断一个元素是否来自this._customHandler（而非parse中直接处理到的默认标签）
         * @param element
         * @param rootElement
         * @returns {boolean}
         */
        fromCustomHandler: function (element, rootElement) {
            var elementWithMark = this._findUpstream(element, function (node) {
                return node.getAttribute(FROM_CUSTOM_HANDLER);
            });

            return !!(elementWithMark && elementWithMark !== rootElement);
        },

        /**
         * 从node开始，向上寻找
         * @param node {Element}
         * @param predicate {Function}
         * @return {Element|null}
         * @private
         */
        _findUpstream: function (node, predicate) {
            do {
                if (predicate(node) === true) {
                    return node;
                }
            } while ((node = node.parentNode) !== null);
            return null;
        },

        /**
         * @param xmlDocument
         * @return {Element}
         * @private
         */
        _process: function (xmlDocument) {
            console.log("process:", xmlDocument);
            if (xmlDocument.querySelector('parsererror div')) {
                console.error("xml parse error: " + xmlDocument.querySelector('parsererror div').innerText);
            }

            var rootNativeElement = this._processElement(xmlDocument.documentElement);
            this._styleRender.apply(rootNativeElement);
            return rootNativeElement;
        },

        /**
         * @param xmlElement
         * @returns {Element|null}
         * @private
         */
        _processElement: function (xmlElement) {
            var nativeElement;
            var attributes;
            var attribute;
            var count;
            var index;

            var tagName = xmlElement.tagName.toUpperCase();
            if (tagName === "STYLE") {
                this._styleRender.parse(xmlElement.firstChild ? xmlElement.firstChild.nodeValue: '');
                return null;
            }

            var customHandlerResult = this._customHandler(xmlElement);

            switch (customHandlerResult) {
                case false:
                    //handler未处理，走默认处理
                    nativeElement = boost.createElement(xmlElement.tagName);
                    attributes = xmlElement.attributes;
                    count = attributes.length;
                    for (index = 0; index < count; index++) {
                        attribute = attributes[index];
                        nativeElement.setAttribute(attribute.name, attribute.value);
                    }

                    if (tagName === "TEXT" || tagName === "TEXTINPUT") {
                        var value = xmlElement.firstChild ? xmlElement.firstChild.nodeValue : '';
                        nativeElement.value = value;

                        if (webDebugger.isActive()) {
                            webDebugger.ignoreWebChange = true;
                            webMap.getWebElement(nativeElement).innerText = value;
                            webDebugger.ignoreWebChange = false;
                        }
                    } else {
                        this._walkElement(xmlElement, nativeElement);
                    }

                    //TODO: 在Element定义属性
                    nativeElement.__styleRender__ = this._styleRender;

                    return nativeElement;
                    break;

                case undefined:
                case null:
                    //handler处理但没有dom元素要添加
                    return null;
                    break;

                default :
                    //handler处理并返回其处理结果，打标记并直接append
                    customHandlerResult.setAttribute(FROM_CUSTOM_HANDLER, true);
                    return customHandlerResult;
                    break;
            }
        },

        _walkElement: function (xmlElement, nativeParentElement) {
            var xmlChild;
            for (xmlChild = xmlElement.firstElementChild; xmlChild !== null; xmlChild = xmlChild.nextElementSibling) {
                var elementChild = this._processElement(xmlChild);
                if (elementChild) {
                    nativeParentElement.appendChild(elementChild);
                }
            }
        }
    };

    module.exports = {
        /**
         * @param xmlStr {string} xml串，不需包含<?xml>说明标签，需单根
         * @param customHandler
         * @returns {*|Element}
         */
        parse: function (xmlStr, customHandler) {
            var parser = new XmlParser(customHandler);
            return parser.parse(xmlStr);
        }
    };
});
