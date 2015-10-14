define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Animation= require("boost/Animation");

    var TYPE_ANIMATION_SET = 12;
    /**
     * @param config {Object}
     * @param config.type {string} "together"|"sequentially"
     * @param config.element {NativeElement}
     */
    var AnimationSet = derive(Animation, function (config) {
        this._index = -1;
        Animation.call(this, TYPE_ANIMATION_SET, {
            type: config.type,
            element: config.element
        });
    },{
        add: function (animation) {
            this.__native__.__callNative("add", [animation.__native__.tag, ++this._index]);
        }
    });

    module.exports = AnimationSet;
});
