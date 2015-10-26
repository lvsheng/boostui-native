define(function (require, exports, module) {
    "use strict";


    var StyleSheet = require("boost/StyleSheet");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var validator = require("boost/validator");

    var number = validator.number;
    var px = validator.px;
    var string = validator.string;
    var color = validator.color;
    var _enum = validator.oneOf;

    var ViewStylePropTypes = StyleSheet.createPropTypes(LayoutPropTypes, {
        "backgroundColor": [color, 0x00000000|0],
        "alpha": [number, 1],
        //"overflow": [_enum('visible', 'hidden'), 'hidden'],
        //"shadowColor": color, //
        //"shadowOffset": { //
        //    "width": px,
        //    "height": px
        //},
        //"shadowOpacity": number, //
        //"shadowRadius": px, //}
    });

    module.exports = ViewStylePropTypes;

});
