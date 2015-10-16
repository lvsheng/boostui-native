define(function (require, exports, module) {
    var boost = require("boost/boost");
    require("boost/webDebugger/webDebugger").start();

    var text = boost.createElement("text");
    boost.documentElement.appendChild(text);
    text.value = "remove me";
    text.style.alignSelf = "center";

    var anotherText = boost.createElement("text");
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

