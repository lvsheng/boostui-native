define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var copyProperties = require("base/copyProperties");
    var NativeElement = require("boost/NativeElement");
    var validator = require("boost/validator");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * 联动器
     * @param conf.prop {string} 支持各数值属性与颜色属性（color|backgroundColor）
     * @param conf.from {number | color}
     * @param conf.to {number | color}
     * @param conf.target {NativeElement}
     * @param conf.duration {number}
     * @param conf.type {"together"|"sequentially"}
     */
    var LinkageNativeObject = derive(NativeObject, function (conf) {
        conf = copyProperties({}, conf);
        if (conf.target) {
            assert(conf.target instanceof NativeElement);
            conf.target = conf.target.nativeObject.tag;
        }

        var colorProps = ["color", "backgroundColor"];
        if (colorProps.indexOf(conf.prop) > -1) {
            //isColor
            conf.updateColor = true;
            conf.fromColor = validator.color(conf.from);
            conf.toColor = validator.color(conf.to);
            delete conf.from;
            delete conf.to;
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
