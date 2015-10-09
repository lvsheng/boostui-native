define(function (require, exports, module) {
    var boost = require("boost/boost");
    var createText = require("test/shadow-dom/createText");

    var text = createText("hello, boost " + (+new Date) % 10);
    var container = boost.createElement("View");
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

