define(function (require, exports, module) {
    "use strict";


    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var hasOwnProperty = require("base/hasOwnProperty");

    var EventTarget = derive(Object, function () {
        this.__listeners__ = {};
    }, {
        addEventListener: function (eventType, listener, useCapture) {
            var listeners = this.__listeners__;
            if (!hasOwnProperty(listeners, eventType)) {
                listeners[eventType] = [];
            }

            assert(type(listeners[eventType]) === "array", "__listeners__ is not an array");

            listeners[eventType].push({
                useCapture: useCapture || false,
                listener: listener
            });
            return true;
        },

        removeEventListener: function (eventType, listener, useCapture) {
            var listeners = this.__listeners__;
            var index;
            var found;
            var listenerInfo;
            if (!hasOwnProperty(listeners, eventType)) {
                return false;
            }

            found = false;
            for (index = 0; index < listeners[eventType].length; ++index) {
                listenerInfo = listeners[eventType][index];
                if (listenerInfo.listener === listener && listenerInfo.useCapture === useCapture) {
                    listeners[eventType].splice(index, 1);
                    --index;
                    found = true;
                }
            }
            return found;
        },

        removeAllEventListeners: function () {
            this.__listeners__ = {};
        },

        dispatchEvent: function (event) {
            return this._dispatchEventOnPhase(event, "target");
        },

        /**
         * 在本元素身上执行event与phase相应的回调
         * @protected
         * @param event
         * @param phase {'capture'|'bubbling'|'target'}
         * @private
         */
        _dispatchEventOnPhase: function (event, phase) {
            var type = event.type;
            var listeners = this.__listeners__;
            if (hasOwnProperty(listeners, type)) {
                listeners[type].forEach(function (listenerInfo) {
                    switch (phase) {
                        case "capture":
                            listenerInfo.useCapture && listenerInfo.listener.call(this, event);
                            break;
                        case "bubbling":
                            !listenerInfo.useCapture && listenerInfo.listener.call(this, event);
                            break;
                        case "target":
                            listenerInfo.listener.call(this, event);
                            break;
                    }
                }, this);
            }
            return !event.defaultPrevented;
        }
    });

    module.exports = EventTarget;

});
