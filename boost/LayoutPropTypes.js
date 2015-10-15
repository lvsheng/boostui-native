define(function (require, exports, module) {
    "use strict";

    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");

    var number = validator.number;
    var _enum = validator.oneOf;

    var LayoutPropTypes = StyleSheet.createPropTypes({
        "width": [number, null],
        "height": [number, null],
        "left": [number, null],
        "right": [number, null],
        "top": [number, null],
        "bottom": [number, null],
        "margin": [number, 0],
        "marginLeft": [number, 0],
        "marginRight": [number, 0],
        "marginTop": [number, 0],
        "marginBottom": [number, 0],
        "marginHorizontal": [number, 0],
        "marginVertical": [number, 0],
        "padding": [number, 0],
        "paddingLeft": [number, 0],
        "paddingRight": [number, 0],
        "paddingTop": [number, 0],
        "paddingBottom": [number, 0],
        "paddingHorizontal": [number, 0],
        "paddingVertical": [number, 0],
        "borderWidth": [number, 0],
        "borderLeftWidth": [number, 0],
        "borderRightWidth": [number, 0],
        "borderTopWidth": [number, 0],
        "borderBottomWidth": [number, 0],
        "flexDirection": [_enum("row", "column"), "column"],
        "justifyContent": [_enum("flex-start", "flex-end", "center", "space-between", "space-around"), "flex-start"],
        "alignItems": [_enum("flex-start", "flex-end", "center", "stretch"), "stretch"],
        "alignSelf": [_enum("auto", "flex-start", "flex-end", "center", "stretch"), "auto"],
        "flex": [number, 0],
        "flexWrap": [_enum("wrap", "nowrap"), "nowrap"],
        "position": [_enum("absolute", "relative"), "relative"],

        //TODO: 改为transform
        "scaleX": [number, 1],
        "scaleY": [number, 1]
    });

    module.exports = LayoutPropTypes;

});
