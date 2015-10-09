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

    console.info("set padding of text, but should be blocked by boost");
    text.style.paddingLeft = 10;
    text.style.paddingTop = 10;
    text.style.paddingRight = 10;
    text.style.paddingBottom = 10;
});

