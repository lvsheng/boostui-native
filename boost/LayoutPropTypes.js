define(function (require, exports, module) {
    "use strict";

    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");

    var number = validator.number;
    var px = validator.px;
    var _enum = validator.oneOf;
    var color = validator.color;

    var LayoutPropTypes = StyleSheet.createPropTypes({
        "width": [px, null],
        "height": [px, null],
        "minWidth": [px, null],
        "minHeight": [px, null],
        "maxWidth": [px, null],
        "maxHeight": [px, null],
        "left": [px, null],
        "right": [px, null],
        "top": [px, null],
        "bottom": [px, null],
        "margin": [px, 0],
        "marginLeft": [px, 0],
        "marginRight": [px, 0],
        "marginTop": [px, 0],
        "marginBottom": [px, 0],
        "marginHorizontal": [px, 0],
        "marginVertical": [px, 0],
        "padding": [px, 0],
        "paddingLeft": [px, 0],
        "paddingRight": [px, 0],
        "paddingTop": [px, 0],
        "paddingBottom": [px, 0],
        "paddingHorizontal": [px, 0],
        "paddingVertical": [px, 0],
        "borderWidth": [px, 0],
        "borderLeftWidth": [px, 0],
        "borderRightWidth": [px, 0],
        "borderTopWidth": [px, 0],
        "borderBottomWidth": [px, 0],
        "borderRadius": [px, 0],
        "borderTopLeftRadius": [px, 0],
        "borderTopRightRadius": [px, 0],
        "borderBottomRightRadius": [px, 0],
        "borderBottomLeftRadius": [px, 0],
        "borderColor": [color, 0xff000000|0],
        "borderLeftColor": [color, 0xff000000|0],
        "borderTopColor": [color, 0xff000000|0],
        "borderRightColor": [color, 0xff000000|0],
        "borderBottomColor": [color, 0xff000000|0],
        "flexDirection": [_enum("row", "column"), "column"],
        "justifyContent": [_enum("flex-start", "flex-end", "center", "space-between", "space-around"), "flex-start"],
        "alignItems": [_enum("flex-start", "flex-end", "center", "stretch"), "stretch"],
        "alignSelf": [_enum("auto", "flex-start", "flex-end", "center", "stretch"), "auto"],
        "flex": [number, 0],
        "flexWrap": [_enum("wrap", "nowrap"), "nowrap"],
        "position": [_enum("absolute", "relative"), "relative"],

        //TODO: 改为transform
        "scaleX": [number, 1],
        "scaleY": [number, 1],

        "tapHighlightColor": [color, 0x00000000|0]
    });

    module.exports = LayoutPropTypes;

});
