define(function (require, exports, module) {
    var nativeCallbackMap = require("boost/nativeCallbackMap");
    var tagMap = require("boost/tagMap");
    var lightApi = require("boost/nativeObject/lightApi");
    var bridge = require("boost/bridge");
    var assert = require("base/assert");

    var BOOST_EVENT_TYPE = "boost";
    var BOOSTCALLBACK_EVENT_TYPE = "boostcallback";
    var BOOSTERROR_EVENT_TYPE = "boosterror";


    var lastTouchStartX = null;
    var lastTouchStartY = null;
    var touchStartTarget = null;
    var lastTouchType = ""; //"start"|"end"
    var lastTouchStartStopped = false;

    document.addEventListener(BOOST_EVENT_TYPE, function(e) {
        var origin = e.origin;
        var target = tagMap.get(origin);
        var type = e.boostEventType.toLowerCase();
        var data = e.data;
        var eventStopped;
        var clickTimerHandle;

        if (clickTimerHandle && (type === "touchstart" || type === "touchend")) {
            clearTimeout(clickTimerHandle);
        }

        //console.info("origin:" + origin, "type:" + type, e);
        if (!target) {
            return;
        }

        // 这里为了提高效率，就不用 dispatchEvent 那一套了。
        eventStopped = target.__onEvent(type, e);

        switch (type) {
            case "touchstart":
                lastTouchStartX = data.x;
                lastTouchStartY = data.y;
                touchStartTarget = target;
                break;

            case "touchend":
                //必需有连续并且未被stop的一对touchstart-touchend，才发出click （初衷: scrollview滚动中的点停不要触发内部子元素的click）
                if (lastTouchType === "start" && !lastTouchStartStopped && !eventStopped) {
                    var clickElement = findSameAncestor(touchStartTarget.element, target.element);
                    var clickTarget = clickElement && clickElement.nativeObject;
                    var DURATION = 100;
                    // 一断时间之后再派发，这样如果这断时间内有scroll，就可以由scroll元素把click事件也在派发时拦截。。
                    // 前因：scrollView某些场景的操作会在touchend之后几十毫秒再派发scroll事件。。。。
                    clickTimerHandle = setTimeout(function () {
                        /**
                         * clickTarget可能值：
                         * 两者为同一节点时，此节点
                         * 其中一个是另一个的祖先时，祖先者（从父移到子，或从子移到父）
                         * 两者有共同祖先时，共同祖先（从共同父中的一个子移到另一个子）
                         */
                        clickTarget && clickTarget.__onEvent("click", e);
                    }, DURATION);
                } else {
                    //console.log("touchend, but no click");
                }
                lastTouchStartX = 0;
                lastTouchStartY = 0;
                touchStartTarget = null;
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
        //console.log("FOUND CALLBACK " + JSON.stringify(data));
        //console.info("callbackId:" + callbackId, e);

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

    // 页面卸载时,删除所有的 NativeView
    window.addEventListener("unload", function(e) {
        lightApi.hideInputMethod(); //跳转时键盘可能还在，这里强制隐藏之
        bridge.destroyAll();
    });
    // 页面加载时，先尝试删除所有 NativeView
    //bridge.destroyAll(); //因为服务导航与票务页面都加载js，如果后加载的一个destroyAll，会影响前一个页面的内容

    document.addEventListener("touchstart", generateBoostEventFromWeb);
    document.addEventListener("touchend", generateBoostEventFromWeb);
    document.addEventListener("scroll", generateBoostEventFromWeb);
    function generateBoostEventFromWeb (e) {
        var originId = e.target.__boost_origin__;
        if (!originId) {
            return;
        }

        var event = document.createEvent('Event');
        event.initEvent(BOOST_EVENT_TYPE, false, false);
        event.boostEventType = e.type;
        event.origin = originId;
        switch (event.boostEventType) {
            case "touchstart":
            case "touchend":
                event.data = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY
                };
                break;
            case "scroll":
                var tagName = tagMap.get(event.origin).tagName.toLowerCase();
                assert(tagName === "scrollview" || tagName === "viewpager");
                //TODO
                break;
        }

        document.dispatchEvent(event);
    }

    /**
     * 判断ancestor是否在descendant的祖先元素中
     * @param descendant
     * @param ancestor
     */
    function isAncestor (descendant, ancestor) {
        var parent;
        for (
            parent = descendant.parentNode;
            parent && parent !== ancestor;
            parent = parent.parentNode
        ) {
        }
        return !!parent;
    }

    /**
     * 找到a与b相同的祖先节点
     *
     * 若两者为同一节点，返回之
     * 否则，若其中一个是另一个的祖先，返回祖先者
     * 否则，若两者有共同祖先，返回之
     * 否则，返回null
     * @param a
     * @param b
     * @returns {*}
     */
    function findSameAncestor (a, b) {
        if (a === b) {
            return a;
        }

        var aAncestors = [];
        var bAncestors = [];
        var curA;
        var curB;
        for (curA = a; curA; curA = curA.parentNode) {
            aAncestors.push(curA);
        }
        for (curB = b; curB; curB = curB.parentNode) {
            bAncestors.push(curB);
        }

        var rootA = aAncestors.pop();
        var rootB = bAncestors.pop();
        if (rootA !== rootB) {
            return null;
        }

        do {
            curA = aAncestors.pop();
            curB = bAncestors.pop();
        } while (curA === curB);

        if (!curA) {
            //a是b的祖先
            return curB.parentNode;
        }
        if (!curB) {
            //b是a的祖先
            return curA.parentNode;
        }

        //curA与curB是兄弟
        assert(curA.parentNode === curB.parentNode, "logic error: curA and curB should be brothers");
        return curA.parentNode;
    }
});
