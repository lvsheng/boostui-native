define(function (require, exports, module) {
    var tagMap = require("boost/tagMap");
    var assert = require("base/assert");
    var BOOST_EVENT_TYPE = "boost";

    module.exports = function generateBoostEventFromWeb(e) {
        //console.log("generateBoostEventFromWeb", e);
        var target = e.target;
        //touchend时e.target仍为touchstart的元素，故单独查找
        if (e.type === "touchend") {
            target = document.elementFromPoint(
                e.changedTouches[0].pageX,
                e.changedTouches[0].pageY
            );
        }

        var originId = target.__boost_origin__;
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
                var tagName = tagMap.get(event.origin).__nativeElement__.tagName.toLowerCase();
                assert(tagName === "scrollview" || tagName === "viewpager");
                event.data = {
                    scrollLeft: this.scrollLeft,
                    scrollTop: this.scrollTop
                };
                break;
        }

        console.log("generateBoostEventFromWeb, gen:", event);
        document.dispatchEvent(event);
    };
});