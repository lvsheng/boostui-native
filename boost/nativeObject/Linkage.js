define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var copyProperties = require("base/copyProperties");
    var NativeElement = require("boost/NativeElement");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * 联动器
     * @param conf.prop {string}
     * @param conf.from {number}
     * @param conf.to {number}
     * @param conf.target {NativeElement}
     * @param conf.duration {number}
     * @param conf.type {"together"|"sequentially"}
     * @param conf.fromColor {int} 应为validator.color返回值 TODO: 本方法内做color的转换
     * @param conf.toColor {int}
     * @param conf.updateColor {boolean}
     */
    var LinkageNativeObject = derive(NativeObject, function (conf) {
        conf = copyProperties({}, conf);
        if (conf.target) {
            assert(conf.target instanceof NativeElement);
            conf.target = conf.target.nativeObject.tag;
        }
        NativeObject.call(this, TYPE_ID.LINKAGE, undefined, conf);

        this._curIndex = 0;
    }, {
        addLinkage: function (linkage) {
            assert(linkage instanceof  LinkageNativeObject);
            this.__callNative("add", [linkage.tag, this._curIndex++]);
        }
    });

    module.exports = LinkageNativeObject;
});
