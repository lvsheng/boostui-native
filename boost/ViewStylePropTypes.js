define(function (require, exports, module) {
    "use strict";


    var StyleSheet = require("boost/StyleSheet");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var validator = require("boost/validator");

    var number = validator.number;
    var string = validator.string;
    var color = validator.color;
    var _enum = validator.oneOf;

    var ViewStylePropTypes = StyleSheet.createPropTypes(LayoutPropTypes, {
        "backgroundColor": [color, "transparent"],
        "borderRadius": [number, 0],
        "borderTopLeftRadius": [number, 0],
        "borderTopRightRadius": [number, 0],
        "borderBottomRightRadius": [number, 0],
        "borderBottomLeftRadius": [number, 0],
        "borderColor": [color, "black"],
        "borderLeftColor": [color, "black"],
        "borderTopColor": [color, "black"],
        "borderRightColor": [color, "black"],
        "borderBottomColor": [color, "black"],
        //"opacity": [number, 1],
        //"overflow": [_enum('visible', 'hidden'), 'hidden'],
        //"shadowColor": color, //
        //"shadowOffset": { //
        //    "width": number,
        //    "height": number
        //},
        //"shadowOpacity": number, //
        //"shadowRadius": number, //}
    });

    module.exports = ViewStylePropTypes;

});
