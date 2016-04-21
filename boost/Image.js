define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var LayoutStyle = require("boost/LayoutStyle");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var Image = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Image");
        NativeElement.call(this, TYPE_ID.IMAGE, "Image");
    }, {
        __getStyle: function () {
            return new LayoutStyle();
        },
        "get src": function () {
            return this.__config__.source || "";
        },
        "set src": function (value) {
            var url;
            if (!value) {
                url = null;
            } else if (/^https?:\/\//.test(value)) {
                url = value;
            } else if (/^assets\!/.test(value)) {
                url = value;
            } else {
                var host = location.protocol + "//" + location.hostname;
                if (value[0] === '/') {
                    url = host + value;
                } else {
                    url = host + location.pathname.slice(0, location.pathname.lastIndexOf('/')) + '/' + value;
                }
            }

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.src = url;
            }
            this.__update("source", url);
        },
        "set resizeMode": function (value) {
            this.__update("resizeMode", value);
        },
        __createWebElement: function () {
            return document.createElement("img");
        }
    });
    module.exports = Image;
});
