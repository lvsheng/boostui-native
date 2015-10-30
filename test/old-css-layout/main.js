define(function (require, exports, module) {
    var boost = require("boost/boost");
    require("boost/webDebugger/webDebugger").start();

    var view = boost.createElement("view");
    boost.documentElement.appendChild(view);
    view.style.backgroundColor = "rgba(0, 100, 0, 0.3)";
    view.style.padding = 10;

    var text = boost.createElement("text");
    view.appendChild(text);
    text.value = "hello, boost";
    text.style.color = "rgba(0, 0, 0, 1)";
    text.style.fontSize = "22";
    text.style.fontWeight = "bold";
    text.style.fontStyle = "italic";
    text.style.alignSelf = "center";

    var image = boost.createElement("image");
    image.src = "http://fedev.baidu.com/~lvsheng/o2o/lvsheng/mainPage/bg.jpg";
    view.appendChild(image);
    image.style.borderWidth = 100; //web下不会覆盖内容区。但boost会
    image.style.padding = 20; //web下生效，但boost不生效并native报错
});

