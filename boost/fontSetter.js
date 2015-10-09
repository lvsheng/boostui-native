define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var tagMap = require("boost/tagMap");
    var each = require("base/each");
    var assert = require("base/assert");
    var bridge = require("boost/bridge");

    var TYPE_FONT = 7;
    //TODO: 是否有默认已加载的font？
    var fontIdMap = {}; //key为fontName 值fontId
    var createdFont = {}; //key为fontId 值为url
    var fontToApply = {}; //key为nativeObject.tag，值为fontId

    //TODO: 单独抽离出一个font对应的NativeObject，将现有的NativeObject分离出基类与ElementNativeObject
    module.exports = {
        setFont: function (nativeObject, fontName) {
            var fontId = fontIdMap[fontName] = fontIdMap[fontName] || tagMap.genTag();

            if (createdFont[fontId]) { //load过的，直接应用即可
                nativeObject.updateView("font", fontId);
                delete fontToApply[nativeObject.tag]; //之前待load的字体已失效
            } else { //未load的，先加入缓存，待load完再应用
                fontToApply[nativeObject.tag] = fontId;
            }
        },
        createFont: function (fontName, url) {
            var fontId = fontIdMap[fontName] = fontIdMap[fontName] || tagMap.genTag();
            assert(!createdFont[fontId] || createdFont[fontId] === url, "同一个font名不能加载两个不同字体！");
            if (createdFont[fontId]) {
                return; //已创建，不再重复创建
            }

            bridge.create(TYPE_FONT, fontId, { url: url });
            createdFont[fontId] = url;
            //创建后即可使用，应用之
            each(fontToApply, function (fontIdToApply, nativeObjectTag) {
                if (fontIdToApply === fontId) {
                    var nativeObject = tagMap.get(nativeObjectTag);
                    assert(!!nativeObject);
                    nativeObject.updateView("font", fontId);
                    delete fontToApply[nativeObjectTag];
                }
            });
        }
    };
});
