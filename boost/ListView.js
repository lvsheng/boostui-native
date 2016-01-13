define(function (require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var type = require("base/type");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var xml = require("boost/xml");
    var bridge = require("boost/bridge");
    var Linkage = require("boost/nativeObject/Linkage");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    //TODO: 与ScrollView抽离公共基类？
    var ListView = derive(NativeElement, function () {
        NativeElement.call(this, TYPE_ID.LIST_VIEW, "ListView");
        this.__dataStructureDesc = null;
        this.__template = null;
    }, {
        /**
         * @param xmlStr {string}
         * @param dataStructureDesc {Object<string, [string, string]>}
         *  key为后续要传入的dataItem的属性路径（如"desc.value"）
         *  value[0]为选择器，需保证只能选择到一个元素，如".desc text"
         *  value[1]为要操作元素的属性，如"value"
         *  例：
         *    {
         *      "desc.value": [".desc text", "value"],
         *      "desc.color": [".desc text", "style.color"]
         *    }
         *    表示每一个dataItem的dataItem.desc.value将被设置到".desc text"选中的元素的value属性上
         *    每一个dataItem的dataItem.desc.color将被设置到".desc text"选中的元素的style的color上
         */
        setTemplate: function (xmlStr, dataStructureDesc) {
            assert(!this.__dataStructureDesc, "setTemplate不能重复调用");
            bridge.interceptCommands([]);
            this.__template = xml.parse(xmlStr);
            var commands = bridge.finishIntercept();
            this.nativeObject.__callNative("setTemplate", [commands]);
            this.__dataStructureDesc = dataStructureDesc;
        },
        setData: function (dataList) {
            assert(!!this.__dataStructureDesc, "请在操作数据前先setTemplate传入模板与数据结构描述");
            this.nativeObject.__callNative("setData", [this.__dataListToCommandsList(dataList)]);
        },
        appendData: function (dataList) {
            assert(!!this.__dataStructureDesc, "请在操作数据前先setTemplate传入模板与数据结构描述");
            this.nativeObject.__callNative("appendData", [this.__dataListToCommandsList(dataList)]);
        },
        removeData: function (index) {
            assert(!!this.__dataStructureDesc, "请在操作数据前先setTemplate传入模板与数据结构描述");
            this.nativeObject.__callNative("removeData", [index]);
        },
        replaceData: function (index, newDataItem) {
            assert(!!this.__dataStructureDesc, "请在操作数据前先setTemplate传入模板与数据结构描述");
            this.nativeObject.__callNative("replaceData", [index, this.__dataToCommand(newDataItem)]);
        },

        __dataListToCommandsList: function (dataList) {
            var self = this;
            var commandsList = [];
            assert(type(dataList) === "array", "dataList should be array");
            each(dataList, function (dataItem) {
                commandsList.push(self.__dataToCommand(dataItem));
            });
            return commandsList;
        },
        __dataToCommand: function (dataItem) {
            var self = this;
            bridge.interceptCommands([]);
            each(self.__dataStructureDesc, function (arr, propPath) {
                var value = getProp(dataItem, propPath);
                var els = self.__template.querySelectorAll(arr[0]);
                assert(els.length <= 1, "选择器必需指定唯一元素，请检查选择器：" + arr[0]);
                var el = els[0];
                assert(!!el, "选择器" + arr[0] + "并未选中任何元素");
                setProp(el, arr[1], value);
            });
            return bridge.finishIntercept();
        },

        //FIXME: 验证click事件的触发时机、click事件中也将position考虑并附带
        __onEvent: function (type, e) {
            switch (type) {
                case "scroll":
                    //FIXME: native support
                    var event = new Event(this, "scroll");
                    event.stopPropagation();
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },

        __getStyle: function () {
            return new ViewStyle();
        },

        scrollTo: function (location) {
            this.nativeObject.__callNative("scrollTo", [location]); //FIXME: native support
        },

        setLinkage: function (linkage) {
            assert(linkage instanceof Linkage);
            this.nativeObject.__callNative("setLinkage", [linkage.tag]); //FIXME: native support
        },

        /**
         * @overwrite
         */
        __addChildAt: function () {
            assert(false, "ListView 不支持添加子元素、请使用setTemplate与setData方法");
        }
    });

    function getProp (obj, path) {
        var keys = path.split(".").reverse();
        var curData = obj;
        var curKey;
        while (curKey = keys.pop()) {
            if (!curData) {
                return undefined;
            }
            curData = curData[curKey];
        }
        return curData;
    }
    function setProp (obj, path, value) {
        assert(!!path);
        var keys = path.split(".").reverse();
        var curKey;
        var parentData;
        var keyInParentData;
        var curData = obj;
        while (true) {
            curKey = keys.pop();
            assert(["undefined", "object", "array"].indexOf(type(curData)) > -1, "can't get " + curKey + " from the " + type(curData) + " type");
            if (!curData) {
                curData = parentData[keyInParentData] = {};
            }
            parentData = curData;
            keyInParentData = curKey;

            if (keys.length === 0) {
                parentData[keyInParentData] = value;
                return;
            }

            curData = parentData[keyInParentData];
        }
    }
    module.exports = ListView;
});
