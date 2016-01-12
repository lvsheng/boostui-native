define(function (require, exports, module) {
    var tagMap = require("boost/tagMap");
    var assert = require("base/assert");
    var BOOST_EVENT_TYPE = "boost";

    function gen (type, data, origin) {
        var event = document.createEvent('Event');
        event.initEvent(BOOST_EVENT_TYPE, false, false);
        event.boostEventType = type;
        event.origin = origin;
        event.data = data;

        document.dispatchEvent(event);
    }

    /**
     * @param e
     * @param [type] {string} 默认取e.type
     */
    function genFromWebEvent (e, type) {
        var target = e.target;
        if (e.type === "touchend") {
            //touchend时e.target仍为touchstart的元素，故单独查找
            target = document.elementFromPoint(
                e.changedTouches[0].pageX,
                e.changedTouches[0].pageY
            );
        }

        var originId = target.__boost_origin__;
        if (!originId) {
            return;
        }

        var data;
        var eventType = type || e.type;
        switch (eventType) {
            case "touchstart":
            case "touchend":
                data = {
                    x: e.changedTouches[0].clientX,
                    y: e.changedTouches[0].clientY
                };
                break;
            case "scroll":
                var tagName = tagMap.get(originId).__nativeElement__.tagName.toLowerCase();
                assert(tagName === "scrollview" || tagName === "viewpager");
                data = {
                    scrollLeft: target.scrollLeft,
                    scrollTop: target.scrollTop,
                    scrollpercent: target.scrollTop / target.scrollHeight //这里与native保持一致 TODO: native也支持水平的scrollPercent
                };
                break;
            case "change": //认为是input的change事件
                data = {
                    text: target.value
                };
                break;
        }

        gen(eventType, data, originId);
    }

    exports.genFromWebEvent = genFromWebEvent;
    exports.gen = gen;
});
