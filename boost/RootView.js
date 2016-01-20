define(function (require, exports, module) {
    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var RootView = derive(NativeElement, function(id) {
        NativeElement.call(this, TYPE_ID.ROOT_VIEW, "RootView", id);
    }, {
        __getStyle: function () {
            return new ViewStyle();
        },
        __createWebElement: function (info) {
            var el = document.createElement("div");
            el.id = "BOOST_ROOT_VIEW_" + info.objId;
            el.style.height = "100%";
            el.style.width = "100%";
            el.style.position = "absolute";
            el.style.top = "0";
            el.style.left = "0";
            return el;
        }
    });
    module.exports = RootView;
});
