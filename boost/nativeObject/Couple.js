define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var copyProperties = require("base/copyProperties");
    var NativeElement = require("boost/NativeElement");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var COUPLE_TYPE_ID = 16;
    /**
     * 联动器
     * @param conf.prop {string}
     * @param conf.from {number}
     * @param conf.to {number}
     * @param conf.target {NativeElement}
     * @param conf.duration {number}
     * @param conf.type {"together"|"sequentially"}
     */
    var CoupleNativeObject = derive(NativeObject, function (conf) {
        conf = copyProperties({}, conf);
        if (conf.target) {
            assert(conf.target instanceof NativeElement);
            conf.target = conf.target.nativeObject.tag;
        }
        NativeObject.call(this, COUPLE_TYPE_ID, undefined, conf);

        this._curIndex = 0;
    }, {
        addCouple: function (couple) {
            assert(couple instanceof  CoupleNativeObject);
            this.__callNative("add", [couple.tag, this._curIndex++]);
        }
    });

    module.exports = CoupleNativeObject;
});
