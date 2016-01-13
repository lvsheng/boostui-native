//加载必需被加载(其内监听事件、发起主动动作)的文件
console.log("boost/main.js loaded");
require([
    "base/assert",
    "base/type",
    "base/derive",
    "base/each",
    "base/copyProperties",

    "boost/nativeEventHandler",
    "boost/bridge",
    "boost/boost",
    "boost/nativeVersion",
    "boost/$",
    "boost/nativeObject/backgroundPage",
    "boost/nativeObject/lightApi",
    "boost/nativeObject/Linkage",

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
    "boost/Dialog",
    "boost/elementCreator"
], function (
    assert, type, derive, each, copyProperties,
    nativeEventHandler, bridge, boost, nativeVersion, $, backgroundPage, lightApi, Linkage,

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
    Dialog,
    elementCreator
) {
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
        //base
        assert: assert,
        each: each,
        type: type,
        copyProperties: copyProperties,

        $: $,
        Linkage: Linkage,
        Dialog: Dialog,

        inO2O: !nativeVersion.shouldUseWeb(),

        "get documentElement": function () {
            return boost.documentElement;
        },
        openNewPage: function (href) {
            function completeHref (inValue) {
                if (/^https?:\/\//.test(inValue)) {
                    return inValue;
                }

                if (inValue[0] === "/") {
                    return location.origin + inValue;
                }

                var h = location.href;
                return h.slice(0, h.lastIndexOf("/")) + "/" + inValue.slice(1);
            }

            var url = completeHref(href);

            if (nativeVersion.shouldUseWeb()) {
                window.open(url);
            } else {
                backgroundPage.postMessage("openPage", url);
            }
        },
        showLoading: function () {
            bridge.handleLoading();
            bridge.showLoading();
        },
        hideLoading: function () {
            bridge.hideLoading();
            bridge.cancelHandleLoading(); //为保证安全，每次hide都交还控制权
        }
    });
    var exportBoost = new Boost();
    exportsMethod("createElement", boost);
    exportsMethod("getElementById", boost);
    exportsMethod("addLayer", boost);
    exportsMethod("removeLayer", boost);
    exportsMethod("getElementsByClassName", boost);
    exportsMethod("getElementsByTagName", boost);
    exportsMethod("querySelector", boost);
    exportsMethod("querySelectorAll", boost);
    exportsMethod("dispatchEvent", boost);
    exportsMethod("setDocumentElementLayerZIndex", boost);
    exportsMethod("flush", bridge);
    exportsMethod("getLocatedCity", lightApi);
    exportsMethod("showInputMethod", lightApi);
    exportsMethod("hideInputMethod", lightApi);

    window.boost = exportBoost;

    function exportsMethod (methodName, obj) {
        exportBoost[methodName] = $.proxy(obj[methodName], obj);
    }

    if (nativeVersion.shouldUseWeb()) {
        var styleEl = document.createElement("style");
        styleEl.innerText = '' +
            'html, body {' +
            '    margin: 0;' +
            '    padding: 0;' +
            '    height: 100%;' +
            '    overflow: hidden;' +
            '}' +
            'div, input {' +
            '    box-sizing: border-box;' +
            '    position: relative;' +
            '    display: flex;' +
            '    flex-direction: column;' +
            '    align-items: stretch;' +
            '    flex-shrink: 0;' +
            '    align-content: flex-start;' +
            '    border: 0 solid black;' +
            '    margin: 0;' +
            '    padding: 0;' +
            '    overflow: hidden;' +
            '}' +
            'input {' +
            '    border: none;' +
            '    outline: -webkit-focus-ring-color auto 0px;' +
            '}' +
            'input[type="search"]::-webkit-search-decoration,' +
            'input[type="search"]::-webkit-search-cancel-button,' +
            'input[type="search"]::-webkit-search-results-button,' +
            'input[type="search"]::-webkit-search-results-decoration { ' +
            '    display: none;' +
            '}';
        document.head.appendChild(styleEl);
    }
});
