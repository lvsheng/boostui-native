define(function (require, exports, module) {
    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var ElementNativeObject = require("boost/nativeObject/Element");

    var ROOT_VIEW_TYPE_ID = 21;
    var RootView = derive(NativeElement, function() {
        NativeElement.call(this, null, "RootView");
    }, {
        __createView: function() {
            this.__native__ = new ElementNativeObject(ROOT_VIEW_TYPE_ID);
        }
    });
    module.exports = RootView;
});
