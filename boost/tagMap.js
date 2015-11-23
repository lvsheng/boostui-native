define(function (require, exports, module) {
    "use strict";

    var hasOwnProperty = require("base/hasOwnProperty");
    var assert = require("base/assert");

    var tagMap = {};
    var TAG_ID_START = 1;
    var tagId = TAG_ID_START; // tag id 从1开始,防止可能的冲突
    var idPostfix = 10;

    function get(tag) {
        if (hasOwnProperty(tagMap, tag)) {
            return tagMap[tag];
        }
        return null;
    }

    function set(tag, obj) {
        tagMap[tag] = obj;
    }

    function remove(tag) {
        if (get(tag) !== null) {
            tagMap[tag] = null;
        }
        delete tagMap[tag];
    }

    function genTag() {
        //return "$__tag_" + tagId++ + "__$";
        //return "_" + tagId++;
        return ((tagId++) << 4) + idPostfix;
    }

    module.exports = {
        get: get,
        set: set,
        remove: remove,
        genTag: genTag,
        /**
         * @param mask {int}
         *  目前clouda貌似使用了1、2
         *  boost默认使用10
         *  服务导航约定使用11
         */
        setIdMask: function (mask) {
            assert(
                tagId === TAG_ID_START,
                "Please set mask before any object created"
            );
            idPostfix = mask;
        }
    };
});
