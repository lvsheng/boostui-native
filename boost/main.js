//加载必需被加载(其内监听事件、发起主动动作)的文件
console.timeEnd("define.boost");
console.log("boost/main.js loaded");
console.time("boost.main");
require([
    "base/derive",
    "base/each",
    "boost/nativeEventHandler",
    "boost/bridge",
    "boost/boost",
    "boost/$",

    "boost/View",
    "boost/Element",
    "boost/Text",
    "boost/TextInput",
    "boost/Image",
    "boost/ScrollView",
    "boost/BoostPage",
    "boost/Slider",
    "boost/RootView",
    "boost/Slot",
    "boost/ViewPager",
    "boost/Toolbar",
    "boost/elementCreator"
], function (
    derive, each, nativeEventHandler, bridge, boost, $,

    View,
    Element,
    Text,
    TextInput,
    Image,
    ScrollView,
    BoostPage,
    Slider,
    RootView,
    Slot,
    ViewPager,
    Toolbar,
    elementCreator
) {
    console.timeEnd("boost.main");
    console.log("boost/main.js module start");
    //console.log("no getMethodMapping");
    //bridge.getMethodMapping();// TODO: 为了性能，暂去掉getMethodMapping

    var TAG_MAP = {
        "View": View,
        "Text": Text,
        "TextInput": TextInput,
        "Image": Image,
        "Img": Image,
        "ScrollView": ScrollView,
        "Slider": Slider,
        "Slot": Slot,
        "ViewPager": ViewPager,
        "Toolbar": Toolbar,
        "BoostPage": BoostPage,
        "RootView": RootView
    };
    each(TAG_MAP, function (constructor, tagName) {
        elementCreator.register(tagName, {
            constructor: constructor
        });
    });

    var Boost = derive(Object, {
        "get documentElement": function () {
            return boost.documentElement;
        },
        $: $
    });
    var exportBoost = new Boost();
    exportsMethod("createElement", boost);
    exportsMethod("getElementById", boost);
    exportsMethod("getElementsByClassName", boost);
    exportsMethod("getElementsByTagName", boost);
    exportsMethod("querySelector", boost);
    exportsMethod("querySelectorAll", boost);
    exportsMethod("dispatchEvent", boost);
    exportsMethod("setDocumentElementLayerZIndex", boost);

    window.boost = exportBoost;

    function exportsMethod (methodName, obj) {
        exportBoost[methodName] = $.proxy(obj[methodName], obj);
    }
});
