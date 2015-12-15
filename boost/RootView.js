define(function (require, exports, module) {
    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var RootView = derive(NativeElement, function() {
        NativeElement.call(this, TYPE_ID.ROOT_VIEW, "RootView");
    }, {
        __getStyle: function () {
            return new ViewStyle();
        }
    });
    module.exports = RootView;
});
