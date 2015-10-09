define(function (require, exports, module) {
    var Text = require("boost/Text");
    var boost = require("boost/boost");

    var text = new Text();
    boost.documentElement.appendChild(text);
    text.value = "remove me";
    text.style.alignSelf = "center";

    var anotherText = new Text();
    boost.documentElement.appendChild(anotherText);
    anotherText.value = "hello, boost";
    anotherText.style.color = "rgba(0, 0, 0, 1)";
    anotherText.style.fontSize = "22";
    anotherText.style.fontWeight = "bold";
    anotherText.style.fontStyle = "italic";
    anotherText.style.alignSelf = "center";

    setTimeout(function () {
        boost.documentElement.removeChild(text);
    }, 1000);
});

