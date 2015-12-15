define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var View = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "View");
        NativeElement.call(this, TYPE_ID.VIEW, "View");
    }, {
        __getStyle: function () {
            return new ViewStyle();
        }
    });
    module.exports = View;
});
