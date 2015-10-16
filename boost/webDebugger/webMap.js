define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var ID_ATTR_NAME = "__web_map_id";

    var WebMap = derive(Object, {
        _boostMap: {},
        _webMap: {},

        getBoostElement: function (webElement) {
            var id = this._getId(webElement);
            var boostElement = this._boostMap[id];

            return boostElement;
        },
        getWebElement: function (boostElement) {
            var id = this._getId(boostElement);
            var webElement = this._webMap[id];

            return webElement;
        },

        set: function (boostElement, webElement) {
            var id = boostElement.tag;

            this._markId(boostElement, id, "boost");
            this._boostMap[id] = boostElement;

            this._markId(webElement, id, "web");
            this._webMap[id] = webElement;
        },

        getAllWebElements: function () {
            var result = [];
            each(this._webMap, function (value) {
                result.push(value);
            });
            return result;
        },

        _getId: function (element) {
            return element[ID_ATTR_NAME];
        },
        _markId: function (element, id, type) {
            //TODO 在web上显示id
            //为了方便，暂时就直接赋值属性了~（为了不在dom上显示以防用户复制元素时一起复制下来，没有setAttribute）
            element[ID_ATTR_NAME] = id;
        }
    });

    module.exports = new WebMap();
});
