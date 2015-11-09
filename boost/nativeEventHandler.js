define(function (require, exports, module) {
    var nativeCallbackMap = require("boost/nativeCallbackMap");
    var tagMap = require("boost/tagMap");

    var BOOST_EVENT_TYPE = "boost";
    var BOOSTCALLBACK_EVENT_TYPE = "boostcallback";
    var BOOSTERROR_EVENT_TYPE = "boosterror";


    var lastTouchStartX = null;
    var lastTouchStartY = null;
    var lastTouchTarget = null;
    var lastTouchType = ""; //"start"|"end"
    var lastTouchStartStopped = false;

    document.addEventListener(BOOST_EVENT_TYPE, function(e) {
        var origin = e.origin;
        var target = tagMap.get(origin);
        var type = e.boostEventType.toLowerCase();
        var data = e.data;
        var eventStopped;

        console.log("origin:" + origin, "type:" + type, e);
        if (!target) {
            return;
        }

        // 这里为了提高效率，就不用 dispatchEvent 那一套了。
        eventStopped = target.__onEvent(type, e);

        switch (type) {
            case "touchstart":
                lastTouchStartX = data.x;
                lastTouchStartY = data.y;
                lastTouchTarget = target;
                break;

            case "touchend":
                if (
                    lastTouchTarget === target
                        //必需有连续并且未被stop的一对touchstart-touchend，才发出click （初衷: scrollview滚动中的点停不要触发内部子元素的click）
                    && lastTouchType === "start" && !lastTouchStartStopped && !eventStopped
                ) {
                    target.__onEvent("click", e);
                    //console.log("click");
                } else {
                    //console.log("touchend, but no click");
                }
                lastTouchStartX = 0;
                lastTouchStartY = 0;
                lastTouchTarget = null;
        }

        if (type === "touchstart") {
            lastTouchType = "start";
            lastTouchStartStopped = eventStopped;
            if (eventStopped) {
                //debugger;
            }
        } else if (type === "touchend") {
            lastTouchType = "end";
        }
    }, false);

    document.addEventListener(BOOSTERROR_EVENT_TYPE, function(e) {
        console.error(e.message + "\n" + e.stack);
    }, false);

    // 回调函数处理
    document.addEventListener(BOOSTCALLBACK_EVENT_TYPE, function(e) {
        var callbackId = e.id;
        var state = e.state;
        var data = e.data;

        var callback = nativeCallbackMap.get(callbackId);
        if (!callback) {
            console.error("unregistered callbackId:", callbackId);
            return;
        }

        // FIXME 重新构造对象是不是不太好？
        // 或者传e过去？但是Callback却收到一个 Event，也是挺奇怪的。
        callback.call(null, {
            state: state,
            data: data
        });
    }, false);
});
