define(function (require, exports, module) {
    //加载必需被加载(其内监听事件、发起主动动作)的文件
    //FIXME: 换用boost/main.js 打包时打在一起
    require("boost/nativeEventHandler");
    require("boost/bridge");
});
