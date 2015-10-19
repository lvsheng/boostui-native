define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var NativeObject = require("boost/nativeObject/NativeObject");

    var COUPLE_TYPE_ID = 16;
    /**
     * 联动器
     * @param conf.target {NativeElement}
     * @param conf.prop {string}
     * @param conf.from {number}
     * @param conf.to {number}
     */
    var CoupleNativeObject = derive(NativeObject, function (conf) {
        assert(conf.target instanceof NativeElement);
        NativeObject.call(this, COUPLE_TYPE_ID, undefined, {
            target: conf.target.nativeObject.tag,
            prop: conf.prop,
            from: conf.from,
            to: conf.to
        });
    }, {});

    module.exports = CoupleNativeObject;
});
