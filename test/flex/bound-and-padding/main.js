define(function (require, exports, module) {
    var boost = require("boost/boost");
    var xml = require("boost/xml");
    var each = require("base/each");
    var trim = require("base/trim");
    var slice = require("base/slice");
    require("boost/webDebugger/webDebugger").start();

    var styleContent = document.querySelector("#boost-style").outerHTML;
    var htmlContent = document.querySelector("#flex").outerHTML;
    var xmlStr = "<View>" +
        styleContent +
        textStrToTextTag(divToView(htmlContent)) +
        "</View>";
    xml.loadFromString(xmlStr);

    alert("上面两条为native, 下面两条为webView的\n与mac chrome模拟相比，第二个蓝条css layout渲染有bug(使用max-width为最终限，而chrome使用padding值为最终限)");

    function divToView (str) {
        var reg = /(<\/?)div(\s+[^>]*)?/g;
        return str.replace(reg, '$1view$2');
    }

    function textStrToTextTag (str) {
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = str;
        travel(tempDiv, function (node) {
            if (node.nodeType === 3) {
                var textContent = node.textContent;
                if (!trim(textContent)) {
                    return;
                }

                var textTag = document.createElement("text");
                textTag.innerHTML = textContent;
                var index = slice(node.parentElement.childNodes).indexOf(node);
                var parent = node.parentElement;
                parent.removeChild(node);
                if (index === 0) {
                    parent.appendChild(textTag);
                } else {
                    parent.insertBefore(textTag, parent.childNodes[index]);
                }
            }
        });
        return tempDiv.innerHTML;
    }

    function travel (node, cb) {
        each(node.childNodes, function (child) {
            travel(child, cb);
        });
        cb(node);
    }
});

