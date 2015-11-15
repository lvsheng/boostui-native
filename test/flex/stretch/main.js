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

    alert("上半部分为native，下面部分为chrome。\n" +
        "hello是absolute之后bottom:0的\n" +
        "web下其实感觉都不正常。本应该bottom:0就是在stretch之后的bottom的。" +
        "但现在都是stretch之前元素自己递归时计算出来的bottom\n" +
        "而css-layout下则第二个自己正常了（因为整个高度就是它撑起来的），但其他两个不正常\n" +
        "9月底左右更新性能优化后的csslayout，目测是引入了更大的问题：span1外边元素的整体高度应该就已经不正常了(但还没测试)");

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

