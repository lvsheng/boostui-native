define(function (require, exports, module) {
    var createText = require("test/shadow-dom/createText");
    var randomColor = require("test/shadow-dom/randomColor");
    var inform = require("test/shadow-dom/inform");

    var shadowHost = boost.createElement("View");
    shadowHost.style.backgroundColor = randomColor(0.3);
    boost.documentElement.appendChild(shadowHost);

    inform("创建text、text124");
    var text = createText("text");
    shadowHost.appendChild(text);
    var text1 = createText("text1");
    text1.slot = "slot1";
    shadowHost.appendChild(text1);
    var text2 = createText("text2");
    text2.slot = "slot2";
    shadowHost.appendChild(text2);
    var text4 = createText("text4");
    text4.slot = "slot4";
    shadowHost.appendChild(text4);

    setTimeout(function () {
        inform("attachShadow(), 子元素将被隐藏");
        var shadowRoot = shadowHost.attachShadow();

        setTimeout(function () {
            inform("添加默认slot、slot123，\ntext、text12将被展现，text4不被展现，\nslot3没有assignedNode，作为普通元素展现");
            var slotDefault = boost.createElement("Slot");
            shadowRoot.appendChild(slotDefault);
            var slot1 = boost.createElement("Slot");
            slot1.name = "slot1";
            shadowRoot.appendChild(slot1);
            var slot2 = boost.createElement("Slot");
            slot2.name = "slot2";
            shadowRoot.appendChild(slot2);
            var slot3 = boost.createElement("Slot");
            slot3.name = "slot3";
            shadowRoot.appendChild(slot3);
            var textSlot3 = createText("slot3");
            slot3.appendChild(textSlot3);

            setTimeout(function () {
                inform("添加slot4，\ntext4将被展现");
                var slot4 = boost.createElement("Slot");
                slot4.name = "slot4";
                shadowRoot.appendChild(slot4);

                setTimeout(function () {
                    inform("添加text3，\n将展现在slot3下");
                    var text3 = createText("text3");
                    text3.slot = "slot3";
                    shadowHost.appendChild(text3);

                    setTimeout(function () {
                        inform("text4前插入toxt，\ncomposedTree中将展现在text之后");
                        var toxt = createText("toxt");
                        shadowHost.insertBefore(toxt, text4); //composedTree中将展示在text之后

                        setTimeout(function () {
                            inform("text前插入taxt，\ncomposedTree中将展现在text之前");
                            var taxt = createText("taxt");
                            shadowHost.insertBefore(taxt, text); //composedTree中将展示在text之前
                        });
                    });
                });
            });
        });
    });
});
