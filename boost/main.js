//加载必需被加载(其内监听事件、发起主动动作)的文件
console.timeEnd("define.boost");
console.log("boost/main.js loaded");
console.time("boost.main");
require([
    "boost/nativeEventHandler",
    "boost/bridge",
    "boost/boost",
    "boost/xml"
], function (nativeEventHandler, bridge, boost, xml) {
    console.timeEnd("boost.main");
    console.log("boost/main.js module start");
    //console.log("no getMethodMapping");
    //bridge.getMethodMapping();// TODO: 为了性能，暂去掉getMethodMapping

    window.boost = {
        documentElement: boost.documentElement,
        parse: xml.parse.bind(xml),
        createElement: boost.createElement.bind(boost)
    };
});
