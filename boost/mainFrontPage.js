define(function (require, exports, module) {
    "use strict";

    //TODO: change name to frontPage?
    var derive = require("base/derive");
    var assert = require("base/assert");
    var BoostPage = require("boost/BoostPage");
    var ElementNativeObject = require("boost/nativeObject/Element");

    var FRONTPAGE_ID = -2;
    /**
     * 背景页中：对应o2o打开时背景页中由native创建的主/默认前景页
     * 前景页中：对应本页面的boostPage
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
