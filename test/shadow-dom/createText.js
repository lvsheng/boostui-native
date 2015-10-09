define(function (require, exports, module) {
    var boost = require("boost/boost");

    module.exports = function (text) {
        var textElement = boost.createElement("Text");
        textElement.value = text;
        textElement.style.fontSize = "22";
        textElement.style.fontWeight = "bold";
        textElement.style.fontStyle = "italic";
        textElement.style.alignSelf = "center";
        return textElement;
    };
});
