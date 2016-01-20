define(function (require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var each = require("base/each");
    var hasOwnProperty = require("base/hasOwnProperty");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var bridge = require("boost/bridge");
    var elementCreator = require("boost/elementCreator");
    var nativeVersion = require("boost/nativeVersion");

    var documentProto = {
        constructor: function () {
            //this._super();
            EventTarget.call(this);
            this.__docuemntElement__ = null;
            this.__documentElementZIndex__ = 0;
        },
        "get documentElement": function () {
            if (this.__docuemntElement__ === null) {
                this.__docuemntElement__ = this.addLayer(this.__documentElementZIndex__);

                this.dispatchEvent({
                    type: "documentElementCreated"
                });
            }
            return this.__docuemntElement__;
        },
        /**
         * @param tagName
         * @param [extraData]
         * @returns {Element}
         */
        createElement: function (tagName, extraData) {
            var element = elementCreator.create(tagName, extraData);

            this.dispatchEvent({
                type: "createElement",
                element: element
            });
            return element;
        },
        setDocumentElementLayerZIndex: function (zIndex) {
            assert(
                this.__docuemntElement__ === null,
                "boost.documentElement has already been created, zIndex can't effect.\n" +
                "Please set it before any visit of boost.documentElement"
            );
            this.__documentElementZIndex__ = zIndex;
        },
        addLayer: function (zIndex) {
            var rootView = this.createElement("RootView", nativeVersion.inIOS() ? -8 : undefined); //TODO: support multi layer in ios

            if (nativeVersion.shouldUseWeb()) {
                document.body.appendChild(rootView.__native__.__webElement__);
                rootView.__native__.__webElement__.style.zIndex = zIndex;
            } else {
                bridge.addLayer(rootView.tag, zIndex);
            }

            return rootView;
        },
        removeLayer: function (layer) {
            if (nativeVersion.shouldUseWeb()) {
                document.body.removeChild(layer.nativeObject.__webElement__);
            } else {
                bridge.removeLayer(layer.tag);
            }
            layer.destroy();
        }
    };

    function bridgeDocumentElement(obj, method) {
        obj[method] = function () {
            var documentElement = this.documentElement;
            return documentElement[method].apply(documentElement, arguments);
        };
    }

    bridgeDocumentElement(documentProto, "getElementById");
    bridgeDocumentElement(documentProto, "getElementsByClassName");
    bridgeDocumentElement(documentProto, "getElementsByTagName");
    bridgeDocumentElement(documentProto, "querySelector");
    bridgeDocumentElement(documentProto, "querySelectorAll");

    var BoostDocument = derive(EventTarget, documentProto);
    module.exports = new BoostDocument();
});
