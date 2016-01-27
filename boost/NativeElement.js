define(function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var ElementNativeObject = require("boost/nativeObject/Element");
    var Event = require("boost/Event");
    var TouchEvent = require("boost/TouchEvent");
    var Element = require("boost/Element");
    var fontSetter = require("boost/fontSetter");
    var bridge = require("boost/bridge");
    var nativeVersion = require("boost/nativeVersion");

    var _super = Element.prototype;
    var NativeElement = derive(Element,
        /**
         * @param type
         * @param tagName
         * @param [id]
         */
        function(type, tagName, id) {
            //this._super(tagName);
            Element.call(this, tagName);
            this.__type__ = type;
            this.__native__ = null;
            this.__config__ = this.__getDefaultConfig();
            this.__createView(this.__type__, id);

            //scroll后一断时间内的touchstart、click、touchend都吞掉。scroll之后任意长时间的第一次没有touchstart的touchend也吞掉
            var UN_CLICKABLE_TIME = 10;
            var lastScrollTime;
            var fingerStillOnScreenForScroll = false;
            this.addEventListener("scroll", recordScroll);
            this.addEventListener("pagescroll", recordScroll);
            this.addEventListener("touchstart", function (e) {
                stopEventIfNeed.call(this, e);

                //手指再次放上屏幕，说明上次scroll之后到此次再放上的中间，用户手指已经抬起过了。清除此状态
                fingerStillOnScreenForScroll = false;
            }, true);
            this.addEventListener("touchend", function (e) {
                stopEventIfNeed.call(this, e);

                if (fingerStillOnScreenForScroll) {
                    e.stopPropagation();
                    fingerStillOnScreenForScroll = false;
                }
            }, true);
            this.addEventListener("click", stopEventIfNeed, true);
            function recordScroll (e) {
                lastScrollTime = e.timeStamp;

                // 这里只要scroll了，就假设手指还在屏幕上。
                // 在用户松手后还在惯性滚动的情况、以及touchstart->touchend->scroll事件序列下(用户松手了才开始滚)，此变量不准，由下次touchstart中进行修正
                fingerStillOnScreenForScroll = true;
            }
            function stopEventIfNeed (e) {
                if (e.origin === this.tag) {
                    // 自己身上的不屏蔽
                    return;
                }
                if (!lastScrollTime) {
                    return;
                }
                if (e.timeStamp - lastScrollTime < UN_CLICKABLE_TIME) {
                    //debugger;
                    e.stopPropagation();
                    //console.error("因有scroll而截断的事件：", e);
                }
            }
        }, {
            __createWebElement: null,
            "get nativeObject": function() {
                return this.__native__;
            },
            "get tag": function() {
                return this.__native__.tag;
            },
            /**
             * 用户应通过style.tapHighlightColor来修改而非直接调用本方法
             * @param color
             * @private
             */
            __setSelectorBackgroundColor: function(color) {
                this.__native__.__callNative('setSelectorBackgroundColor', [color]);
            },
            destroy: function() {
                _super.destroy.call(this);
                this.__native__.destroy();
            },
            __createView: function(type, id) {
                var self = this;
                var nativeObj = self.__native__ = new ElementNativeObject(type, id, self, self.__createWebElement);
                nativeObj.__onEvent = function(type, e) {
                    return self.__onEvent(type, e);
                };
            },
            __onEvent: function(type, e) {
                //console.log("tag:" + this.__native__.tag, "type:" + this.__type__, "event:" + type);
                var event;
                switch (type) {
                    case "touchstart":
                    case "touchend": //FIXME: 注：与web不同：touchend时的target为touchend时手指所在的元素而非touchstart时的元素
                    case "click":
                        event = new TouchEvent(this, type, e.data.x, e.data.y);
                        this.dispatchEvent(event);
                        break;
                    case "dialogdismiss":
                        this.dispatchEvent(new Event(this, "dialogdismiss"));
                        break;
                    default:
                        console.log("unknow event:" + type, e);
                }
                return event && event.propagationStoped;
            },
            __getDefaultConfig: function() {
                // TODO more
                return {};
                //return this.style.__getProps();
            },
            __addComposedChildAt: function(child, index) {
                assert(child instanceof NativeElement, "child must be a NativeElement");
                //var ret = this._super(child, index);
                var ret = _super.__addComposedChildAt.call(this, child, index);
                //这个地方一定要在 _super 调用之后,因为在之前有可能添加和删除的顺序会错
                this.__native__.addView(child, index);
                return ret;
            },
            __removeComposedChildAt: function(index) {
                //var ret = this._super(index);
                var ret = _super.__removeComposedChildAt.call(this, index);
                //这个地方一定要在 _super 调用之后,因为在之前有可能添加和删除的顺序会错
                this.__native__.removeViewAt(index);
                return ret;
            },
            __update: function(key, value) {
                var config = this.__config__;
                var oldValue = config[key];
                if (value !== oldValue) {
                    config[key] = value;

                    if (key === "fontFamily") { //font需要先加载再应用，在此对其拦截做特殊处理
                        fontSetter.setFont(this.__native__, value);
                    } else if (key === "tapHighlightColor") {
                        this.__setSelectorBackgroundColor(value);
                        if (nativeVersion.shouldUseWeb()) {
                            this.__native__.__webElement__.style["-webkit-tap-highlight-color"] = value;
                        }
                    } else {
                        this.__native__.updateView(key, value);
                    }
                }
            },
            //__styleChange
            __styleChange: function(key, value, origValue) {
                this.__update(key, value);

                if (nativeVersion.shouldUseWeb()) {
                    this.__native__.__webElement__.style[key] = value;
                }

                //return this._super(key, value, origValue);
                return _super.__styleChange.call(this, key, value, origValue);
            }
        });

    module.exports = NativeElement;
});
