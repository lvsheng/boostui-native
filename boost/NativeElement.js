define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/NativeObject");
    var TouchEvent = require("boost/TouchEvent");
    var Element = require("boost/Element");

    var nativeGlobal = NativeObject.global;

    //var ROOT_ELEMENT_OBJ_ID = "tag_nativeview";
    var ROOT_ELEMENT_OBJ_ID = 0;
    var ROOT_ELEMENT_TYPE_ID = 0;

    var _super = Element.prototype;
    var NativeElement = derive(Element, function (type, tagName) {
        //this._super(tagName);
        Element.call(this, tagName);
        this.__type__ = type;
        this.__native__ = null;
        this.__config__ = this.__getDefaultConfig();
        this.__createView(this.__type__);
    }, {
        "get nativeObject": function () {
            return this.__native__;
        },
        "get tag": function () {
            return this.__native__.tag;
        },
        __createView: function (type) {
            var self = this;
            var nativeObj = self.__native__ = new NativeObject(type);
            nativeObj.__onEvent = function (type, e) {
                self.__onEvent(type, e);
            };
        },
        __onEvent: function (type, e) {
            //console.log("tag:" + this.__native__.tag, "type:" + this.__type__, "event:" + type);
            var event;
            switch (type) {
            case "touchstart":
            case "touchend":
                event = new TouchEvent(this, type, e.x, e.y);
                this.dispatchEvent(event);
                break;
            default:
                console.log("unknow event:" + type, e);
            }
        },
        __getDefaultConfig: function () {
            // TODO more
            return {};
            //return this.style.__getProps();
        },
        __addComposedChildAt: function (child, index) {
            assert(child instanceof NativeElement, "child must be a NativeElement");
            //var ret = this._super(child, index);
            var ret = _super.__addComposedChildAt.call(this, child, index);
            //这个地方一定要在 _super 调用之后,因为在之前有可能添加和删除的顺序会错
            this.__native__.addView(child, index);
            return ret;
        },
        __removeComposedChildAt: function (index) {
            //var ret = this._super(index);
            var ret = _super.__removeComposedChildAt.call(this, index);
            //这个地方一定要在 _super 调用之后,因为在之前有可能添加和删除的顺序会错
            this.__native__.removeViewAt(index);
            return ret;
        },
        __update: function (key, value) {
            var config = this.__config__;
            var oldValue = config[key];
            if (value !== oldValue) {
                config[key] = value;
                this.__native__.updateView(key, value);
            }
        },
        //__styleChange
        __styleChange: function (key, value, origValue) {
            this.__update(key, value);
            //return this._super(key, value, origValue);
            return _super.__styleChange.call(this, key, value, origValue);
        }
    });

    var NativeRootElement = derive(NativeElement, function () {
        //this._super(null, "NATIVE_ROOT");
        NativeElement.call(this, null, "NATIVE_ROOT");
    }, {
        __createView: function () {
            this.__native__ = new NativeObject(ROOT_ELEMENT_TYPE_ID, ROOT_ELEMENT_OBJ_ID);
        }
    });

    NativeElement.__rootElement = new NativeRootElement();

    module.exports = NativeElement;
});
