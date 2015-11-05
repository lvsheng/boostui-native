define(function (require, exports, module) {
    var useO2O = navigator.userAgent.indexOf("BaiduRuntimeO2OZone") > -1;

    var boost = require("boost/boost");
    useO2O && require("boost/webDebugger/webDebugger").start();

    var tagName = useO2O ? "view" : "div";
    var documentContext = useO2O ? boost : document;

    var a = documentContext.createElement(tagName);
    a.id = "a";
    documentContext.documentElement.appendChild(a);
    a.style.backgroundColor = "red";
    a.style.padding = "20px";

    var b = documentContext.createElement(tagName);
    b.id = "b";
    a.appendChild(b);
    b.style.backgroundColor = "green";
    b.style.padding = "20px";

    var c = documentContext.createElement(tagName);
    c.id = "c";
    b.appendChild(c);
    c.style.backgroundColor = "blue";
    c.style.padding = "20px";

    function eHC (e) {
        console.log(this.id, "capture", e);
    }
    function eHB (e) {
        console.log(this.id, "bubble", e);
    }
    //chrome: 对父元素，先执行capture阶段回调、再执行popple阶段。但事件发生的元素本身：回调不区分bubble还是capture，按注册顺序执行。任一回调的stopPropgation，会阻止继续传播
    a.addEventListener("click", eHB);
    b.addEventListener("click", eHB);
    c.addEventListener("click", eHB);
    c.addEventListener("click", eHC, true);
    b.addEventListener("click", eHC, true);
    a.addEventListener("click", eHC, true);

    window.a = a;
    window.b = b;
    window.c = c;
});
