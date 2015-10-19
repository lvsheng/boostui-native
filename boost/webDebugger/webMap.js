define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var ID_ATTR_NAME = "_id";

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
            return element.getAttribute(ID_ATTR_NAME);
        },
        _markId: function (element, id, type) {
            element.setAttribute(ID_ATTR_NAME, id);
        }
    });

    module.exports = new WebMap();
});
