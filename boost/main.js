//加载必需被加载(其内监听事件、发起主动动作)的文件
console.timeEnd("define.boost");
console.log("boost/main.js loaded");
console.time("boost.main");
//FIXME: 现在只在票务页面里用了
require([
    "boost/nativeEventHandler",
    "boost/bridge"
], function (nativeEventHandler, bridge) {
    console.timeEnd("boost.main");
    console.log("boost/main.js module start");
    //console.log("no getMethodMapping");
    //bridge.getMethodMapping();// TODO: 为了性能，暂去掉getMethodMapping
});
