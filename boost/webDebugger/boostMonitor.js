define(function (require, exports, module) {
    var webMap = require("boost/webDebugger/webMap");
    var webMonitor = require("boost/webDebugger/webMonitor");
    var webContainer = require("boost/webDebugger/webContainer");
    var lock = require("boost/webDebugger/lock");
    var boost = require("boost/boost");
    var derive = require("base/derive");

    function onAttributeChange (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }

        lock.doNotUpdateBoostOnce = true;
        if (e.attributeName === "value" && (this.tagName === "TEXT" || this.tagName === "TEXTINPUT")) {
            webMap.getWebElement(this).innerText = e.attributeValue;
        } else {
            webMap.getWebElement(this)[e.attributeName] = e.attributeValue;
        }
    }
    function onStyleChange (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }

        var webValue;
        var key = e.key;
        var value = e.value;

        if (key === "flex") {
            webValue = "1 1 " + value + "px";
        }

        if (value === null) {
            webValue = "auto";
        } else if (typeof value === "number") {
            webValue = value + "px";
        } else {
            webValue = value;
        }

        lock.doNotUpdateBoostOnce = true;
        webMap.getWebElement(this).style[key] = webValue;
    }
    function onAppendChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var webChild = webMap.getWebElement(e.child);
        lock.doNotUpdateBoostOnce = true;
        webElement.appendChild(webChild);
    }
    function onInsertBefore (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var newWebElement = webMap.getWebElement(e.child);
        var referenceWebElement = webMap.getWebElement(e.reference);
        lock.doNotUpdateBoostOnce = true;
        webElement.insertBefore(newWebElement, referenceWebElement);
    }
    function onRemoveChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var childWebElement = webMap.getWebElement(e.child);
        lock.doNotUpdateBoostOnce = true;
        webElement.removeChild(childWebElement);
    }
    function onReplaceChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var newChildWebElement = webMap.getWebElement(e.newChild);
        var oldChildWebElement = webMap.getWebElement(e.oldChild);
        lock.doNotUpdateBoostOnce = true;
        webElement.replaceChild(newChildWebElement, oldChildWebElement);
    }
    function listenElementChange (element) {
        //TODO: 改这些事件为与web统一的形式
        element.addEventListener("attributeChange", onAttributeChange);
        element.addEventListener("styleChange", onStyleChange);
        element.addEventListener("appendChild", onAppendChild);
        element.addEventListener("insertBefore", onInsertBefore);
        element.addEventListener("removeChild", onRemoveChild);
        element.addEventListener("replaceChild", onReplaceChild);
    }

    var BoostMonitor = derive(Object, {
        start: function () {
            boost.addEventListener("documentElementCreated", function () {
                webMap.set(boost.documentElement, webContainer.getContainerElement());
                listenElementChange(boost.documentElement);
            });
            boost.addEventListener("createElement", function (e) {
                if (lock.doNotUpdateWeb) {
                    return;
                }
                var webElement = document.createElement(e.element.tagName);
                webMap.set(e.element, webElement);

                listenElementChange(e.element);
            });
        }
    });

    module.exports = new BoostMonitor();
});
