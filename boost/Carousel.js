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
    var Carousel = derive(ViewPager, function () {
        ViewPager.call(this);
        this._sliderWidget = new SliderWidget({
            autoSwipe: false,
            continuousScroll: false,
            container: this
        });
    }, {
        __getRealTagName: function () {
            return "Carousel";
        },
        "set loop": function (value) {
            this.__update("loop", boolean(value));

            this._sliderWidget.options.continuousScroll = value;
            this._sliderWidget.options.autoSwipe = value;
        },
        "set duration": function (value) { //多久滚一次
            this.__update("duration", number(value));
        },
        "set speed": function (value) { //一次要多久
            this.__update("loopScrollDuration", number(value));
        },

        //__createWebElement: function (info) {
        //    return document.createElement("div");
        //},
        __addComposedChildAt: function (child, index) {
            var that = this;
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
            setTimeout(function () { //FIXME: 为了能内部元素的样式也复制上，这里加个延时
                that._sliderWidget._cloneIfNeed();
                that._sliderWidget._locateItem();
            }, 0);
        },
        __removeComposedChildAt: function (index) {
            var that = this;
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
            setTimeout(function () {
                that._sliderWidget._cloneIfNeed();
                that._sliderWidget._locateItem();
            }, 0);
        },
        //__showItemInWeb: function (index) {
        //    assert(index < this.__children__.length, "index of item to show could not exceed the amount of children");
        //    assert(nativeVersion.shouldUseWeb());
        //
        //    each(this.__children__, function (child, childIndex) {
        //        var childWebElement = child.__native__.__webElement__;
        //        childWebElement.style.display = childIndex === index ? "block" : "none";
        //    });
        //}
    });

    //from https://github.com/Clouda-team/boostui/blob/master/widget/slider/slider.js
    function SliderWidget (options) {
        this.options = copyProperties({}, this.options, options);
        this._create();
        this._init();
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

            this.containerEl = options.container;
            this.$container =
                this.$ul = $(this.containerEl); //TODO
            var that = this;

            var whichEvent = ('orientationchange' in win) ? 'orientationchange' : 'resize';
            win.addEventListener(whichEvent, function () {
                that._liWidth = getSizeInWeb(that.containerEl).width;
                that._liHeight = getSizeInWeb(that.containerEl).height;
                that._spin();
            }, false);
        },
        /**
         * _init 初始化的时候调用
         * @private
         */
        _init: function () {
            var that = this;

            that._liWidth = getSizeInWeb(that.containerEl).width;
            that._liHeight = getSizeInWeb(that.containerEl).height;

            this.autoScroll = null;     // 自动播放interval对象
            this._index = 0;            // 当前幻灯片位置

            //that._fnAutoSwipe();
            this._initEvent();
        },
        /**
         * FIXME: call on append/remove child...
         * @private
         */
        _cloneIfNeed: function () {
            if (this._clonedFirstEl) {
                getWebEl(this.containerEl).removeChild(this._clonedFirstEl);
                this._clonedFirstEl = null;
            }
            if (this._clonedLastEl) {
                getWebEl(this.containerEl).removeChild(this._clonedLastEl);
                this._clonedLastEl = null;
            }
            if (!this.options.continuousScroll) {
                return;
            }
            var childLength = this.containerEl.childNodes.length;
            if (!childLength) {
                return;
            }

            var containerWebEl = getWebEl(this.containerEl);
            this._clonedFirstEl = getWebEl(this.containerEl.childNodes[0]).cloneNode(true);
            containerWebEl.appendChild(this._clonedFirstEl);
            this._clonedLastEl = getWebEl(this.containerEl.childNodes[childLength - 1]).cloneNode(true);
            containerWebEl.insertBefore(this._clonedLastEl, containerWebEl.childNodes[0]);

            var widthOrHeight = this.options.axisX ? this._liWidth : this._liHeight;
            this._fnTranslate($(this._clonedFirstEl), widthOrHeight * -1);
            this._fnTranslate($(this._clonedLastEl), widthOrHeight * this.containerEl.childNodes.length);
        },
        _locateItem: function () {
            var that = this;
            var opts = that.options;
            // 给初始图片定位
            for (var i = 0; i < this.containerEl.childNodes.length; ++i) {
                var child = this.containerEl.childNodes[i];
                that._fnTranslate($(child), (opts.axisX ? that._liWidth : that._liHeight) * i);
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
            getWebEl(that.containerEl).addEventListener(device.startEvt, function (evt) {
                if (evReady) {
                    that.startX = device.hasTouch ? evt.targetTouches[0].pageX : evt.pageX;
                    that.startY = device.hasTouch ? evt.targetTouches[0].pageY : evt.pageY;
                    //evt.preventDefault();

                    getWebEl(that.containerEl).addEventListener(device.moveEvt, moveHandler, false);
                    getWebEl(that.containerEl).addEventListener(device.endEvt, endHandler, false);

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

                that._transitionHandle($(getWebEl(that.containerEl)), 0);

                //横向滑动阻止默认事件

                if (Math.abs(that.moveY) > 20 && that.options.axisX) {
                    endHandler(evt);
                } else if (Math.abs(that.moveX) > 7 || !isPhone) {
                    evt.preventDefault();
                }

                if (that.options.axisX && Math.abs(that.moveX) > Math.abs(that.moveY)) {
                    that._fnTranslate($(getWebEl(that.containerEl)), -(that._liWidth * (parseInt(that._index, 10)) - that.moveX));
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
                    that._fnScroll(.3);
                    that._fnAutoSwipe();
                } else if (Math.abs(that.moveDistance) <= _touchDistance) {
                    that._fnScroll(.3);
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

                getWebEl(that.containerEl).removeEventListener(device.moveEvt, moveHandler, false);
                getWebEl(that.containerEl).removeEventListener(device.endEvt, endHandler, false);
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
        },
        /**
         * 上一屏滚动
         * @private
         */
        _fnMovePrev: function () {
            this._index--;
            this._fnMove();
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

            if (opts.continuousScroll) {
                if (that._index >= that.containerEl.childNodes.length) {
                    that._fnScroll(.3);
                    that._index = 0;
                    setTimeout(function () {
                        that._fnScroll(0);
                    }, 300);
                }
                else if (that._index < 0) {
                    that._fnScroll(.3);
                    that._index = that.containerEl.childNodes.length - 1;
                    setTimeout(function () {
                        that._fnScroll(0);
                    }, 300);
                }
                else {
                    that._fnScroll(.3);
                }
            }
            else {
                if (that._index >= that.containerEl.childNodes.length) {
                    that._index = 0;
                }
                else if (that._index < 0) {
                    that._index = that.containerEl.childNodes.length - 1;
                }
                that._fnScroll(.3);
            }

            that._setDotActive();

            // callback(_index);
        },
        /**
         * 滑动
         * @private
         * @param  {number} num num
         */
        _fnScroll: function (num) {
            var $ul = this.$ul;
            var _index = this._index;
            var _liWidth = this._liWidth;
            var _liHeight = this._liHeight;
            var opts = this.options;

            this._transitionHandle($ul, num);
            if (opts.axisX) {
                this._fnTranslate($ul, -_index * _liWidth);
            }
            else {
                this._fnTranslate($ul, -_index * _liHeight);
            }
        },
        /**
         * 设置圆点的状态
         * @private
         */
        _setDotActive: function () {
            this.$controlOl.find('li a').removeClass(NAMESPACE + 'slider-active');
            this.$controlOl.find('li').eq(this._index).find('a').addClass(NAMESPACE + 'slider-active');
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
            var $ul = this.$ul;
            var $li = this.$li;
            var options = this.options;

            this.paused();
            var widthOrHeight = options.axisX ? this._liWidth : this._liHeight;
            this._fnTranslate($ul.children().first(), widthOrHeight * -1);
            this._fnTranslate($ul.children().last(), widthOrHeight * that.containerEl.childNodes.length);

            // 给初始图片定位
            $li.each(function (i) {
                that._fnTranslate($(this), (options.axisX ? that._liWidth : that._liHeight) * i);
            });
            this.start();
            this.next();
        },
        /**
         * 下一张幻灯片
         * @return {Object} 当前Zepto对象
         */
        next: function () {
            this._fnMoveNext();
            return this.$container;
        },
        /**
         * 上一张幻灯片
         * @return {Object} 当前Zepto对象
         */
        prev: function () {
            this._fnMovePrev();
            return this.$container;
        },
        /**
         * 暂停
         * @return {Object} 当前Zepto对象
         */
        paused: function () {
            clearInterval(this.autoScroll);
            return this.$container;
        },
        start: function () {
            clearInterval(this.autoScroll);
            this._fnAutoSwipe();
            return this.$container;
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
