define(function (require, exports, module) {
    var Text = require("boost/Text");
    var boost = require("boost/boost");
    var xml = require("boost/xml");

    //先加载再使用
    boost.documentElement.appendChild(xml.parse(
        "<View>" +
        "   <style>" +
        "       @font-face {" +
        "           font-family: icon;" +
        "           src: url('http://cp01-rdqa-dev376.cp01.baidu.com:8888/ux_1441864435_8553376/iconfont.ttf.php');" +
        "       }" +
        "       .a {" +
        "           font-family: icon;" +
        "           color: black;" +
        "       }" +
        "   </style>" +
        "   <Text class='a'>" + String.fromCharCode(59325) + "测试文本1" + "</Text>" +
        "</View>"
    ));

    //使用已parse的字体
    boost.documentElement.appendChild(xml.parse(
        "<View>" +
        "   <style>" +
        "       .b {" +
        "           font-family: icon;" +
        "           color: black;" +
        "       }" +
        "   </style>" +
        "   <Text class='b'>" + String.fromCharCode(59325) + "测试文本2" + "</Text>" +
        "</View>"
    ));

    //先使用再加载
    boost.documentElement.appendChild(xml.parse(
        "<View>" +
        "   <style>" +
        "      .c {" +
        "           font-family: icon2;" +
        "           color: black;" +
        "      }" +
        "      @font-face {" +
        "           font-family: icon2;" +
        "           src: url('http://cp01-rdqa-dev376.cp01.baidu.com:8888/ux_1441864435_8553376/iconfont.ttf.php');" +
        "      }" +
        "   </style>" +
        "   <Text class='c'>" + String.fromCharCode(59325) + "测试文本3" + "</Text>" +
        "</View>"
    ));
});
