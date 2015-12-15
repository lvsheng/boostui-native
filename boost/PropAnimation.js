define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Animation= require("boost/Animation");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * @param config {Object}
     * @param config.prop {string}
     * @param config.from {number}
     * @param config.to {number}
     * @param config.duration {number}
     * @param config.easing {string}
     *  "easeInOutSine"|"easeInQuad"|"easeInBack"|"easeInOutBack"|"easeOutElastic"|"easeOutSine"|"linear"|"easeOutBack"
     * @param config.element {NativeElement}
     */
    var PropAnimation = derive(Animation, function (config) {
        Animation.call(this, TYPE_ID.PROP_ANIMATION, {
            prop: config.prop,
            from: config.from,
            to: config.to,
            duration: config.duration,
            easing: config.easing,
            element: config.element
        });
    },{
    });

    module.exports = PropAnimation;
});
