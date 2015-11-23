define(function (require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var each = require("base/each");
    var hasOwnProperty = require("base/hasOwnProperty");
    var assert = require("base/assert");
    var Element = require("boost/Element");
    var EventTarget = require("boost/EventTarget");
    var NativeElement = require("boost/NativeElement");
    var View = require("boost/View");
    var Text = require("boost/Text");
    var TextInput = require("boost/TextInput");
    var Image = require("boost/Image");
    var ScrollView = require("boost/ScrollView");
    var BoostPage = require("boost/BoostPage");
    var Slider = require("boost/Slider");
    var RootView = require("boost/RootView");
    var Slot = require("boost/Slot");
    var ViewPager = require("boost/ViewPager");
    var Toolbar = require("boost/Toolbar");
    var bridge = require("boost/bridge");

    var TAG_MAP = {
        "View": View,
        "Text": Text,
        "TextInput": TextInput,
        "Image": Image,
        "Img": Image,
        "ScrollView": ScrollView,
        "Slider": Slider,
        "Slot": Slot,
        "ViewPager": ViewPager,
        "Toolbar": Toolbar,
        "BoostPage": BoostPage,
        "RootView": RootView
    };

    var documentProto = {
        constructor: function () {
            //this._super();
            EventTarget.call(this);
            this.__tagMap__ = {};
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
        createElement: function (tagName) {
            tagName = tagName.toUpperCase();
            assert(hasOwnProperty(this.__tagMap__, tagName), "unknow tag \"" + tagName + "\"");
            var element = new this.__tagMap__[tagName]();

            this.dispatchEvent({
                type: "createElement",
                element: element
            });
            return element;
        },
        registerElement: function (tagName, options) {
            var constructor;
            if (options.constructor) {
                constructor = options.constructor;
            } else {
                constructor = Element;
            }

            this.__tagMap__[tagName.toUpperCase()] = constructor;
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
            var rootView = this.createElement("RootView");
            bridge.addLayer(rootView.tag, zIndex);

            return rootView;
        },
        removeLayer: function (layer) {
            bridge.removeLayer(layer.tag);
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
    var boost = new BoostDocument();

    each(TAG_MAP, function (constructor, tagName) {
        boost.registerElement(tagName, {
            constructor: constructor
        });
    });

    module.exports = boost;

});
