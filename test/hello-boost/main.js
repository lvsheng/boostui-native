define(function (require, exports, module) {
    var Text = require("boost/Text");
    var boost = require("boost/boost");

    var text = new Text();
    boost.documentElement.appendChild(text);

    //as reference
    var TYPE_VIEWGROUP = 0;
    var TYPE_TEXTVIEW = 1;
    var TYPE_IMAGEVIEW = 2;
    var TYPE_SCROLLVIEW = 3;
    var TYPE_SLIDEVIEW = 4;
    var TYPE_EDITTEXT = 5;
    var TYPE_PROCESSBAR = 6;
    var TYPE_FONT = 7;
    var TYPE_TOAST = 8;


    var rootViewId = 0;
    var textViewId = 1;

    var data = [
        // 创建一个 TextView
        ["create", [TYPE_TEXTVIEW, textViewId, {
            "value": "你好世界",
            "color": "#ffff6600",
            "fontSize": 22,
            "fontStyle": "italic",
            "alignSelf": "center",
        }]],

        // 将当前的 TextView 添加到根节点
        ["invoke", [rootViewId, "addView", [
            textViewId,
            0
        ]]],

        // 将字体设置为粗体
        ["invoke", [textViewId, "setFontWeight", ["bold"]]],
    ];

    lc_bridge.callQueue(data);
});

