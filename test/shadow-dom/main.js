define(function (require, exports, module) {
    var Text = require("boost/Text");
    var boost = require("boost/boost");

    var text = new Text();
    text.value = "hello, boost " + (+new Date) % 10;
    text.style.color = "rgba(255, 255, 255, 1)";
    text.style.fontSize = "22";
    text.style.fontWeight = "bold";
    text.style.fontStyle = "italic";
    text.style.alignSelf = "center";

    var container = boost.createElement("View");
    container.style.backgroundColor = "rgba(0, 100, 0, 0.8)";

    container.appendChild(text);
    boost.documentElement.appendChild(container);

    setTimeout(function () {
        var shadowRoot = container.attachShadow();
        var slot = boost.createElement("Slot");
        setTimeout(function () {
            shadowRoot.appendChild(slot);
        }, 1000);
    }, 1000);
});

