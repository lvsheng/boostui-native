define(function (require, exports, module) {
    "use strict";

    var $ = require("boost/$");
    var derive = require("base/derive");
    var each = require("base/each");
    var assert = require("base/assert");
    var copyProperties = require("base/copyProperties");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var boolean = require("boost/validator").boolean;
    var number = require("boost/validator").number;
    var Linkage = require("boost/nativeObject/Linkage");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");
    var boostEventGenerator = require("boost/boostEventGenerator");

    var ViewPager = require("boost/ViewPager");
    /**
     * 轮播组件(可用于实现如轮播图效果)
     */
    var Carousel = derive(ViewPager, function () {
        ViewPager.call(this);

        if (nativeVersion.shouldUseWeb()) {
            var that = this;

            var container = that; //整体容器，尺寸由外界控制
            container.style.alignItems = "flex-start"; //而非默认的stretch以免影响itemsContainer的宽度（而希望由其内容自己撑起来）
            var shadowRoot = container.attachShadow();
            //用shadow-dom创建一个列表项容器供轮播时的移动，同时其不必暴露给外界。外界向carousel添加的子元素最终通过shadow-dom添加入列表项容器
            var itemsContainer = boost.createElement("view");
            itemsContainer.style.flexDirection = "row";
            shadowRoot.appendChild(itemsContainer);
            var itemsSlot = boost.createElement("slot"); //目前只此一个插入点，故不具名、作为默认slot即可
            itemsContainer.appendChild(itemsSlot);

            that._sliderWidget = new SliderWidget({
                autoSwipe: false,
                continuousScroll: false,
                container: container, //取宽高、绑事件、取子元素
                itemsContainer: itemsContainer //移动
            }, function (index) {
                boostEventGenerator.gen("selected", {position: index}, that.tag);
            }, function () {
                boostEventGenerator.gen("pagescroll", {}, that.tag);
            });
        }
    }, {
        __getRealTagName: function () {
            return "Carousel";
        },
        "set loop": function (value) {
            this.__update("loop", boolean(value));

            if (nativeVersion.shouldUseWeb()) {
                this._sliderWidget.options.continuousScroll = value;
                this._sliderWidget.options.autoSwipe = value;
            }
        },
        "set duration": function (value) { //多久滚一次
            this.__update("duration", number(value));

            if (nativeVersion.shouldUseWeb()) {
                this._sliderWidget.options.speed = value;
                this._sliderWidget._fnAutoSwipe();
            }
        },
        "set speed": function (value) { //一次要多久
            this.__update("loopScrollDuration", number(value));

            //FIXME: web下不能控制
        },

        __createWebElement: function (info) {
            return document.createElement("div");
        },
        __addComposedChildAt: function (child, index) {
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
            var that = this;
            this.__requestUpdateSliderWidget();
        },
        __removeComposedChildAt: function (index) {
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
            this.__requestUpdateSliderWidget();
        },
        __requestUpdateSliderWidget: function () {
            if (!nativeVersion.shouldUseWeb()) {
                return;
            }
            if (this._updateSliderWidgetTimer) {
                return;
            }
            var that = this;
            that._updateSliderWidgetTimer = setTimeout(function () { //FIXME: 为了能内部元素的样式也复制上，这里加个延时、顺便批量只做一次
                that._sliderWidget._cloneIfNeed();
                that._sliderWidget._locateItem();

                that._updateSliderWidgetTimer = null;
            }, 0);
        }
        //__showItemInWeb: function (index) { TODO: 增加外界可控制的此接口
        //    assert(index < this.__children__.length, "index of item to show could not exceed the amount of children");
        //    assert(nativeVersion.shouldUseWeb());
        //
        //    each(this.__children__, function (child, childIndex) {
        //        var childWebElement = child.__native__.__webElement__;
        //        childWebElement.style.display = childIndex === index ? "block" : "none";
        //    });
        //}
    });

    //修改自 https://github.com/Clouda-team/boostui/blob/master/widget/slider/slider.js
    function SliderWidget (options, selectCallback, scrollCallback) {
        this.options = copyProperties({}, this.options, options);
        this._create();
        this._init();

        this._selectCallback = selectCallback;
        this._scrollCallback = scrollCallback;
    }
    SliderWidget.prototype = {
        /**
         * 组件的默认选项，可以由多重覆盖关系
         */
        options: {
            autoSwipe: true,            // 自动滚动,默认开启
            continuousScroll: true,     // 连续滚动
            axisX: true,                // 滚动方向,默认x轴滚动
            transitionType: 'ease',     // 过渡类型
            // duration: 0.6,
            speed: 2000,                // 切换的时间间隔
            // needDirection: false,    // 是否需要左右切换的按钮
            ratio: 'normal',    // normal/wide/square/small
            wrapWidth: document.body && document.body.clientWidth,
            bgImg: false        // 是否加默认背景图，默认不加
        },
        /**
         * 创建组件调用一次
         * @private
         */
        _create: function () {
            var win = window;
            var options = this.options;

            this.container = options.container;
            this.itemsContainer = options.itemsContainer;
            var that = this;

            var whichEvent = ('orientationchange' in win) ? 'orientationchange' : 'resize';
            win.addEventListener(whichEvent, function () {
                that._spin();
            }, false);
        },
        _getWidth: function () {
            return getSizeInWeb(this.container).width;
        },
        _getHeight: function () {
            return getSizeInWeb(this.container).height;
        },
        /**
         * _init 初始化的时候调用
         * @private
         */
        _init: function () {
            this.autoScroll = null;     // 自动播放interval对象
            this._index = 0;            // 当前幻灯片位置

            this._fnAutoSwipe();
            this._initEvent();
            var that = this;
            setTimeout(function () {
                that._fnScroll(0);
            }, 0);
        },
        _cloneIfNeed: function () {
            var container = this.container;
            if (this._clonedFirstEl) {
                container.removeChild(this._clonedFirstEl);
                this._clonedFirstEl = null;
            }
            if (this._clonedLastEl) {
                container.removeChild(this._clonedLastEl);
                this._clonedLastEl = null;
            }
            if (!this.options.continuousScroll) {
                return;
            }
            var childLength = container.childNodes.length;
            if (!childLength) {
                return;
            }

            this._clonedFirstEl = this.container.childNodes[0].cloneNode(true);
            container.appendChild(this._clonedFirstEl);
            this._clonedLastEl = this.container.childNodes[childLength - 1].cloneNode(true);
            container.insertBefore(this._clonedLastEl, container.childNodes[0]);
        },
        _locateItem: function () {
            var that = this;
            var opts = that.options;
            var container = this.container;
            // 给初始图片定位
            //for (var i = 0; i < this.container.childNodes.length; ++i) {
            for (var i = 0; i < container.childNodes.length; ++i) {
                var child = container.childNodes[i];
                //that._fnTranslate($(child), (opts.axisX ? that._getWidth() : that._getHeight()) * i);
                child.style.width = that._getWidth() + "px";
                child.style.height = that._getHeight() + "px";
            }
        },

        /**
         * 初始化事件绑定
         * @private
         */
        _initEvent: function () {
            var that = this;
            var device = this._device();
            var evReady = true;
            var isPhone = (/AppleWebKit.*Mobile/i.test(navigator.userAgent) || /MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent));
            // 绑定触摸
            getWebEl(that.container).addEventListener(device.startEvt, function (evt) {
                if (evReady) {
                    that.startX = device.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
                    that.startY = device.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;
                    //evt.preventDefault();

                    getWebEl(that.container).addEventListener(device.moveEvt, moveHandler, false);
                    getWebEl(that.container).addEventListener(device.endEvt, endHandler, false);

                    evReady = false;
                }
            }, false);

            function moveHandler(evt) {
                //$("#prevent").html("");
                if (that.options.autoSwipe) {
                    clearInterval(that.autoScroll);
                }

                that.curX = device.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
                that.curY = device.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;

                that.moveX = that.curX - that.startX;
                that.moveY = that.curY - that.startY;

                that._transitionHandle($(getWebEl(that.itemsContainer)), 0);

                //横向滑动阻止默认事件

                if (Math.abs(that.moveY) > 20 && that.options.axisX) {
                    endHandler(evt);
                } else if (Math.abs(that.moveX) > 7 || !isPhone) {
                    evt.preventDefault();
                }

                if (that.options.axisX && Math.abs(that.moveX) > Math.abs(that.moveY)) {
                    var _index = that._index;
                    that._fnTranslate($(getWebEl(that.itemsContainer)), -(that._getWidth() * (parseInt(_index, 10)) - that.moveX) - that._getWidth());

                    that._scrollCallback();
                }
            }

            function endHandler(evt) {
                var opts = that.options;
                var _touchDistance = 50;

                if (opts.axisX) {
                    that.moveDistance = that.moveX;
                }
                else {
                    that.moveDistance = that.moveY;
                }

                // 距离小
                if (opts.axisX && Math.abs(that.moveY) > Math.abs(that.moveX)) {
                    that._fnScroll(.3, true);
                    that._fnAutoSwipe();
                } else if (Math.abs(that.moveDistance) <= _touchDistance) {
                    that._fnScroll(.3, true);
                } else {
                    // 距离大
                    // 手指触摸上一屏滚动
                    if (that.moveDistance > _touchDistance) {
                        that._fnMovePrev();
                        // 手指触摸下一屏滚动
                    }
                    else if (that.moveDistance < -_touchDistance) {
                        that._fnMoveNext();
                    }
                    that._fnAutoSwipe();
                }


                that.moveX = 0;
                that.moveY = 0;
                evReady = true;

                getWebEl(that.container).removeEventListener(device.moveEvt, moveHandler, false);
                getWebEl(that.container).removeEventListener(device.endEvt, endHandler, false);
                if (!isPhone) {
                    evt.preventDefault();
                    return false;
                }
            }
        },
        /*
         * css 过渡
         * @private
         * @param {Object} dom  zepto object
         * @param {number} num - transition number
         */
        _transitionHandle: function (dom, num) {
            var opts = this.options;
            dom.css({
                '-webkit-transition': 'all ' + num + 's ' + opts.transitionType,
                'transition': 'all ' + num + 's ' + opts.transitionType
            });
        },
        /**
         * css 滚动
         * @private
         * @param  {Object} dom    zepto object
         * @param  {number} result translate number
         */
        _fnTranslate: function (dom, result) {
            var opts = this.options;

            if (opts.axisX) {
                dom.css({
                    '-webkit-transform': 'translate3d(' + result + 'px,0,0)',
                    'transform': 'translate3d(' + result + 'px,0,0)'
                });
            }
            else {
                dom.css({
                    '-webkit-transform': 'translate3d(0,' + result + 'px,0)',
                    'transform': 'translate3d(0,' + result + 'px,0)'
                });
            }
        },
        /**
         * 下一屏滚动
         * @private
         */
        _fnMoveNext: function () {
            this._index++;
            this._fnMove();
            this._selectCallback(this._index);
        },
        /**
         * 上一屏滚动
         * @private
         */
        _fnMovePrev: function () {
            this._index--;
            this._fnMove();
            this._selectCallback(this._index);
        },
        /**
         * 自动滑动
         * @private
         */
        _fnAutoSwipe: function () {
            var that = this;
            var opts = this.options;
            clearInterval(this.autoScroll);

            if (opts.autoSwipe) {
                this.autoScroll = setInterval(function () {
                    that._fnMoveNext();
                }, opts.speed);
            }
        },
        /**
         * [_fnMove description]
         * @private
         */
        _fnMove: function () {
            var that = this;
            var opts = this.options;
            var itemAmount = that.container.childNodes.length;
            if (this._clonedFirstEl) {
                --itemAmount;
            }
            if (this._clonedLastEl) {
                --itemAmount;
            }

            if (opts.continuousScroll) {
                if (that._index >= itemAmount) {
                    that._fnScroll(.3);
                    that._index = 0;
                    setTimeout(function () {
                        that._fnScroll(0);
                    }, 300);
                }
                else if (that._index < 0) {
                    that._fnScroll(.3);
                    that._index = itemAmount - 1;
                    setTimeout(function () {
                        that._fnScroll(0);
                    }, 300);
                }
                else {
                    that._fnScroll(.3);
                }
            }
            else {
                if (that._index >= itemAmount) {
                    that._index = 0;
                }
                else if (that._index < 0) {
                    that._index = itemAmount - 1;
                }
                that._fnScroll(.3);
            }

            // callback(_index);
        },
        /**
         * 滑动
         * @private
         * @param  {number} num num
         */
        _fnScroll: function (num, noScrollCallback) {
            var that = this;
            var _index = this._index;
            var opts = this.options;

            this._transitionHandle($(getWebEl(this.itemsContainer)), num);

            var singleSize = opts.axisX ? this._getWidth() : this._getHeight();
            var size = singleSize * -_index - singleSize;

            this._fnTranslate($(getWebEl(this.itemsContainer)), size);

            if (num > 0 && !noScrollCallback) {
                var start = +new Date();
                var timer = setInterval(function () {
                    var now = +new Date();
                    if ((now - start) / 1000 > num) {
                        clearInterval(timer);
                        return;
                    }
                    that._scrollCallback();
                }, 20);
            }
        },
        /**
         * judge the device
         * @private
         * @return {Object} 事件
         */
        _device: function () {
            var hasTouch = !!('ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
            var startEvt = hasTouch ? 'touchstart' : 'mousedown';
            var moveEvt = hasTouch ? 'touchmove' : 'mousemove';
            var endEvt = hasTouch ? 'touchend' : 'mouseup';
            return {
                hasTouch: hasTouch,
                startEvt: startEvt,
                moveEvt: moveEvt,
                endEvt: endEvt
            };
        },
        /**
         * 屏幕旋转后的处理函数
         */
        _spin: function () {
            var that = this;
            var webEl = getWebEl(this.container);
            var firstEl = webEl.childNodes[0];
            var lastEl = webEl.childNodes[webEl.childNodes.length - 1];
            //var $li = this.$li;
            var options = this.options;

            this.paused();
            var widthOrHeight = options.axisX ? this._getWidth() : this._getHeight();
            this._fnTranslate($(firstEl), widthOrHeight * -1);
            this._fnTranslate($(lastEl), widthOrHeight * that.container.childNodes.length);

            // 给初始图片定位
            //$li.each(function (i) {
            //    that._fnTranslate($(this), (options.axisX ? that._getWidth() : that._getHeight()) * i);
            //});
            this._locateItem();
            this.start();
            this.next();
        },
        /**
         * 下一张幻灯片
         * @return {Object} 当前Zepto对象
         */
        next: function () {
            this._fnMoveNext();
        },
        /**
         * 上一张幻灯片
         * @return {Object} 当前Zepto对象
         */
        prev: function () {
            this._fnMovePrev();
        },
        /**
         * 暂停
         * @return {Object} 当前Zepto对象
         */
        paused: function () {
            clearInterval(this.autoScroll);
        },
        start: function () {
            clearInterval(this.autoScroll);
            this._fnAutoSwipe();
        }
    };

    function getWebEl (boostEl) {
        return boostEl.__native__.__webElement__;
    }

    function getSizeInWeb (boostEl) {
        return getWebEl(boostEl).getBoundingClientRect();
    }

    module.exports = Carousel;
});
