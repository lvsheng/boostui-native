/**
 * @file 负责监控web中元素，将其改动更新至boost 被webMap中调用启动
 */

define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var toCamelCase = require("base/toCamelCase");
    var lock = require("boost/webDebugger/lock");
    var webContainer = require("boost/webDebugger/webContainer");
    var xml = require("boost/xml");
    require("boost/webDebugger/webMap");
    require("boost/webDebugger/webDebugger");
    require("boost/boost");
    var INTERVAL = 30;

    var WebMonitor = derive(Object, {
        _setIntervalHandle: null,

        start: function () {
            assert(this._setIntervalHandle === null, "already been started");

            var self = this;

            var boost = require("boost/boost");
            var observer = new MutationObserver(function (records) {
                if (lock.doNotUpdateBoostOnce) {
                    lock.doNotUpdateBoostOnce = false;
                    return; //avoid dead loop
                }

                records.forEach(function (record) {
                    var webMap = require("boost/webDebugger/webMap"); //因为有循环依赖，需在此使用时重新require
                    var webElement;
                    var boostElement;
                    switch (record.type) {
                        case "attributes":
                            webElement = record.target;
                            boostElement = webMap.getBoostElement(webElement);
                            if (record.attributeName === 'style') {
                                self._handleStyle(boostElement, webElement.getAttribute("style"));
                            } else if (record.attributeName === "class") {
                                lock.doNotUpdateWeb = true;
                                boostElement.className = webElement.className; //FIXME: can't trigger style update by className
                                lock.doNotUpdateWeb = false;
                            } else {
                                lock.doNotUpdateWeb = true;
                                boostElement.setAttribute(record.attributeName, webElement.getAttribute(record.attributeName));
                                lock.doNotUpdateWeb = false;
                            }
                            break;
                        case "characterData":
                            webElement = record.target.parentElement;
                            boostElement = webMap.getBoostElement(webElement);
                            var tagName = webElement.tagName.toUpperCase();
                            if (tagName === "TEXT" || tagName === "TEXTINPUT") {
                                lock.doNotUpdateWeb = true;
                                boostElement.value = webElement.innerHTML; //innerText can't get value~
                                lock.doNotUpdateWeb = false;
                            }
                            break;
                        case "childList":
                            webElement = record.target;
                            boostElement = webMap.getBoostElement(webElement);

                            each(record.removedNodes, function (removedNode) {
                                var removedBoostElement = webMap.getBoostElement(removedNode);
                                lock.doNotUpdateWeb = true;
                                boostElement.removeChild(removedBoostElement); //but do not destroy, for maybe is move/cut
                                lock.doNotUpdateWeb = false;
                            });

                            each(record.addedNodes, function (addedNode) {
                                if (addedNode.nodeName === "#text") {
                                    return; //文本节点不处理
                                }
                                var addedBoostNode = webMap.getBoostElement(addedNode);
                                if (!addedBoostNode) {
                                    lock.doNotUpdateWeb = true;
                                    addedBoostNode = xml.parse(addedNode.outerHTML);
                                    webMap.set(addedBoostNode, addedNode);
                                    lock.doNotUpdateWeb = false;
                                }
                                if (record.nextSibling) {
                                    lock.doNotUpdateWeb = true;
                                    boostElement.insertBefore(addedBoostNode, webMap.getBoostElement(record.nextSibling));
                                    lock.doNotUpdateWeb = false;
                                } else {
                                    lock.doNotUpdateWeb = true;
                                    boostElement.appendChild(addedBoostNode);
                                    lock.doNotUpdateWeb = false;
                                }
                            });
                            break;
                    }
                });
            });
            //TODO: 增加一个特殊元素作为作用域，避免插件等的影响
            observer.observe(webContainer.getContainerElement(), {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        },

        _handleStyle: function(boostElement, styleText) {
            var self = this;
            styleText = styleText.replace(/\/\*.*?\*\//g, "");
            var styleList = styleText.split(";");
            styleList = styleList.filter(function (styleItem) { return styleItem.trim().length > 0; });
            self._clearOldStyle(boostElement);
            styleList.forEach(function (styleItem) {
                var tempArray = styleItem.split(":");
                try {
                    self._handleStyleItem(boostElement,  tempArray[0].trim(), tempArray[1].trim());
                } catch (e) {
                    console.error(e); //打印error、但还继续解析下一个
                }
            });
        },

        _clearOldStyle: function (boostElement) {
            lock.doNotUpdateWeb = true;
            each(boostElement.style.__styleProps__, function (value, key) {
                boostElement.style[key] = null;
            });
            lock.doNotUpdateWeb = false;
        },

        _handleStyleItem: function (boostElement, styleName, styleValue) {
            var keyMap = {
                "margin": [
                    'margin-top',
                    'margin-right',
                    'margin-bottom',
                    'margin-left'
                ],
                "padding": [
                    'padding-top',
                    'padding-right',
                    'padding-bottom',
                    'padding-left'
                ],
                "border-width": [
                    'border-top-width',
                    'border-right-width',
                    'border-bottom-width',
                    'border-left-width'
                ],
                "border-color": [
                    'border-top-color',
                    'border-right-color',
                    'border-bottom-color',
                    'border-left-color'
                ]
            };
            var webDebugger = require("boost/webDebugger/webDebugger");
            var subStyleValues;
            switch (styleName) {
                case "margin":
                case "padding":
                case "border-width":
                case "border-color":
                    subStyleValues = styleValue.split(/\s+/);
                    if (subStyleValues.length === 1) {
                        subStyleValues.push(subStyleValues[0]); //right
                        subStyleValues.push(subStyleValues[0]); //bottom
                        subStyleValues.push(subStyleValues[0]); //left
                    } else if (subStyleValues.length === 2) {
                        subStyleValues.push(subStyleValues[0]); //bottom
                        subStyleValues.push(subStyleValues[1]); //left
                    } else if (subStyleValues.length === 3) {
                        subStyleValues.push(subStyleValues[1]); //left
                    }
                    lock.doNotUpdateWeb = true;
                    keyMap[styleName].forEach(function (subStyleKey, index) {
                        boostElement.style[webKeyToBoostKey(subStyleKey)] = webValueToBoostValue(subStyleValues[index]);
                    });
                    lock.doNotUpdateWeb = false;
                    break;
                case "flex":
                    subStyleValues = styleValue.split(/\s+/);
                    var flexValue = subStyleValues.length === 1 ? subStyleValues[0] : parseFloat(subStyleValues[2]);
                    boostElement.style[webKeyToBoostKey(styleName)] = webValueToBoostValue(flexValue);
                    break;
                default :
                    lock.doNotUpdateWeb = true;
                    boostElement.style[webKeyToBoostKey(styleName)] = webValueToBoostValue(styleValue);
                    lock.doNotUpdateWeb = false;
                    break;
            }

            function webValueToBoostValue (webValue) {
                return webValue; //目前没有特殊处理了
            }
            function webKeyToBoostKey (webKey) {
                return toCamelCase(webKey);
            }
        },

        _hasChild: function (parent, child) {
            var has = false;
            each(parent.childNodes, function (each) {
                if (each === child) {
                    has = true;
                }
            });
            return has;
        }
    });

    module.exports = new WebMonitor();
});
