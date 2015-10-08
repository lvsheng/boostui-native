"use strict";
(function (window) {
    var OBJECT_NAME = 'lc_bridge';
    var METHOD_LIST = ['callQueue'];
    var INJECT_PREFIX = 'O2OZone#234asdg233hfr90';

    var slice = [].slice;
    var prompt = window.prompt;

    var injectObj = window[OBJECT_NAME] = window[OBJECT_NAME] || {};
    inject(injectObj, OBJECT_NAME, METHOD_LIST);

    function inject(obj, name, methods) {
        obj = obj || {};
        var count = methods.length;
        var index;
        var key;

        for (index = 0; index < count; index++) {
            key = methods[index];
            obj[key] = bindNative(name, key);
        }
        return obj;
    }

    function bindNative(name, method) {
        return function () {
            var methodStr = JSON.stringify([name, method]);
            //console.info(+new Date);
            window.console.log(INJECT_PREFIX + ':' + methodStr.length + ':'
                + methodStr
                + JSON.stringify(slice.call(arguments)));
        };
    }
})(window);
