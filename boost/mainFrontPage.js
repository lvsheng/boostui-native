define(function (require, exports, module) {
    "use strict";

    //TODO: 限制只有背景页可以使用？
    var derive = require("base/derive");
    var assert = require("base/assert");
    var BoostPage = require("boost/BoostPage");
    var ElementNativeObject = require("boost/nativeObject/Element");

    var FRONTPAGE_ID = -2;
    /**
     * 对应o2o打开时背景页中由native创建的主/默认前景页
     */
    var MainFrontPage = derive(BoostPage, function () {
        BoostPage.call(this);
    }, {
        __createView: function(type) {
            var self = this;
            var nativeObj = self.__native__ = new ElementNativeObject(type, FRONTPAGE_ID);
            nativeObj.__onEvent = function(type, e) {
                return self.__onEvent(type, e);
            };
        }
    });

    module.exports = new MainFrontPage();
});
