define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var tagMap = require("boost/tagMap");
    var each = require("base/each");
    var assert = require("base/assert");
    var FontNativeObject = require("boost/nativeObject/Font");

    //TODO: 是否有默认已加载的font？
    var createdFont = {}; //key为fontName 值为FontNativeObject
    var fontToApply = {}; //key为nativeObject.tag，值为fontName

    //TODO: 单独抽离出一个font对应的NativeObject，将现有的NativeObject分离出基类与ElementNativeObject
    module.exports = {
        setFont: function (nativeObject, fontName) {
            if (createdFont[fontName]) { //load过的，直接应用即可
                nativeObject.updateView("font", createdFont[fontName].tag);
                delete fontToApply[nativeObject.tag]; //之前待load的字体已失效
            } else { //未load的，先加入缓存，待load完再应用
                fontToApply[nativeObject.tag] = fontName;
            }
        },
        createFont: function (fontName, src) {
            if (createdFont[fontName] && createdFont[fontName].src !== src) {
                console.warn("正常尝试对同一个fontFamily从两个url加载字体，不予生效！");
                return;
            }
            if (createdFont[fontName]) {
                return; //已创建，不再重复创建
            }

            createdFont[fontName] = new FontNativeObject(fontName, src);
            //创建后即可使用，应用之
            each(fontToApply, function (applyFontName, nativeObjectTag) {
                if (applyFontName === fontName) {
                    var nativeObject = tagMap.get(nativeObjectTag);
                    assert(!!nativeObject);
                    nativeObject.updateView("font", createdFont[fontName].tag);
                    delete fontToApply[nativeObjectTag];
                }
            });
        }
    };
});
