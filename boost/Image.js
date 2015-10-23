define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var LayoutStyle = require("boost/LayoutStyle");

    //var NATIVE_VIEW_TYPE = "WrappedImageView";
    var NATIVE_VIEW_TYPE = 2;

    var Image = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Image");
        NativeElement.call(this, NATIVE_VIEW_TYPE, "Image");
    }, {
        __getStyle: function () {
            return new LayoutStyle();
        },
        "get src": function () {
            return this.__config__.source || "";
        },
        "set src": function (value) {
            var url;
            if (/^https?:\/\//.test(value)) {
                url = value;
            } else {
                var host = location.protocol + "//" + location.hostname;
                if (value[0] === '/') {
                    url = host + value;
                } else {
                    url = host + location.pathname.slice(0, location.pathname.lastIndexOf('/')) + '/' + value;
                }
            }
            this.__update("source", url);
        },
        "set resizeMode": function (value) {
            this.__update("resizeMode", value);
        }
    });
    module.exports = Image;
});
