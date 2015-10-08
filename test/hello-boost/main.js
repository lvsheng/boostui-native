define(function (require, exports, module) {
    var Text = require("boost/Text");
    var boost = require("boost/boost");

    var text = new Text();
    boost.documentElement.appendChild(text);
    text.value = "hello, boost";
    text.style.color = "rgba(0, 0, 0, 1)";
    text.style.fontSize = "22";
    text.style.fontWeight = "bold";
    text.style.fontStyle = "italic";
    text.style.alignSelf = "center";
});

