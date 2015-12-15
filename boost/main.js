//加载必需被加载(其内监听事件、发起主动动作)的文件
console.timeEnd("define.boost");
console.log("boost/main.js loaded");
console.time("boost.main");
require([
    "base/derive",
    "boost/nativeEventHandler",
    "boost/bridge",
    "boost/boost",
    "boost/xml",
    "boost/$"
], function (derive, nativeEventHandler, bridge, boost, xml, $) {
    console.timeEnd("boost.main");
    console.log("boost/main.js module start");
    //console.log("no getMethodMapping");
    //bridge.getMethodMapping();// TODO: 为了性能，暂去掉getMethodMapping

    var Boost = derive(Object, {
        "get documentElement": function () {
            return boost.documentElement;
        },
        setDocumentElementLayerZIndex: $.proxy(boost.setDocumentElementLayerZIndex, boost),
        parse: $.proxy(xml.parse, xml),
        createElement: $.proxy(boost.createElement, boost),
        $: $
    });
    window.boost = new Boost();
});
