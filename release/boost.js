(function () {console.log("performance: ", "update atThu Feb 04 2016 10:27:29 GMT+0800 (CST)");(function defineTimeLogger(exports) {
    if (exports.timeLogger) {
        return;
    }
    var preFix = "performance: ";
    var pageStartTime = performance.timing.fetchStart;
    var lastTime = pageStartTime;
    var results = [];
    exports.timeLogger = function (key) {
        var curTime = +new Date;
        var timing = curTime - pageStartTime;
        var duration = curTime - lastTime;
        console.log(preFix, key, "[" + timing + "]: ", duration);
        results.push({
            key: key,
            timing: timing,
            duration: duration
        });
        //console.trace();
        lastTime = curTime;
    };
    exports.timeLoggerOverView = function () {
        results.sort(function (a, b) {
            return b.duration - a.duration;
        });
        console.log("\nperformance:\noverview:\n ", results.map(function (item) {
            return item.key + "[" + item.timing + "]: " + item.duration;
        }).join("\n  "));
    };
})(window);timeLogger("boost.js开始执行");console.log("first js statement");console.time("page");console.time("define.boost");var require, define;
(function () {
    var factoryMap = {};
    var moduleMap = {};
    var waitingModules = [];
    define = function (name, factory) {
        factoryMap[name] = factory;
    };
    require = function (names, callback) {
        var modules = [];
        names.forEach(function (name) {
            modules.push(innerRequire(name));
        });
        callback && callback.apply(window, modules);
    };

    function innerRequire(name) {
        initIfNeed(name);
        return moduleMap[name];
    }

    function initIfNeed(name) {
        if (moduleMap[name]) {
            return;
        }
        if (!factoryMap[name]) {
            throw "not existed module " + name;
        }

        var index = waitingModules.indexOf(name);
        waitingModules.push(name);
        if (index > -1) {
            throw "循环依赖咯:" + waitingModules.slice(index).join(" > ");
        }
        var module = {
            exports: {}
        };
        var returnValue = factoryMap[name](innerRequire, module.exports, module);
        if (returnValue !== undefined) {
            console.error("不支持return模块内容，请直接更改module.exports哦");
        }
        moduleMap[name] = module.exports;
        waitingModules.pop();
    }
})();
"use strict";
(function(window) {
    var INJECT_PREFIX = 'O2OZone#YIFMWBUIQ98S38FR:';
    var lc_bridge = window.lc_bridge = window.lc_bridge || {};
    var console = window.console;
    lc_bridge.callQueue = function(list) {
        send(list);
    };

    var queue = [];
    var isReady = false;
    var inAndroid = navigator.userAgent.indexOf("BaiduRuntimeO2OZone") > -1; //FIXME
    if (inAndroid) {
        isReady = true;
    } else {
        window.addEventListener("load", function () {
            setTimeout(function () {
                isReady = true;
                send();
            }, 1);
        });
    }

    function send (cmds) {
        if (cmds) {
            queue = queue.concat(cmds);
        }

        if (isReady) {
            console.log(INJECT_PREFIX + JSON.stringify(queue)); //for android
            window.sendIOSData && window.sendIOSData(JSON.stringify(queue)); //for ios
            queue = [];
        }
    }

    function sendIOSData (data) {
    }
})(window);
define("base/assert",function(require, exports, module) {
    "use strict";

    function assert(condition, msg) {
        if (condition !== true) {
            throw new Error(msg || "assert failed.");
        }
    }
    module.exports = assert;

});
define("base/camelToDash",function(require, exports, module) {
    /**
     * 驼峰/中划线命名转下划线命名
     * @param {string} string
     * @returns {string}
     */
    module.exports = function (string) {
        var result = string;
        result = result.replace(/([A-Z])/g, "-$1").toLowerCase();

        if (result.charAt(0) === "-") {
            return result.substring(1);
        } else {
            return result;
        }
    };
});
define("base/copyProperties",function(require, exports, module) {
    "use strict";

    /**
     * 复制属性到对象
     *
     * @param {Object} to 目标对象
     * @param {...Object} from 多个参数
     * @access public
     * @return {Object} 目标对象
     *
     * @example
     * var objA = {
     *         a : 1
     *     },
     *     objB = {
     *         b : 2
     *     };
     *
     * copyProperties(objA, objB, {
     *      c : 3
     * });
     * console.log(objA);
     * // {
     * // a : 1,
     * // b : 2,
     * // c : 3
     * // }
     */

    var hasOwnProperty = require("base/hasOwnProperty");

    function copyProperties(to /*, ...*/ ) {
        var index, count, item, key;

        to = to || {};
        count = arguments.length;

        //遍历参数列表
        for (index = 1; index < count; index++) {
            item = arguments[index];
            for (key in item) {
                //只复制自有属性
                if (hasOwnProperty(item, key)) {
                    to[key] = item[key];
                }
            }
        }

        return to;
    }

    module.exports = copyProperties;

});
define("base/derive",function(require, exports, module) {
    "use strict";

    /**
     * Js 派生实现
     *
     * @param {Function} parent 父类
     * @param {Function} [constructor]  子类构造函数
     * @param {Object} [proto] 子类原型
     * @access public
     * @return {Function} 新的类
     *
     * @example
     *
     * var ClassA = derive(Object, function(__super){
     *      console.log("I'm an instance of ClassA:", this instanceof ClassA);
     * });
     *
     * var ClassB = derive(ClassA, function(__super){
     *      console.log("I'm an instance of ClassB:", this instanceof ClassB);
     *      __super();
     * }, {
     *      test:function(){
     *          console.log("test method!");
     *      }
     * });
     *
     * var b = new ClassB();
     * //I'm an instance of ClassA: true
     * //I'm an instance of ClassA: true
     * b.test();
     * //test method!
     */

    var isFunction = require("base/isFunction");
    var copyProperties = require("base/copyProperties");
    var each = require("base/each");
    var hasOwnProperty = require("base/hasOwnProperty");
    var camelToDash = require("base/camelToDash");

    function bindSuper(fn, superFn) {
        //return fn;

        if (!isFunction(superFn)) {
            superFn = throwNoSuper;
        }

        return function () {
            var returnValue;
            var _super = this._super;
            this._super = superFn;
            //try {
            returnValue = fn.apply(this, arguments);
            //} finally {
            this._super = _super;
            //}
            return returnValue;
        };
    }

    function throwNoSuper() {
        throw new Error("this._super is not a function.");
    }

    function derive(parent, constructor, proto) {

        //如果没有传 constructor 参数
        if (typeof constructor === 'object') {
            proto = constructor;
            constructor = hasOwnProperty(proto, "constructor") ?
                proto.constructor :
                function () {
                    parent.apply(this, arguments);
                };
            delete proto.constructor;
        }

        var //tmp = function () {},
        //子类构造函数
        //subClass = bindSuper(constructor, parent),
            subClass = constructor,
            subClassPrototype,
            key, value,
            keyDash,
            parts, modifier, properties, property, propertyDash;

        //原型链桥接
        //tmp.prototype = parent.prototype;
        //subClassPrototype = new tmp();
        subClassPrototype = Object.create(parent.prototype);
        proto = proto || {};


        //复制属性到子类的原型链上
        //copyProperties(
        //    subClassPrototype,
        //    constructor.prototype
        //);
        //subClassPrototype.constructor = constructor.prototype.constructor;

        properties = {};
        each(proto, function (value, key) {
            parts = key.split(" ");
            if (parts.length === 1) {
                //if (isFunction(value)) {
                //subClassPrototype[key] = bindSuper(value, parent.prototype[key]);
                //} else {
                subClassPrototype[key] = value;
                //}
            } else {
                modifier = parts.shift();
                key = parts.join(" ");
                switch (modifier) {
                case "get":
                case "set":
                    property = properties[key] || {};
                    property[modifier] = value;
                    properties[key] = property;

                    //FIXME: 为了方便，这里除了生成原有设值取值方法，还生成一份中划线命名法的方法供标签属性上直接使用。具体原因如下：
                    // 从webView的template标签中取innerHTML再传入boost时，元素属性的驼峰消失、故需支持各属性中划线设置。
                    // 但有些属性如data-xx需要保留中划线，故不能在xml解析时转换。
                    // 而在每个"set xx"定义的地方写两份，又较啰嗦，故在此处处理
                    keyDash = camelToDash(key);
                    if (keyDash !== key) {
                        propertyDash = properties[keyDash] || {};
                        propertyDash[modifier] = value;
                        properties[keyDash] = propertyDash;
                    }
                    break;
                default:
                    //TODO
                }
            }
        });
        Object.defineProperties(subClassPrototype, properties);

        //each(properties, function (conf, name) {
        //    Object.defineProperty(subClassPrototype, name, conf);
        //});

        subClass.prototype = subClassPrototype;
        //subClassPrototype.constructor = subClass; //safari不允许赋值constructor，故去除
        return subClass;
    }

    module.exports = derive;
    //});

});
define("base/each",function(require, exports, module) {
    "use strict";
    /**
     * 遍历数组或对象
     *
     * @param {Object|Array} object 数组或对象
     * @param {Function} callback 回调函数
     * @param {Object} [thisObj=undefined] 回调函数的this对象
     * @access public
     * @return {Object|Array} 被遍历的对象
     *
     * @example
     *
     * var arr = [1, 2, 3, 4];
     * each(arr, function(item, index, arr){
     *  console.log(index + ":" + item);
     * });
     * // 0:1
     * // 1:2
     * // 2:3
     * // 3:4
     *
     * @example
     *
     * var arr = [1, 2, 3, 4];
     * each(arr, function(item, index, arr){
     *  console.log(index + ":" + item);
     *  if(item > 2){
     *      return false;
     *  }
     * });
     * // 0:1
     * // 1:2
     * // 2:3
     */

    var isFunction = require("base/isFunction");

    function each(object, callback, thisObj) {
        if (!object) {
            return;
        }
        var name, i = 0,
            length = object.length,
            isObj = length === undefined || isFunction(object);

        if (isObj) {
            for (name in object) {
                if (callback.call(thisObj, object[name], name, object) === false) {
                    break;
                }
            }
        } else {
            for (i = 0; i < length; i++) {
                if (callback.call(thisObj, object[i], i, object) === false) {
                    break;
                }
            }
        }
        return object;
    }
    module.exports = each;

});
define("base/hasOwnProperty",function(require, exports, module) {
    "use strict";

    /**
     * hasOwnProperty
     *
     * @param obj $obj
     * @param key $key
     * @access public
     * @return void
     */

    var native_hasOwnProperty = Object.prototype.hasOwnProperty;

    module.exports = function (obj, key) {
        return native_hasOwnProperty.call(obj, key);
    };

});
define("base/htmlEscape",function(require, exports, module) {
    module.exports = function htmlEscape(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    };
});
define("base/isFunction",function(require, exports, module) {
    "use strict";
    /**
     * isFunction 判断一个对象是否为一个函数
     *
     * @param {Object} obj 需要被鉴定的对象
     * @access public
     * @return {Boolean} 该对象是否为一个函数
     */
    var type = require("base/type");

    function isFunction(obj) {
        return type(obj) === 'function';
    }
    module.exports = isFunction;

});
define("base/isPlainObject",function(require, exports, module) {
    var type = require("base/type");

    function isWindow(obj) {
        return obj != null && obj == obj.window
    }
    function isObject(obj) {
        return type(obj) == "object";
    }

    function isPlainObject(obj) {
        return isObject(obj) && !isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
    }

    module.exports = isPlainObject;
});
define("base/log",function(require, exports, module) {
    var inDebug = localStorage.getItem("inDebug");

    ["log", "info", "error", "warn"].forEach(function (name) {
        exports[name] = function () {
            //if (!localStorage.getItem("inDebug")) {
            if (!inDebug) {
                return;
            }

            console[name].apply(console, arguments);
        };
    });
});

define("base/slice",function(require, exports, module) {
    "use strict";

    /**
     * slice 把数组中一部分的浅复制存入一个新的数组对象中，并返回这个新的数组。
     *
     * @param {Array} array 数组
     * @param {Number} start 开始索引
     * @param {Number} end 结束索引
     * @access public
     * @return {Array} 被截取后的数组
     */

    var _slice = Array.prototype.slice;

    function slice(array, start, end) {
        switch (arguments.length) {
        case 0:
            //TODO throw Error???
            return [];
        case 1:
            return _slice.call(array);
        case 2:
            return _slice.call(array, start);
            // case 3:
        default:
            return _slice.call(array, start, end);
        }
    }

    module.exports = slice;

});
define("base/toCamelCase",function(require, exports, module) {
    /**
     * @param str
     * @param [upperFirstChar=false] {boolean}
     * @returns {string}
     */
    module.exports = function toCamelCase(str, upperFirstChar) {
        var camel = str.replace(/-+(.)?/g, function (match, chr) {
            return chr ? chr.toUpperCase() : '';
        });
        return upperFirstChar ? camel[0].toUpperCase() + camel.slice(1) : camel;
    };
});
define("base/trim",function(require, exports, module) {
    "use strict";

    function trim(str) {
        return str == null ? "" : String.prototype.trim.call(str);
    }
    module.exports = trim;

});
define("base/type",function(require, exports, module) {
    "use strict";
    /**
     * type 判断对象类型函数
     * 从 jquery 中拷贝来的
     *
     * @param {Object} obj 被鉴定的对象
     * @access public
     * @return {String} 对象类型字符串
     */
    var types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object"],
        toString = Object.prototype.toString,
        class2type = {},
        count, name;

    //构造 class2type 表
    //{
    //  "[object Object]"   : "object",
    //  "[object RegExp]"   : "regexp",
    //  "[object Date]"     : "date",
    //  "[object Array]"    : "array",
    //  "[object Function]" : "function",
    //  "[object String]"   : "string",
    //  "[object Number]"   : "number",
    //  "[object Boolean]"  : "boolean"
    //}
    count = types.length;
    while (count--) {
        name = types[count];
        class2type["[object " + name + "]"] = name.toLowerCase();
    }

    function type(obj) {
        return obj == null ?
            String(obj) :
            class2type[toString.call(obj)] || "object";
    }

    module.exports = type;

});
//FIXME: 将$.js作为单独文件暴露
define("boost/$",function(require, exports, module) {
    "use strict";

    var type = require("base/type");
    var trim = require("base/trim");
    var assert = require("base/assert");
    var each = require("base/each");
    var derive = require("base/derive");
    var isFunction = require("base/isFunction");
    var boost = require("boost/boost");
    var copyProperties = require("base/copyProperties");
    var Event = require("boost/Event");
    var styleRender = require("boost/styleRender");
    var xml = require("boost/xml");

    var emptyArray = [],
        noop = function () {},
        slice = emptyArray.slice,
        concat = emptyArray.concat;


    function isObject(obj) {
        return type(obj) == "object";
    }

    function likeArray(obj) {
        return typeof obj.length == 'number';
    }

    function flatten(array) {
        return array.length > 0 ? concat.apply([], array) : array;
    }

    function walkTree (node, handler) {
        handler(node);
        if (!node.firstChild) { return; }
        for (var cur = node.firstChild; cur; cur = cur.nextSibling) {
            walkTree(cur, handler);
        }
    }

    function updateStyle (element) {
        walkTree(element, function (curElement) {
            var elementStyleRender = styleRender;

            elementStyleRender.clearStyle(curElement);
            elementStyleRender.apply(curElement);
        });
    }

    function isHtmlString (value) {
        return type(value) === "string" && value[0] === "<";
    }

    function $(selector, context) {
        var dom;
        if (!selector) {
            dom = [];
        } else if (typeof selector == 'string') {
            selector = trim(selector);
            if (isHtmlString(selector)) {
                //html
                return $(xml.parseNodes(selector));
            } else {
                //选择器
                context = context || boost;
                dom = context.querySelectorAll(selector);
            }
        } else if (selector instanceof $) {
            return selector;
        } else if (likeArray(selector)) {
            //dom = slice.call(selector);
            dom = selector;
        } else if (isObject(selector)) {
            dom = [selector];
        }
        dom.__proto__ = $.fn;
        return dom;
    }

    $.fn = $.prototype = {
        // Because a collection acts like an array
        // copy over these useful array functions.
        forEach: emptyArray.forEach,
        reduce: emptyArray.reduce,
        push: emptyArray.push,
        sort: emptyArray.sort,
        indexOf: emptyArray.indexOf,
        concat: emptyArray.concat,
        // `map` and `slice` in the jQuery API work differently
        // from their array counterparts
        map: function (fn) {
            return $($.map(this, function (el, i) {
                return fn.call(el, i, el);
            }));
        },
        slice: function () {
            return $(slice.apply(this, arguments));
        },
        get: function (idx) {
            return idx === undefined ? slice.call(this) : this[idx >= 0 ? idx : idx + this.length];
        },
        size: function () {
            return this.length;
        },
        remove: function () {
            return this.each(function () {
                if (this.parentNode != null)
                    this.parentNode.removeChild(this);
            });
        },
        each: function (callback) {
            emptyArray.every.call(this, function (el, idx) {
                return callback.call(el, idx, el) !== false;
            });
            return this;
        },
        eq: function (idx) {
            return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1);
        },
        find: function (selector) {
            var result;
            if (!selector) {
                result = $();
            } else if (this.length === 1) {
                result = $(this[0].querySelectorAll(selector));
            } else {
                result = this.map(function () {
                    return this.querySelectorAll(selector);
                });
            }
            return result;
        },
        empty: function () {
            return this.each(function () {
                var node = null;
                while ((node = this.firstChild) !== null) {
                    this.removeChild(node);
                }
            });
        },
        data: function (key, value) {
            var attrName = "data-" + key;
            return arguments.length > 1 ? this.attr(attrName, value) : this.attr(attrName);
        },
        attr: function (key, value) {
            if (arguments.length > 1) {
                this.each(function (idx, elem) {
                    elem.setAttribute(key, value);
                });
                return this;
            } else if (this.length > 0) {
                return this[0].getAttribute(key);
            } else {
                return null;
            }
        },

        /**
         * @param classStr {string} 可用空白分隔多个要添加的class
         */
        addClass: function (classStr) {
            var classesToAdd = classStr.split(/\s+/);
            return this.each(function (index, element) {
                var classList = element.classList;
                var addedClassList = classesToAdd.filter(function (item) { return classList.indexOf(item) === -1; });
                if (addedClassList.length === 0) {
                    return;
                }

                element.className = classList.concat(addedClassList).join(' ');
                updateStyle(element);
            });
        },

        /**
         * @param classStr {string} 可用空白分隔多个要添加的class
         */
        removeClass: function (classStr) {
            var classesToRemove = classStr.split(/\s+/);
            return this.each(function (index, element) {
                var classList = element.classList;
                var newClassList = classList.filter(function (item) { return classesToRemove.indexOf(item) === -1; });
                if (newClassList.length === classList.length) {
                    return;
                }

                element.className = newClassList.join(' ');
                updateStyle(element);
            });
        },

        hasClass: function (classStr) {
            var has = false;
            this.each(function (index, element) {
                if (element.classList.indexOf(classStr) !== -1) {
                    has = true;
                }
            });
            return has;
        },

        on: function (type, callback) {
            return this.each(function (idx, element) {
                element.addEventListener(type, callback, false);
            });
        },

        off: function (type, callback) {
            return this.each(function (idx, element) {
                element.removeEventListener(type, callback);
            });
        },

        trigger: function (type, data) {
            return this.each(function (idx, element) {
                var event = new Event(element, type);
                event.data = data;
                element.dispatchEvent(event);
            });
        },

        val: function (value) {
            if (arguments.length > 0) {
                return this.each(function (idx, element) {
                    element.value = value;
                });
            } else if (this.length > 0) {
                return this[0].value;
            } else {
                return null;
            }
        },

        css: function (key, value) {
            assert(arguments.length > 1 || type(key) === "object", "目前只支持 css(key, value)或css(map)");

            var map = {};
            if (arguments.length > 1) {
                map[key] = value;
            } else {
                assert(type(key) === "object");
                map = key;
            }

            return this.each(function (idx, element) {
                each(map, function (value, key) {
                    element.style[key] = value;
                });
            });
        },

        html: function (value) {
            if (arguments.length) {
                return this.each(function (idx, element) {
                    element.innerHTML = value;
                });
            } else {
                return this[0].innerHTML;
            }
        },

        focus: function () {
            return this.each(function (idx, element) {
                element.focus && element.focus();
            });
        },
        blur: function () {
            return this.each(function (idx, element) {
                element.blur && element.blur();
            });
        },

        append: function (content) {
            if (!this.size()) {
                return this;
            }
            if (isHtmlString(content)) {
                this.append($(content));
                return this;
            }

            var element = this.get(0);
            if (likeArray(content)) {
                each(content, function (item) {
                    element.appendChild(item);
                });
            } else {
                //TODO: assert(content is Element)
                element.appendChild(content);
            }

            return this;
        },

        appendTo: function (target) {
            $(target).append(this);
            return this;
        }
    };

    $.map = function (elements, callback) {
        var value, values = [],
            i, key;
        if (likeArray(elements))
            for (i = 0; i < elements.length; i++) {
                value = callback(elements[i], i);
                if (value != null) values.push(value);
            } else
                for (key in elements) {
                    value = callback(elements[key], key);
                    if (value != null) values.push(value);
                }
        return flatten(values);
    };

    $.proxy = function (func, context) {
        return function () {
            return func.apply(context, arguments);
        };
    };


    $.Widget = function (options, element) {
        this.element = element;
        this.$element = $(element);
        this.options = copyProperties({}, this.options, options);
        this._create();
        this._trigger('create');
        this._init();
    };
    $.Widget.prototype = {
        options: {},
        _create: noop,
        _init: noop,
        _trigger: function (type, data) {
            type = this.widgetName + ':' + type;
            data = data || {};
            this.$element.trigger(type, data);
        }
    };
    $.widget = function (name, proto) {
        var dataKey = "__widget_" + name + "__";
        proto = copyProperties({}, proto, {
            widgetName: name
        });
        var constructor = derive($.Widget, proto);

        $.fn[name] = function (options) {
            var isMethodCall = typeof options === 'string';
            var args = slice.call(arguments, 1);
            var returnValue = this;

            if (isMethodCall) {
                this.each(function () {
                    var $this = $(this);
                    var instance = $this.data(dataKey);
                    var methodValue;

                    if (!instance) {
                        throw new Error('cannot call methods on ' + name + ' prior to initialization; ' +
                            'attempted to call method "' + options + '"');
                    }
                    if (!isFunction(instance[options]) || options.charAt(0) === '_') {
                        throw new Error('no such method "' + options + '" for ' + name + ' widget instance');
                    }

                    methodValue = instance[options].apply(instance, args);
                    if (methodValue !== instance && methodValue !== undefined) {
                        returnValue = methodValue;
                        return false;
                    }
                });
            } else {
                this.each(function () {
                    var $this = $(this);
                    $this.data(dataKey, new constructor(options, this));
                    /*
                    var instance = $this.data(dataKey);
                    if (instance) {
                        // 已经初始化过
                        instance.option(options || {});
                        if (instance._init) {
                            instance._init();
                        }
                    } else {
                        $this.data(dataKey, new constructor(options, this));
                    }
                    */
                });
            }
            return returnValue;
        };
    };

    module.exports = $;
});
define("boost/Animation",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var NativeElement = require("boost/NativeElement");
    var AnimationEvent = require("boost/AnimationEvent");
    var AnimationCancelEvent = require("boost/AnimationCancelEvent");
    var copyProperties = require("base/copyProperties");

    var TYPE_ANIMATION = 11;
    /**
     * @param typeId {int}
     * @param config {Object}
     * @param config.element {NativeElement}
     * @param config.* {*} 其他子Animation的配置
     */
    var Animation = derive(EventTarget, function (typeId, config) {
        EventTarget.call(this);
        this.__native__ = null;
        this.__create(typeId, config);
    }, {
        __create: function (typeId, config) {
            var self = this;
            var nativeConfig = copyProperties({}, config);
            delete nativeConfig.element;
            if (config.element) {
                assert(!config.element || config.element instanceof NativeElement, "Animation must apply on NativeElement");
                nativeConfig.target = config.element.tag;
            }

            var nativeObj = this.__native__ = new NativeObject(typeId, undefined, nativeConfig);
            nativeObj.__onEvent = function (type, e) {
                return self.__onEvent(type, e);
            };
        },
        start: function () {
            this.__native__.__callNative("start", []);
        },
        cancel: function () {
            this.__native__.__callNative("cancel", []);
        },
        __onEvent: function (type, e) {
            var event;
            switch (type) {
            case "start":
            case "end":
                event = new AnimationEvent(this, type);
                this.dispatchEvent(event);
                break;
            case "cancel":
                var nowValue; //cancel时会将当前值传入
                for (var key in e.data) { //只会传入一个值（动画处理的属性的值） TODO: 放在ProPAnimation里处理更合适？
                    nowValue = e.data[key];
                }
                event = new AnimationCancelEvent(this, type, nowValue);
                this.dispatchEvent(event);
                break;
            default:
                console.log("unknow event:" + type, e);
            }
            return event && event.propagationStoped;
        }
    });

    module.exports = Animation;
});
define("boost/AnimationCancelEvent",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var AnimationEvent = require("boost/AnimationEvent");

    var AnimationCancelEvent = derive(Event, function (target, nowValue) {
        AnimationEvent.call(this, target, "cancel");
        this._nowValue = nowValue;
    }, {
        "get nowValue": function () {
            return this._nowValue;
        }
    });

    module.exports = AnimationCancelEvent;
});
define("boost/AnimationEvent",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");

    var AnimationEvent = derive(Event, function (target, type) {
        assert(type === "start" || type === "end" || type === "cancel", "unknow animation event type:\"" + type + "\"")
        Event.call(this, target, type);
    });

    module.exports = AnimationEvent;
});
define("boost/AnimationSet",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Animation= require("boost/Animation");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * @param config {Object}
     * @param config.type {string} "together"|"sequentially"
     * @param config.element {NativeElement}
     */
    var AnimationSet = derive(Animation, function (config) {
        this._index = -1;
        Animation.call(this, TYPE_ID.ANIMATION_SET, {
            type: config.type,
            element: config.element
        });
    },{
        add: function (animation) {
            this.__native__.__callNative("add", [animation.__native__.tag, ++this._index]);
        }
    });

    module.exports = AnimationSet;
});
define("boost/BoostPage",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ViewStyle = derive(StyleSheet, LayoutPropTypes);
    var BoostPage = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "BoostPage");
        NativeElement.call(this, TYPE_ID.BOOST_PAGE, "BoostPage");
    }, {
        __onEvent: function (type, event) {
            // 从前台页面传来的消息与页面刷新事件，抛出事件供背景页监听
            if (type === "message") {
                this.dispatchEvent({
                    type: "message",
                    data: event.data
                });
            } else if (type === "pagestarted") {
                this.dispatchEvent({
                    type: "pagestarted",
                    data: event.data
                });
            } else if (type === "resume") {
                this.dispatchEvent({
                    type: "resume",
                    data: event.data
                });
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            return new ViewStyle();
        },
        loadUrl: function (url) {
            this.nativeObject.__callNative("loadUrl", [url]);
        },
        reload: function () {
            this.nativeObject.__callNative("reload", []);
        },
        canGoBack: function (callback) {
            if (nativeVersion.inIOS()) {
                this.nativeObject.__callNative("canGoBack", [], callback);
            } else {
                this.nativeObject.__callNative("canGoBackOrForward", [-1], callback);
            }
        },
        canGoForward: function (callback) {
            if (nativeVersion.inIOS()) {
                this.nativeObject.__callNative("canGoForward", [], callback);
            } else {
                this.nativeObject.__callNative("canGoBackOrForward", [1], callback);
            }
        },
        goBack: function () {
            this.nativeObject.__callNative("goBack", []);
        },
        goForward: function () {
            this.nativeObject.__callNative("goForward", []);
        },
        /**
         * @param type
         * @param data
         * @param [e]
         * @param [sendTo="window"]
         */
        dispatchEventToWebView: function (type, data, e, sendTo) {
            sendTo = sendTo || "window";
            var javascriptUrl = [
                "javascript:  (function(){",
                "console.info('event from bg: " + type + ", " + JSON.stringify(data) + ", " + JSON.stringify(e) + "');",
                "   var data = " + JSON.stringify(data) + ";",
                "   var event = document.createEvent('Event');",
                "   event.initEvent(\"" + type + "\" , false, false);",
                "   event.data = data;"
            ].join('');
            if (e) {
                javascriptUrl += [
                    "   var e = " + JSON.stringify(e) + ";",
                    "   for (var key in e) {",
                    "       event[key] = e[key];",
                    "   }"
                ].join('');
            }
            javascriptUrl += [
                "   " + sendTo + ".dispatchEvent(event);" +
                "})();"
            ].join('');
            this.loadUrl(javascriptUrl);
            console.info("loadUrl of boostPage: ", javascriptUrl);
        },

        updateMenu: function (menuNativeObjectId) {
            this.nativeObject.__callNative("updateMenu", [menuNativeObjectId]);
        },
        dismissMenu: function () {
            this.nativeObject.__callNative("dismissMenu", []);
        },
        //展示关闭按钮
        showExitButton: function (show) {
            this.nativeObject.__callNative("showExitButton", [show]);
        },

        onResume: function () {
            //1. 通知native
            this.nativeObject.__callNative("onResume", []);
            //2. 派发事件（供背景页中更新右上角菜单、通知前景页以刷新前景页服务导航）
            this.dispatchEvent({ type: "resume" });
        }
    });
    module.exports = BoostPage;
});
define("boost/Carousel",function(require, exports, module) {
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
     * FIXME: 目前依赖于父元素上的宽高（后续使用shadow-dom解决）
     */
    var Carousel = derive(ViewPager, function () {
        ViewPager.call(this);

        if (nativeVersion.shouldUseWeb()) {
            var that = this;
            that._sliderWidget = new SliderWidget({
                autoSwipe: false,
                continuousScroll: false,
                container: that
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
            var webElement = document.createElement("div");
            webElement.style.flexDirection = "row";
            webElement.style.position = "absolute"; //FIXME: 为了不因flex由父元素影响自己的宽度
            return webElement;
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

            this.containerEl = options.container;
            var that = this;

            var whichEvent = ('orientationchange' in win) ? 'orientationchange' : 'resize';
            win.addEventListener(whichEvent, function () {
                that._spin();
            }, false);
        },
        _getWidth: function () {
            return getSizeInWeb(this.containerEl.parentNode).width; //FIXME: 不应从父元素上取
        },
        _getHeight: function () {
            return getSizeInWeb(this.containerEl.parentNode).height; //FIXME: 不应从父元素上取
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
        },
        _locateItem: function () {
            var that = this;
            var opts = that.options;
            var webContainer = getWebEl(this.containerEl);
            // 给初始图片定位
            //for (var i = 0; i < this.containerEl.childNodes.length; ++i) {
            for (var i = 0; i < webContainer.childNodes.length; ++i) {
                var child = webContainer.childNodes[i];
                //that._fnTranslate($(getWebEl(child)), (opts.axisX ? that._getWidth() : that._getHeight()) * i);
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
                    var _index = that._index;
                    that._fnTranslate($(getWebEl(that.containerEl)), -(that._getWidth() * (parseInt(_index, 10)) - that.moveX) - that._getWidth());

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

            this._transitionHandle($(getWebEl(this.containerEl)), num);

            var singleSize = opts.axisX ? this._getWidth() : this._getHeight();
            var size = singleSize * -_index - singleSize;

            this._fnTranslate($(getWebEl(this.containerEl)), size);

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
            var webContainer = getWebEl(this.containerEl);
            var firstEl = webContainer.childNodes[0];
            var lastEl = webContainer.childNodes[webContainer.childNodes.length - 1];
            //var $li = this.$li;
            var options = this.options;

            this.paused();
            var widthOrHeight = options.axisX ? this._getWidth() : this._getHeight();
            this._fnTranslate($(firstEl), widthOrHeight * -1);
            this._fnTranslate($(lastEl), widthOrHeight * that.containerEl.childNodes.length);

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
define("boost/Dialog",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var Dialog = derive(NativeElement, function (conf) {
        conf = conf || {};
        //this._super(NATIVE_VIEW_TYPE, "Dialog");
        NativeElement.call(this, TYPE_ID.DIALOG, "Dialog");
        if (conf.gravityVertical) {
            this.gravityVertical = conf.gravityVertical;
        }
        if (conf.gravityHorizontal) {
            this.gravityHorizontal = conf.gravityHorizontal;
        }
    }, {
        show: function () {
            this.nativeObject.__callNative("show", []);

            if (nativeVersion.shouldUseWeb()) {
                this._webDialogLayer = boost.addLayer(10);
                this._webDialogLayer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
                this._updateWebLocation();
                this._webDialogLayer.appendChild(this);
            }
        },
        close: function () {
            this.nativeObject.__callNative("dismiss", []);

            if (nativeVersion.shouldUseWeb()) {
                this._webDialogLayer.removeChild(this);
                boost.removeLayer(this._webDialogLayer);
                this._webDialogLayer = null;
            }
        },
        "get gravityVertical": function () {
            return this.__config__.gravityVertical;
        },
        "get gravityHorizontal": function () {
            return this.__config__.gravityHorizontal;
        },
        "set gravityVertical": function (value) {
            assert(value === "top" || value === "center" || value === "bottom", "gravityVertical只能为top|center|bottom");
            this.__update("gravityVertical", value);
            this._updateWebLocation();
        },
        "set gravityHorizontal": function (value) {
            assert(value === "left" || value === "center" || value === "right", "gravityHorizontal只能为left|center|right");
            this.__update("gravityHorizontal", value);
            this._updateWebLocation();
        },

        _updateWebLocation: function () {
            if (!this._webDialogLayer) {
                return;
            }

            var gravityToFlexLocation = {
                "top": "flex-start",
                "left": "flex-start",
                "bottom": "flex-end",
                "right": "flex-end",
                "center": "center"
            };
            this._webDialogLayer.style.alignItems = gravityToFlexLocation[this.gravityVertical] || "center";
            this._webDialogLayer.style.justifyContent = gravityToFlexLocation[this.gravityHorizontal] || "center";
        }
    });
    module.exports = Dialog;
});
define("boost/Element",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var StyleSheet = require("boost/StyleSheet");
    var trim = require("base/trim");
    var each = require("base/each");
    //var shadowRoot = require("boost/ShadowRoot");
    var compareElementOrder = require("boost/shadowDomUtil/compareElementOrder");
    var getIndexInComposedParent = require("boost/shadowDomUtil/getIndexInComposedParent");
    var xml = require("boost/xml");
    var push = [].push;
    var styleRender = require("boost/styleRender");

    var _super = EventTarget.prototype;
    var Element = derive(EventTarget, function (tagName) {
        //this._super();
        EventTarget.call(this);
        this.__tag__ = tagName.toUpperCase();
        this.__id__ = null;
        this.__style__ = null;
        this.__className__ = null;
        this.__classList__ = [];
        this.__children__ = [];
        this.__parent__ = null;

        this.__settedAttributes = [];

        this.__composedParent__ = null; //其计算依赖parent的shadowTree及其后代shadowTree中slot的assignedSlot
        this.__composedChildren__ = [];
        this.__shadowRoot__ = null;
        this.__slot__ = ""; //slotName
        this.__assignedSlot__ = null;
        /**
         * 其内slot按先序排列
         * 只有根节点(未append到其他节点上，包括shadowRoot)才维护、非根节点不维护（创建时都是根节点）
         */
        this.__descendantSlots__ = [];

        if (this.tagName === "SLOT") {
            this.__descendantSlots__.push(this);
        }
    }, {
        "get slot": function () {
            return this.__slot__;
        },
        "set slot": function (slot) {
            this.__slot__ = slot;
            //TODO
        },
        "get shadowRoot": function () {
            return this.__shadowRoot__;
        },
        "get assignedSlot": function () {
            return this.__assignedSlot__;
        },

        /**
         * 暂未实现shadowRootInitDict参数
         */
        "attachShadow": function () {
            assert(false, "todo");
            return;

            var self = this;
            var NOT_SUPPORTED_TAGS = [
                "TEXT",
                "TEXTINPUT",
                // ShadowRoot是规范里其并非继承Element而是继承自DocumentFragment，故没有此方法。本实现里只能在这儿排除之。
                "SHADOWROOT"
            ];
            assert(NOT_SUPPORTED_TAGS.indexOf(self.tagName) === -1, "Failed to execute 'attachShadow' on 'Element': Author-created shadow roots are disabled for this element.");
            assert(self.__shadowRoot__ === null, "Calling Element.attachShadow() for an element which already hosts a user-agent shadow root is deprecated.");

            var ShadowRoot = shadowRoot.getShadowRoot();
            self.__shadowRoot__ = new ShadowRoot(self);
            // 自己变成了shadowHost，并且shadowTree中没有slot。故child元素的assignedSlot与composedParent都为null
            each(self.__children__, function (child) {
                assert(child.__assignedSlot__ === null, "the assignedSlot of normal node's child should be null");
                //TODO: child可能为有效slot，则其不会出现在composedTree上
                assert(child.__composedParent__ === self, "the composedParent of normal node's child should be the normal node");
                self.__removeComposedChild(child);
            });

            return self.__shadowRoot__;
        },

        "set id": function (value) {
            this.__id__ = value;

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "id",
                attributeValue: value,
                propagationStoped: true
            });
        },
        "get id": function () {
            return this.__id__;
        },
        "set className": function (value) {
            //if (value.indexOf("j-") < 0) { //FIXME: 票务临时方案
            //    return;
            //}

            this.__className__ = value;
            var classList = [];
            var list = value.split(" ");
            var count = list.length;
            var index;
            var item;
            for (index = 0; index < count; index++) {
                item = trim(list[index]);
                if (item.length > 0) {
                    classList.push(item);
                }
            }
            this.__classList__ = classList;

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "className",
                attributeValue: value,
                propagationStoped: true
            });

            //TODO: just for debug
            //this.nativeObject.__callNative("setContentDescription", [this.__className__]);
        },
        "get className": function () {
            return this.__className__;
        },
        "get classList": function () {
            return this.__classList__;
        },
        "get tagName": function () {
            return this.__tag__;
        },

        /**
         * 注：与web不同：为防止内存泄漏，set时会将子元素都销毁掉
         * @param innerHTML
         */
        "set innerHTML": function (innerHTML) {
            var self = this;
            self.__destroyChildrenRecursively();

            each(xml.parseNodes(innerHTML), function (child) {
                self.appendChild(child);
            });
            styleRender.apply(this);
        },
        /**
         * 注：与web不同：为防止内存泄漏，set时会将自己及子元素都销毁掉
         * @param outerHTML
         */
        "set outerHTML": function (outerHTML) {
            assert(this.parentNode, "NoModificationAllowedError: Failed to set the 'outerHTML' property on 'Element': This element has no parent node.");

            var newNode = xml.parse(outerHTML);
            styleRender.apply(newNode);
            this.parentNode.replaceChild(newNode, this);
            this.destroyRecursively();
        },

        "get innerHTML": function () {
            var result = "";
            each(this.childNodes, function (child) {
                result += child.outerHTML;
            });
            return result;
        },
        "get outerHTML": function () {
            var self = this;
            var result = '';
            var tagName = self.tagName.toLowerCase();
            result += '<' + tagName;
            if (self.id) {
                result += ' id="' + self.id + '"';
            }
            if (self.className) {
                result += ' class="' + self.className + '"';
            }
            if (self.style.cssText) {
                result += ' style=' + JSON.stringify(self.style.cssText) + '';
            }
            each(self.__settedAttributes, function (attrName) {
                result += ' ' + attrName + '=' + JSON.stringify(self[attrName]);
            });
            result += '>';
            result += self.innerHTML;
            result += '</' + tagName + '>';

            return result;
        },
        "get style": function () {
            var style;
            var self = this;
            if (this.__style__ === null) {
                style = this.__getStyle();
                style.__onPropertyChange = function (key, value, origValue) {
                    self.__styleChange(key, value, origValue);
                };

                //style.addEventListener("propertychange", function (e) {
                //    self.__styleChange(e.key, e.value, e.origValue);
                //});

                this.__style__ = style;
            }
            return this.__style__;
        },
        "get childNodes": function () {
            return this.__children__;
        },
        "get firstChild": function () {
            return this.hasChildNodes() ? this.childNodes[0] : null;
        },
        "get lastChild": function () {
            var index = this.childNodes.length - 1;
            return this.hasChildNodes() ? this.childNodes[index] : null;
        },
        "get nextSibling": function () {
            var index;
            var count;
            var parentNode = this.parentNode;
            var parentNodeChildren;
            if (parentNode !== null) {
                parentNodeChildren = parentNode.childNodes;
                count = parentNodeChildren.length;
                index = parentNodeChildren.indexOf(this);
                if (index > -1 && index + 1 < count) {
                    return parentNodeChildren[index + 1];
                }
            }

            return null;
        },
        "get parentNode": function () {
            return this.__parent__;
        },
        "get previousSibling": function () {
            var index;
            var parentNode = this.parentNode;
            var parentNodeChildren;
            if (parentNode !== null) {
                parentNodeChildren = parentNode.childNodes;
                index = parentNodeChildren.indexOf(this);
                if (index > 0) {
                    return parentNodeChildren[index - 1];
                }
            }

            return null;
        },
        "get nodeType": function () {
            return 1; //ELEMENT_NODE;
        },
        __getStyle: function () {
            return new StyleSheet();
        },
        __styleChange: function (key, value, origValue) {
            // do nothing

            //TODO 为了性能暂时注释，影响：webDebugger
            //this.dispatchEvent({
            //    type: "styleChange",
            //    key: key,
            //    value: value,
            //    propagationStoped: true
            //});
        },

        /**
         * @returns {Element} 可能是documentElement，也可能是不在documentTree里的普通Element，也可能是shadowRoot
         */
        __getRoot: function () {
            var root;
            for (root = this; root.parentNode !== null; root = root.parentNode) {
            }
            return root;
        },
        __addChildAt: function (addedChild, index) {
            assert(addedChild.tagName !== "SHADOWROOT", "shadowRoot can't be child of other node");
            var self = this;

            var childParentNode = addedChild.parentNode;
            if (childParentNode !== null) {
                childParentNode.removeChild(addedChild);
            }

            self.__children__.splice(index, 0, addedChild);
            addedChild.__parent__ = self;

            // 1. 先计算添加的子树中slot接收的节点
            var hasNewSlot = addedChild.__descendantSlots__.length > 0;
            if (hasNewSlot) {
                var root = self.__getRoot();
                var oldSlots = root.__descendantSlots__.slice();
                var newSlots = addedChild.__descendantSlots__.slice();

                addedChild.__descendantSlots__ = null; //已经不再是root，不需再维护

                //维持先序：找到第一个后序元素，插入其前
                for (var i = 0; i < oldSlots.length && compareElementOrder(newSlots[0], oldSlots[i]) !== -1; ++i) {}
                root.__descendantSlots__ = oldSlots.slice(0, i).concat(newSlots).concat(oldSlots.slice(i));

                var inShadowTree = root.tagName === "SHADOWROOT";
                // 下面为计算新增子树中的slot对host的子的assignedSlot的影响
                if (inShadowTree) {
                    var shadowHost = root.host;
                    var unAssignedChildren = shadowHost.__children__.filter(function (hostChild) {
                        return hostChild.__assignedSlot__ === null;
                    });

                    var newSlotMap = {};
                    each(newSlots, function (newSlot) {
                        if (!newSlotMap[newSlot.__name__]) { //若有同名，靠前者在树中先序，优先
                            newSlotMap[newSlot.__name__] = newSlot;
                        }
                    });
                    each(newSlotMap, function (newSlot) {
                        var sameNameOldSlot; //存放按先序第一个同名slot
                        var indexOld;
                        for (indexOld = 0; !sameNameOldSlot && indexOld < oldSlots.length; ++indexOld) {
                            if (oldSlots[indexOld].__name__ === newSlot.__name__) {
                                sameNameOldSlot = oldSlots[indexOld];
                            }
                        }

                        if (!sameNameOldSlot) { //旧树中没有同名
                            var matchedHostChildren = unAssignedChildren.filter(function (hostChild) {
                                return hostChild.__slot__ === newSlot.__name__; //含默认的""的比较
                            });
                            matchedHostChildren.forEach(function (hostChild) {
                                newSlot.__assignNode(hostChild);
                            });
                        } else { //旧树中有同名
                            var newSlotIndex = root.__descendantSlots__.indexOf(newSlot);
                            var oldSlotIndex = root.__descendantSlots__.indexOf(sameNameOldSlot);
                            //先序的生效。若newSlot生效，取代oldSlot；若newSlot不生效，其只作为替补
                            var newSlotEffect = newSlotIndex < oldSlotIndex;
                            if(newSlotEffect) {
                                sameNameOldSlot.__assignNodes__.forEach(function (node) {
                                    assert(node.__assignedSlot__ === sameNameOldSlot);
                                    newSlot.__assignNode(node);
                                });
                            }
                        }
                    });
                }
            }

            // 2. 再计算添加的子树被添加到的composedTree中的位置
            var childAssignedSlot = self.__calculateAssignedSlot(addedChild);
            if (childAssignedSlot) {
                childAssignedSlot.__assignNode(addedChild);
            }
            var composedParent = self.__calculateComposedParent(addedChild);
            if (composedParent) {
                composedParent.__addComposedChildAt(addedChild, getIndexInComposedParent(addedChild));
            }
        },

        //TODO: 把工具方法移出至单独文件
        /**
         * @pre node.parentNode.shadowRoot.__descendantSlots__若存在，则其内slot以在树中的先序排序
         * @param node
         * @returns {null|Slot}
         */
        __calculateAssignedSlot: function (node) {
            return null; //TODO
            var shadowHost = node.parentNode;
            if (!shadowHost) {
                return null;
            }

            var shadowRoot = shadowHost.__shadowRoot__;
            if (!shadowRoot) {
                return null;
            }

            for (var i = 0; i < shadowRoot.__descendantSlots__.length; ++i) {
                var slot = shadowRoot.__descendantSlots__[i];
                if (slot.__name__ === node.__slot__) { //含默认的""的比较
                    return slot;
                }
            }

            return null;
        },
        __getRecursivelyAssignedSlot: function (node) {
            var result = node;
            while (result.__assignedSlot__) {
                result = result.__assignedSlot__;
            }
            return result;
        },
        /**
         * @pre
         *  node.assignedSlot已经计算完毕
         *  node.parentNode的shadowTree及其所有descendant tree中的slot的assignedSlot已经计算完毕
         * @param node
         */
        __calculateComposedParent: function (node) {
            var composedParent;
            var nodeParent = node.parentNode;

            if (node.tagName === "SHADOWROOT") {
                composedParent = null; //shadowRoot不展示
            } else if (node.tagName === "SLOT" && node.__isEffective()) {
                composedParent = null; //有效的slot也不展示
            } else if (!nodeParent) {
                composedParent = null;
            } else if (!nodeParent.__shadowRoot__) { //node不是shadowHost的子元素
                composedParent = nodeParent;
            } else if (!node.__assignedSlot__) { //是shadowHost的子元素，但没有assignedSlot
                composedParent = null;
            } else { //是shadowHost的子元素，并且有assignedSlot
                composedParent = this.__getRecursivelyAssignedSlot(node).parentNode;
            }

            if (composedParent && composedParent.tagName === "SHADOWROOT") { //对于shadowRoot，取其host
                composedParent = composedParent.host; //目前不允许shadowRoot再attachShadow，故只取一层即可
            }

            return composedParent;
        },

        __removeChildAt: function (index) {
            var child = this.childNodes[index];
            this.childNodes.splice(index, 1);
            child.__parent__ = null;

            child.__composedParent__ && child.__composedParent__.__removeComposedChild(child);
            // __descendantSlots__中属于此child的，由其继续维护
            child.__descendantSlots__ = [];
            var root = this.__getRoot();
            for (var i = 0; i < root.__descendantSlots__.length; ++i) {
                var eachDescendantSlot = root.__descendantSlots__[i];
                if (eachDescendantSlot.__getRoot() === child) {
                    child.__descendantSlots__.push(eachDescendantSlot);
                    root.__descendantSlots__.splice(i, 1);
                    --i;
                }
            }
            if (child.tagName === "SLOT") {
                assert(child.__descendantSlots__.indexOf(child) === 0, "__descendantSlots__ of root SLOT should include itself, and should be first");
            }
        },
        __addComposedChildAt: function (child, index) {
            var childParentNode = child.__composedParent__;
            if (childParentNode !== null) {
                childParentNode.__removeComposedChild(child);
            }
            this.__composedChildren__.splice(index, 0, child);
            child.__composedParent__ = this;
            styleRender.apply(child);
        },
        __removeComposedChild: function (child) {
            var index = this.__composedChildren__.indexOf(child);
            if (index > -1) {
                this.__removeComposedChildAt(index);
            }
            styleRender.apply(child);
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            this.__composedChildren__.splice(index, 1);
            child.__composedParent__ = null;
        },
        appendChild: function (child) {
            this.__addChildAt(child, this.__children__.length);

            this.dispatchEvent({
                type: "appendChild",
                child: child,
                propagationStoped: true
            });
            return child;
        },
        hasChildNodes: function () {
            return this.childNodes.length > 0;
        },
        insertBefore: function (newNode, referenceNode) {
            var childNodes = this.childNodes;
            var index = childNodes.indexOf(referenceNode);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            this.__addChildAt(newNode, index);

            this.dispatchEvent({
                type: "insertBefore",
                child: newNode,
                reference: referenceNode,
                propagationStoped: true
            });
            return newNode;
        },
        removeChild: function (child) {
            var index = this.childNodes.indexOf(child);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            this.__removeChildAt(index);

            this.dispatchEvent({
                type: "removeChild",
                child: child,
                propagationStoped: true
            });
            return child;
        },
        replaceChild: function (newChild, oldChild) {
            var index = this.childNodes.indexOf(oldChild);
            if (index < 0) {
                //TODO ERROR
                return null;
            }
            if (newChild.parentNode !== null) {
                newChild.parentNode.removeChild(newChild);
            }
            this.childNodes.splice(index, 1, newChild);
            oldChild.__parent__ = null;

            this.dispatchEvent({
                type: "replaceChild",
                newChild: newChild,
                oldChild: oldChild,
                propagationStoped: true
            });
            return oldChild;
        },
        __findChild: function (callback) {
            var childNodes = this.childNodes;
            var index;
            var count = childNodes.length;
            var child;
            for (index = 0; index < count; index++) {
                child = childNodes[index];
                if (callback(child) === true) {
                    return true;
                }
                if (child.__findChild(callback)) {
                    return true;
                }
            }

            return false;
        },
        getElementById: function (id) {
            var ret = null;
            this.__findChild(function (element) {
                if (element.id === id) {
                    ret = element;
                    //如果找到指定 Element, 返回 true, 停止遍历
                    return true;
                }
                return false;
            });

            return ret;
        },
        getElementsByClassName: function (className) {
            var ret = [];

            this.__findChild(function (element) {
                if (element.classList.indexOf(className) > -1) {
                    ret.push(element);
                }
                //始终返回 false, 继续查找
                return false;
            });

            return ret;
        },
        getElementsByTagName: function (tag) {
            tag = tag.toUpperCase();
            var ret = [];

            this.__findChild(function (element) {
                if (element.tagName === tag) {
                    ret.push(element);
                }
                //始终返回 false, 继续查找
                return false;
            });

            return ret;
        },
        __findParent: function (callback) {
            var node = this;
            while ((node = node.parentNode) !== null) {
                if (callback(node) === true) {
                    return true;
                }
            }
            return false;
        },
        __parentSelect: function (selector) {
            var results = null;
            selector = trim(selector);
            var match = rquickExpr.exec(selector);
            var m;

            assert(match !== null, "不支持的选择器:\"" + selector + "\",现在只支持简单的选择器: #id .class tag");

            if ((m = match[1])) {
                // ID selector
                this.__findParent(function (element) {
                    if (element.id === m) {
                        results = element;
                        return true;
                    }
                });
            } else if (match[2]) {
                // Type selector
                this.__findParent(function (element) {
                    if (element.tagName === selector) {
                        results = element;
                        return true;
                    }
                });
            } else if (m = match[3]) {
                // Class selector
                this.__findParent(function (element) {
                    if (element.classList.indexOf(m) > -1) {
                        results = element;
                        return true;
                    }
                });
            }
            return results;
        },
        __select: function (selector, results, quick) {
            var self = this;
            results = results || [];
            quick = !!quick;
            selector = trim(selector);
            if (!selector) {
                return results;
            }

            var match = rquickExpr.exec(selector);
            var m;
            if (quick) {
                //assert(match !== null, "现在只支持简单的选择器: #id .class tag");
                assert(match !== null, "不支持的选择器:\"" + selector + "\",现在只支持简单的选择器: #id .class tag");
            }
            if (match !== null) {
                if ((m = match[1])) {
                    // ID selector
                    var item = this.getElementById(m);
                    item && results.push(item);
                } else if (match[2]) {
                    // Type selector
                    push.apply(results, this.getElementsByTagName(selector));
                } else if (m = match[3]) {
                    // Class selector
                    push.apply(results, this.getElementsByClassName(m));
                }
            } else {
                each(selector.split(","), function (selector) {
                    var items = selector.split(" ").filter(function (item) {
                        return trim(item).length > 0;
                    });
                    //找出所有满足需求的
                    var list = [];
                    self.__select(items.pop(), list, true);

                    //过滤不满足条件的节点
                    var count = items.length;
                    each(list, function (element) {
                        var index = count;
                        var node = element;
                        while (index--) {
                            // 没有找到符合条件的父节点，就过滤掉
                            // FIXME 以当前节点作为根节点
                            node = node.__parentSelect(items[index]);
                            if (node === null) {
                                //没有找到选择器指定的父节点
                                return;
                            }
                        }
                        //在当前文档能找到符合条件的父节点，添加进结果集
                        results.push(element);
                    });
                });
            }
            return results;
        },
        querySelectorAll: function (selector) {
            return this.__select(selector);
        },
        querySelector: function (selector) {
            return this.querySelectorAll(selector)[0] || null; //FIXME: 改为找到一个就停止
        },
        /*
        querySelector: function (selector) {
            var func = getSelectorFunction(selector);
            var ret = [];
            func(this, ret, 1);
            return ret;
        },
        querySelectorAll: function (selector, __results__) {
            __results__ = __results__ || [];
            var match = rquickExpr.exec(selector);
            var m;

            //assert(match !== null, "现在只支持简单的选择器: #id .class tag");
            if (match !== null) {
                if ((m = match[1])) {
                    // ID selector
                    push.apply(__results__, this.getElementById(m));
                } else if (match[2]) {
                    // Type selector
                    push.apply(__results__, this.getElementsByTagName(selector));
                } else if (m = match[3]) {
                    // Class selector
                    push.apply(__results__, this.getElementsByTagName(selector));
                }
            } else {

            }

            return __results__;
        },
       */
        setAttribute: function (name, value) {
            if (typeof value !== "string") {
                if (value === undefined || value === null) {
                    value = "";
                } else {
                    value = value.toString();
                }
            }

            switch (name.toLowerCase()) {
                case "class":
                    this.className = value;
                    break;
                case "id":
                    this.__id__ = value;
                    break;
                case "style":
                    this.style.cssText = value;
                    break;
                default:
                    this.__settedAttributes.push(name);
                    this[name] = value;

                    this.dispatchEvent({
                        type: "attributeChange",
                        attributeName: name,
                        attributeValue: value,
                        propagationStoped: true
                    });
                break;
            }
        },
        getAttribute: function (name) {
            return this[name];
        },
        dispatchEvent: function (event) {
            if (event.propagationStoped === true) {
                //之前用法为propagationStoped即不向上传播，但会在元素本身派发，这里保留
                return this._dispatchEventOnPhase(event, "target");
            }

            var ret = event.defaultPrevented;
            var ancestors = [];
            var curNode = this;
            while (curNode = curNode.parentNode) {
                ancestors.push(curNode); //根在后
            }
            ancestors.reverse(); //根在前

            //capture phase
            each(ancestors, function (curNode) {
                ret = curNode._dispatchEventOnPhase(event, "capture");
                return !event.propagationStoped;
            });
            if (event.propagationStoped) {
                return ret; //不再继续
            }

            //target phase
            ret = this._dispatchEventOnPhase(event, "target");
            if (event.propagationStoped) {
                return ret; //不再继续
            }

            //bubbling phase
            ancestors.reverse(); //根在后
            each(ancestors, function (curNode) {
                ret = curNode._dispatchEventOnPhase(event, "bubbling");
                return !event.propagationStoped;
            });
            return ret;
        },

        /**
         * 对子元素：removeChild，但并不销毁
         */
        destroy: function() {
            while (this.__children__.length) {
                this.__removeChildAt(0);
            }

            this.removeAllEventListeners();
        },
        /**
         * 对子元素：removeChild并递归destroy之
         */
        destroyRecursively: function () {
            this.__destroyChildrenRecursively();
            this.destroy();
        },

        __destroyChildrenRecursively: function () {
            while (this.__children__.length) {
                var child = this.__children__[0];
                this.__removeChildAt(0);
                child.destroyRecursively();
            }
        }
    });

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;

    module.exports = Element;
});
define("boost/Event",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");

    var Event = derive(Object, function (target, type, data) {
        this.__target__ = target;
        this.__type__ = type;
        this.__defaultPrevented__ = false;
        this.__propagationStopped__ = false;
        this.__timeStamp__ = (new Date()).getTime();
    }, {
        "get target": function () {
            return this.__target__;
        },
        "get type": function () {
            return this.__type__;
        },
        preventDefault: function () {
            this.__defaultPrevented__ = true;
        },
        "get defaultPrevented": function () {
            return this.__defaultPrevented__;
        },
        stopPropagation: function () {
            this.__propagationStopped__ = true;
        },
        "get propagationStoped": function () {
            return this.__propagationStopped__;
        },
        "get timeStamp": function () {
            return this.__timeStamp__;
        }
    });

    module.exports = Event;

});
define("boost/EventTarget",function(require, exports, module) {
    "use strict";


    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var hasOwnProperty = require("base/hasOwnProperty");

    var EventTarget = derive(Object, function () {
        this.__listeners__ = {};
    }, {
        addEventListener: function (eventType, listener, useCapture) {
            var listeners = this.__listeners__;
            if (!hasOwnProperty(listeners, eventType)) {
                listeners[eventType] = [];
            }

            assert(type(listeners[eventType]) === "array", "__listeners__ is not an array");

            listeners[eventType].push({
                useCapture: useCapture || false,
                listener: listener
            });
            return true;
        },

        removeEventListener: function (eventType, listener, useCapture) {
            var listeners = this.__listeners__;
            var index;
            var found;
            var listenerInfo;
            if (!hasOwnProperty(listeners, eventType)) {
                return false;
            }

            found = false;
            for (index = 0; index < listeners[eventType].length; ++index) {
                listenerInfo = listeners[eventType][index];
                if (listenerInfo.listener === listener && listenerInfo.useCapture === useCapture) {
                    listeners[eventType].splice(index, 1);
                    --index;
                    found = true;
                }
            }
            return found;
        },

        removeAllEventListeners: function () {
            this.__listeners__ = {};
        },

        dispatchEvent: function (event) {
            return this._dispatchEventOnPhase(event, "target");
        },

        /**
         * 在本元素身上执行event与phase相应的回调
         * @protected
         * @param event
         * @param phase {'capture'|'bubbling'|'target'}
         * @private
         */
        _dispatchEventOnPhase: function (event, phase) {
            var type = event.type;
            var listeners = this.__listeners__;
            if (hasOwnProperty(listeners, type)) {
                listeners[type].forEach(function (listenerInfo) {
                    switch (phase) {
                        case "capture":
                            listenerInfo.useCapture && listenerInfo.listener.call(this, event);
                            break;
                        case "bubbling":
                            !listenerInfo.useCapture && listenerInfo.listener.call(this, event);
                            break;
                        case "target":
                            listenerInfo.listener.call(this, event);
                            break;
                    }
                }, this);
            }
            return !event.defaultPrevented;
        }
    });

    module.exports = EventTarget;

});
define("boost/FocusEvent",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");

    var FocusEvent = derive(Event, function (target, type) {
        assert(type === "focus" || type === "blur", "unknow focus event type:\"" + type + "\"")
        Event.call(this, target, type);
    });

    module.exports = FocusEvent;
});
define("boost/Image",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var LayoutStyle = require("boost/LayoutStyle");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var Image = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Image");
        NativeElement.call(this, TYPE_ID.IMAGE, "Image");
    }, {
        __getStyle: function () {
            return new LayoutStyle();
        },
        "get src": function () {
            return this.__config__.source || "";
        },
        "set src": function (value) {
            var url;
            if (!value) {
                url = null;
            } else if (/^https?:\/\//.test(value)) {
                url = value;
            } else {
                var host = location.protocol + "//" + location.hostname;
                if (value[0] === '/') {
                    url = host + value;
                } else {
                    url = host + location.pathname.slice(0, location.pathname.lastIndexOf('/')) + '/' + value;
                }
            }

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.src = url;
            }
            this.__update("source", url);
        },
        "set resizeMode": function (value) {
            this.__update("resizeMode", value);
        },
        __createWebElement: function () {
            return document.createElement("img");
        }
    });
    module.exports = Image;
});
define("boost/LayoutPropTypes",function(require, exports, module) {
    "use strict";

    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");

    var number = validator.number;
    var px = validator.px;
    var _enum = validator.oneOf;
    var color = validator.color;

    var LayoutPropTypes = StyleSheet.createPropTypes({
        "width": [px, null],
        "height": [px, null],
        "minWidth": [px, null],
        "minHeight": [px, null],
        "maxWidth": [px, null],
        "maxHeight": [px, null],
        "left": [px, null],
        "right": [px, null],
        "top": [px, null],
        "bottom": [px, null],
        "margin": [px, 0],
        "marginLeft": [px, 0],
        "marginRight": [px, 0],
        "marginTop": [px, 0],
        "marginBottom": [px, 0],
        "marginHorizontal": [px, 0],
        "marginVertical": [px, 0],
        "padding": [px, 0],
        "paddingLeft": [px, 0],
        "paddingRight": [px, 0],
        "paddingTop": [px, 0],
        "paddingBottom": [px, 0],
        "paddingHorizontal": [px, 0],
        "paddingVertical": [px, 0],
        "borderWidth": [px, 0],
        "borderLeftWidth": [px, 0],
        "borderRightWidth": [px, 0],
        "borderTopWidth": [px, 0],
        "borderBottomWidth": [px, 0],
        "borderRadius": [px, 0],
        "borderTopLeftRadius": [px, 0],
        "borderTopRightRadius": [px, 0],
        "borderBottomRightRadius": [px, 0],
        "borderBottomLeftRadius": [px, 0],
        "borderColor": [color, 0xff000000 | 0],
        "borderLeftColor": [color, 0xff000000 | 0],
        "borderTopColor": [color, 0xff000000 | 0],
        "borderRightColor": [color, 0xff000000 | 0],
        "borderBottomColor": [color, 0xff000000 | 0],
        "flexDirection": [_enum("row", "column"), "column"],
        "justifyContent": [_enum("flex-start", "flex-end", "center", "space-between", "space-around"), "flex-start"],
        "alignItems": [_enum("flex-start", "flex-end", "center", "stretch"), "stretch"],
        //"alignContent": [_enum("flex-start", "flex-end", "center", "stretch"), "flex-start"], //TODO: native support
        "alignSelf": [_enum("auto", "flex-start", "flex-end", "center", "stretch"), "auto"],
        "flex": [number, 0],
        "flexWrap": [_enum("wrap", "nowrap"), "nowrap"],
        "position": [_enum("absolute", "relative"), "relative"],
        "translationX": [px, 0],
        "translationY": [px, 0],

        //"display": [_enum("block", "none"), "block"],

        //TODO: 改为transform
        "scaleX": [number, 1],
        "scaleY": [number, 1],

        "tapHighlightColor": [color, 0x00000000|0]
    });

    module.exports = LayoutPropTypes;

});
define("boost/LayoutStyle",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var StyleSheet = require("boost/StyleSheet");

    module.exports = derive(StyleSheet, LayoutPropTypes);
});
define("boost/ListView",function(require, exports, module) {
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
define("boost/NativeElement",function(require, exports, module) {
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
define("boost/PropAnimation",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Animation= require("boost/Animation");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * @param config {Object}
     * @param config.prop {string}
     * @param config.from {number}
     * @param config.to {number}
     * @param config.duration {number}
     * @param config.easing {string}
     *  "easeInOutSine"|"easeInQuad"|"easeInBack"|"easeInOutBack"|"easeOutElastic"|"easeOutSine"|"linear"|"easeOutBack"
     * @param config.element {NativeElement}
     */
    var PropAnimation = derive(Animation, function (config) {
        Animation.call(this, TYPE_ID.PROP_ANIMATION, {
            prop: config.prop,
            from: config.from,
            to: config.to,
            duration: config.duration,
            easing: config.easing,
            element: config.element
        });
    },{
    });

    module.exports = PropAnimation;
});
define("boost/PropertyChangeEvent",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var Event = require("boost/Event");

    var PropertyChangeEvent = derive(Event, function (target, key, value, origValue) {
        //this._super(target, "propertychange");
        Event.call(this, target, "propertychange");
        this.__key__ = key;
        this.__value__ = value;
        this.__orig__ = origValue;
    }, {

        "get key": function () {
            return this.__key__;
        },

        "get value": function () {
            return this.__value__;
        },

        "get origValue": function () {
            return this.__orig__;
        }
    });

    module.exports = PropertyChangeEvent;
});
define("boost/RootView",function(require, exports, module) {
    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var RootView = derive(NativeElement, function(id) {
        NativeElement.call(this, TYPE_ID.ROOT_VIEW, "RootView", id);
    }, {
        __getStyle: function () {
            return new ViewStyle();
        },
        __createWebElement: function (info) {
            var el = document.createElement("div");
            el.id = "BOOST_ROOT_VIEW_" + info.objId;
            el.style.height = "100%";
            el.style.width = "100%";
            el.style.position = "absolute";
            el.style.top = "0";
            el.style.left = "0";
            return el;
        }
    });
    module.exports = RootView;
});
define("boost/ScrollView",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var Event = require("boost/Event");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var boostEventGenerator = require("boost/boostEventGenerator");
    var Linkage = require("boost/nativeObject/Linkage");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var ScrollView = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "ScrollView");
        NativeElement.call(this, TYPE_ID.SCROLL_VIEW, "ScrollView");
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "scroll":
                    var event = new Event(this, "scroll");
                    event.data = {
                        scrollLeft: e.data.scrollLeft,
                        scrollTop: e.data.scrollTop,
                        scrollTopPercent: e.data.scrollpercent
                    };
                    event.stopPropagation();
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            //assert(false, "ScrollView 不支持 style 属性");
            return new ViewStyle();
        },
        __createWebElement: function (info) {
            var el = document.createElement("div");
            el.style.overflow = "auto";

            //因为scroll事件不冒泡，故只能在单个元素上监听
            el.addEventListener("scroll", boostEventGenerator.genFromWebEvent);

            return el;
        },
        scrollTo: function (location) {
            if (nativeVersion.shouldUseWeb()) {
                this.nativeObject.__webElement__.scrollTop = location;
                return;
            }
            this.nativeObject.__callNative("scrollTo", [location * window.devicePixelRatio]);
        },
        setLinkage: function (linkage) {
            assert(linkage instanceof Linkage);
            this.nativeObject.__callNative("setLinkage", [linkage.tag]);
        },
        __addComposedChildAt: function (child, index) {
            if (nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.overflow = "visible"; //scrollView的子元素如果也是overflow:hidden，滚动时会卡
            }
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            if (child && nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.overflow = "hidden"; //恢复__addComposedChildAt中所改的值
            }
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
        }
    });
    module.exports = ScrollView;
});
//not in use
define("boost/Selector",function(require, exports, module) {
    "use strict";

    var DEVICE_PIXEL_RATIO = window.devicePixelRatio;
    var derive = require("base/derive");
    var trim = require("base/trim");
    var copyProperties = require("base/copyProperties");
    var hasOwnProperty = require("base/hasOwnProperty");
    var each = require("base/each");
    var slice = require("base/slice");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var PropertyChangeEvent = require("boost/PropertyChangeEvent");

    // Easily-parseable/retrievable ID or TAG or CLASS selectors
    var rquickExpr = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;

    var deep = 0;
    var tagMap = {};
    var idMap = {};
    var classMap = {};

    var checkMap = {};

    var Selector = derive(Object, function (str) {
        this.__str__ = str;
        this.__selector = null;
        this.__matcher = null;
    }, {
        select: function (element, results) {
            results = results || [];
            if (this.__selector === null) {
                this.__selector = compileSelector(this.__str__);
            }
            this.__selector(element, results);
            return results;
        },
        match: function (element, context) {
            //results = results || [];
            if (this.__matcher === null) {
                this.__matcher = compileMatcher(this.__str__);
            }
            return this.__matcher(element, context);
        }
    });

    function compileSelector(str) {
        var parts = str.split(",");
        parts = parts.filter(function (item) {
            //return trim(item) !==
        });

        return function () {

        };
    }

    var selectorMap = {};

    Selector.getSelector = function (str) {
        str = trim(str);
        if (hasOwnProperty(selectorMap, str)) {
            return selectorMap[str];
        }

        var selector = new Selector(str);
        selectorMap[str] = selector;
        return selector;
    };

    Selector.freeze = function () {
        deep = 1;
    };

    Selector.unfreeze = function () {
        deep = 0;
        tagMap = {};
        idMap = {};
        classMap = {};
    };

    module.exports = Selector;
});
define("boost/ShadowRoot",function(require, exports, module) {
    var derive = require("base/derive");
    require("boost/Element");

    var ShadowRoot;
    exports.getShadowRoot = function () {
        //FIXME: 因与Element有循环依赖，故暂时封一个方法而非直接exports
        if (!ShadowRoot) {
            var Element = require("boost/Element");
            /**
             * shadowRoot不参与渲染，故只继承Element(w3c规范里是继承自DocumentFragment、又增加了innerHTML与styleSheets等属性)
             */
            ShadowRoot = derive(Element, function (host) {
                //this._super("ShadowRoot");
                Element.call(this, "ShadowRoot");
                this.__host__ = host;
            }, {
                "get host": function () {
                    return this.__host__;
                }
            });
        }
        return ShadowRoot;
    };
});
define("boost/Slider",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var LayoutStyle = require("boost/LayoutStyle");
    var TYPE_ID = require("boost/TYPE_ID");

    var Slider = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Slider");
        NativeElement.call(this, TYPE_ID.SLIDER, "Slider");
    }, {
        __getStyle: function () {
            //assert(false, "Slider 不支持 style 属性");
            return new LayoutStyle();
        },
        closeSlider: function () {
            this.nativeObject.__callNative("closeSlider", []);
        },
        "get maxSlideWidth": function () {
            return this.__config__.maxSlideWidth || 0;
        },
        "set maxSlideWidth": function (value) {
            assert(!isNaN(value) && isFinite(value), "maxSlideWidth 必须为有效数字");
            value = parseFloat(value);
            this.__update("maxSlideWidth", value);
        }
    });
    module.exports = Slider;
});
define("boost/Slot",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var View = require("boost/View");
    var NativeElement = require("boost/NativeElement");
    var compareElementOrder = require("boost/shadowDomUtil/compareElementOrder");
    var getIndexInComposedParent = require("boost/shadowDomUtil/getIndexInComposedParent");
    var TYPE_ID = require("boost/TYPE_ID");

    //FIXME: 与View中耦合了~
    module.exports = derive(View, function () {
        //this._super();
        //如果直接调用View，则这里初始化的tagName就成View了，故直接跨级调NativeElement
        NativeElement.call(this, TYPE_ID.VIEW, "Slot");

        this.__name__ = ""; //slotName
        this.__distributedNodes__ = [];
        this.__assignNodes__ = []; //按序存放assignedSlot为本节点的元素
    }, {
        /**
         * 内部API
         * slot是否有assignNodes（按w3c规范，如果没有assignNodes，将其作为未知html元素渲染，即后代与shadowTree(如果有)仍渲染）
         * @returns {boolean}
         */
        "__isEffective": function () {
            return this.__assignNodes__.length > 0;
        },

        "get name": function () {
            return this.__name__;
        },

        "set name": function (name) {
            this.__name__ = name;
            //TODO
        },

        "getDistributedNodes": function () {
            return this.__distributedNodes__.slice();
        },

        "__assignNode": function (node) {
            var self = this;
            var root = self.__getRoot();
            var unEffectiveBefore = !self.__isEffective();
            assert(root && root.host === node.parentNode, "only child node of shadowTree's host can be assign to the slot that in the shadowTree");

            // 1. assignedSlot、assignNodes
            if (node.__assignedSlot__) {
                node.__assignedSlot__.__unAssignNode(node);
            }
            node.__assignedSlot__ = self;
            for (var i = 0; i < self.__assignNodes__.length && compareElementOrder(node, self.__assignNodes__[i]) !== -1; ++i) {}
            self.__assignNodes__.splice(i, 0, node); // 维持先序：找到第一个后序元素，插入其前

            // 2. distributedNodes
            var nodeIsEffectiveSlot = node.tagName === "SLOT" && node.__isEffective();
            if (!nodeIsEffectiveSlot) {
                self.__distributedNodes__.push(node);
            } else {
                self.__distributedNodes__ = self.__distributedNodes__.concat(node.__distributedNodes__);
            }

            // 3. node.composedParent
            if (!nodeIsEffectiveSlot) {
                assert(node.__composedParent__ === null, "should remove from old composedParent when unAssign");
                var composedParent = self.__calculateComposedParent(node);
                assert(!!composedParent);
                composedParent.__addComposedChildAt(node, getIndexInComposedParent(node));
            } else { //有效slot的assignedSlot改变，其distributedNodes的composedParent都要变
                node.__distributedNodes__.forEach(function (distributedNode) {
                    assert(distributedNode.__composedParent__ === null, "should remove from old composedParent when unAssign");
                    var composedParent = self.__calculateComposedParent(distributedNode);
                    assert(!!composedParent);
                    composedParent.__addComposedChildAt(distributedNode, getIndexInComposedParent(distributedNode));
                });
            }

            // 4. self.composedParent
            if (unEffectiveBefore) { //自己从无效变为有效，不再参与渲染
                if (self.__composedParent__) {
                    self.__composedParent__.__removeComposedChild(self);
                } // else: 孤立的slot刚被添加到shadowHost上，添加中还没计算其composedParent就向其assign node了，故之前没有composedParent
            }
        },
        /**
         * @param node
         * @param [willAssignAnother=false] {boolean} 若为true，表示马上会为node分配另一个assignedSlot，则此时不计算其composedParent
         */
        "__unAssignNode": function (node, willAssignAnother) {
            var self = this;
            var assignNodeIndex = self.__assignNodes__.indexOf(node);
            assert(assignNodeIndex > -1, "can't unAssign node from slot which is not assign to the slot");

            // 1. assignedSlot、assignNodes
            assert(node.__assignedSlot__ === self);
            node.__assignedSlot__ = null;
            self.__assignNodes__.splice(assignNodeIndex, 1);

            // 2. distributedNodes
            var nodeIsEffectiveSlot = node.tagName === "SLOT" && node.__isEffective();
            if (!nodeIsEffectiveSlot) {
                var distributedNodeIndex = self.__distributedNodes__.indexOf(node);
                assert(distributedNodeIndex > -1);
                self.__distributedNodes__.splice(distributedNodeIndex, 1);
            } else {
                assert(node.__distributedNodes__.length > 0);
                var oldDistributedNodes = self.__distributedNodes__;
                self.__distributedNodes__ = oldDistributedNodes.filter(function (distributedNode) {
                    return node.__distributedNodes__.indexOf(distributedNode) === -1;
                });
                assert(oldDistributedNodes.length - self.__distributedNodes__.length === node.__distributedNodes__.length);
            }

            // 3. node.composedParent
            if (!nodeIsEffectiveSlot) {
                node.__composedParent__.__removeComposedChild(node);
            } else {
                node.__distributedNodes__.forEach(function (distributedNode) {
                    distributedNode.__composedParent__.__removeComposedChild(distributedNode);
                });

                if (!willAssignAnother) {
                    node.__distributedNodes__.forEach(function (distributedNode) {
                        var composedParent = self.__calculateComposedParent(distributedNode);
                        assert(!!composedParent);
                        composedParent.__addComposedChildAt(distributedNode, getIndexInComposedParent(distributedNode));
                    });
                }
            }

            // 4. self.composedParent
            if (!self.__isEffective()) { //从有效变为无效，作为普通元素渲染
                var composedParent = self.__calculateComposedParent(self);
                if (composedParent) { //自己有可能没有composedParent(没有assignedSlot)
                    var index = getIndexInComposedParent(self);
                    assert(index <= composedParent.__composedChildren__.length);
                    composedParent.__addComposedChildAt(self, index);
                }
            }
        }
    });
});
define("boost/StyleSheet",function(require, exports, module) {
    "use strict";

    var DEVICE_PIXEL_RATIO = window.devicePixelRatio;
    var derive = require("base/derive");
    var trim = require("base/trim");
    var copyProperties = require("base/copyProperties");
    var hasOwnProperty = require("base/hasOwnProperty");
    var each = require("base/each");
    var slice = require("base/slice");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var PropertyChangeEvent = require("boost/PropertyChangeEvent");
    var validator = require("boost/validator");
    var validatorCache = require("boost/validatorCache");
    var toCamelCase = require("base/toCamelCase");
    var nativeVersion = require("boost/nativeVersion");

    var StyleSheet = derive(EventTarget, function () {
        //this._super();
        EventTarget.call(this);
        this.__styleProps__ = {};
    }, {

        //TODO
        // 现在的 cssText 是 Native 的格式，需要转换
        /*
         "get cssText": function () {
         return JSON.stringify(this.__getProps());
         },
         */
        "set cssText": function (value) {
            this.__styleProps__ = {};
            var list = String(value).split(";");
            var count = list.length;
            var index;
            var item;
            var parts;
            var key;

            for (index = 0; index < count; index++) {
                item = list[index];
                parts = item.split(":");
                key = toCamelCase(trim(parts[0]));
                this[key] = trim(parts[1]);
            }
        },
        __getProps: function () {
            return this.__styleProps__;
        },
        __onPropertyChange: function (key, value, origValue) {
            // nothing
        }
    });

    StyleSheet.createPropTypes = function ( /*base..., */ config) {
        var proto = {};
        var count = arguments.length;
        var index = 0;

        for (index = 0; index < count - 1; index++) {
            copyProperties(proto, arguments[index]);
        }

        config = arguments[index];

        each(config, function (array, key) {
            var curValidator = array[0];
            var defaultValue = array[1];

            //为了性能，直接从 __styleProps__ 获取值
            proto["get " + key] = function () {
                var value = hasOwnProperty(this.__styleProps__, key) ? this.__styleProps__[key] : "";
                return value;
            };

            proto["set " + key] = function (value) {
                var origValue = this.__styleProps__[key];
                //var event;

                if (!nativeVersion.shouldUseWeb()) {
                    var cachedValue = validatorCache.get(key, value);
                    if (cachedValue === undefined) {
                        //null对应css中取消设置该值, "auto"对应css中设置值为"auto"
                        if (value === null || value === "auto") {
                            value = defaultValue;
                        } else {
                            value = curValidator(value);
                        }
                        validatorCache.set(key, value, value);
                    } else {
                        value = cachedValue;
                    }
                }

                if (value !== origValue) {
                    this.__styleProps__[key] = value;
                    //改为直接的函数调用，提高性能
                    this.__onPropertyChange(key, value, origValue);
                    //event = new PropertyChangeEvent(this, key, value, origValue);
                    //this.dispatchEvent(event);
                }
            };
        });

        return proto;
    };

    module.exports = StyleSheet;

});
define("boost/TYPE_ID",function(require, exports, module) {
    module.exports = {
        LINKAGE: 16,
        FONT: 7,

        ANIMATION_SET: 12,
        PROP_ANIMATION: 11,

        ROOT_VIEW: 21,
        BOOST_PAGE: 20,
        DIALOG: 9,
        IMAGE: 2,
        LIST_VIEW: 28, //FIXME
        SCROLL_VIEW: 3,
        SLIDER: 4,
        VIEW: 0,
        TEXT: 1,
        TEXT_INPUT: 5,
        TOAST: 8,
        TOOL_BAR: 19,
        VIEW_PAGER: 15
    };
});
define("boost/Text",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var htmlEscape = require("base/htmlEscape");
    var NativeElement = require("boost/NativeElement");
    var TextStylePropTypes = require("boost/TextStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var TextStyle = derive(StyleSheet, TextStylePropTypes);

    var Text = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Text");
        NativeElement.call(this, TYPE_ID.TEXT, "Text");
    }, {
        __getStyle: function () {
            return new TextStyle();
        },
        "get value": function () {
            return this.__config__.value || "";
        },
        "set value": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                //这里为了与native统一，value中的空格与换行都按原样展示，用innerHTML并转义为html实体
                this.__native__.__webElement__.innerHTML = escapeValueInWeb(value);
            }
            this.__update("value", value);

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "value",
                attributeValue: value,
                propagationStoped: true
            });

            function escapeValueInWeb (value) {
                return htmlEscape(value)
                    .replace(/ /g, "&nbsp;")
                    .replace(/\n/g, "<br/>");
            }
        },
        "set numberOfLines": function (value) {
            this.__update("numberOfLines", validator.number(value));
        },
        "set multiline": function (value) {
            this.__update("multiline", validator.boolean(value));

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.style["display"] = "-webkit-box";
                this.__native__.__webElement__.style["-webkit-line-clamp"] = value === "false" ? 1 : "initial";
            }
        },
        "set ellipsize": function (value) {
            this.__update("ellipsize", validator.string(value));

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.style["-webkit-box-orient"] = "vertical";
            }
        },
        "get innerHTML": function () {
            return this.value;
        }
    });
    module.exports = Text;
});
define("boost/TextInput",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var TextStylePropTypes = require("boost/TextStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var validator = require("boost/validator");
    var Event = require("boost/Event");
    var TouchEvent = require("boost/TouchEvent");
    var FocusEvent = require("boost/FocusEvent");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");
    var boostEventGenerator = require("boost/boostEventGenerator");

    var TextStyle = derive(StyleSheet, TextStylePropTypes);

    var TextInput = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "TextInput");
        NativeElement.call(this, TYPE_ID.TEXT_INPUT, "TextInput");
        this.multiline = "false"; //FIXME: 由native设置默认值
    }, {
        __getStyle: function () {
            return new TextStyle();
        },
        __onEvent: function (type, e) {
            var event;
            switch (type) {
                case "focus":
                case "blur":
                    event = new FocusEvent(this, type);
                    this.dispatchEvent(event);
                    break;
                case "change":
                    this.__config__.value = e.data.text;
                    event = new Event(this, "change");
                    this.dispatchEvent(event);
                    break;
                case "submit":
                case "search":
                    event = new Event(this, "submit");
                    this.dispatchEvent(event);
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        "get value": function () {
            return this.__config__.value || "";
        },
        "set value": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.value = value;
            }
            this.__update("value", value);

            this.dispatchEvent({
                type: "attributeChange",
                attributeName: "value",
                attributeValue: value,
                propagationStoped: true
            })
        },
        "get editable": function () {
            return this.__config__.editable || true;
        },
        "set editable": function (value) {
            this.__update("editable", validator.boolean(value));
        },
        "get multiline": function () {
            return this.__config__.multiline || true;
        },
        "set multiline": function (value) {
            this.__update("multiline", validator.boolean(value));
        },
        "set type": function (value) {
            this.__config__.type = value;

            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.type = value;
                return;
            }

            switch (value) {
                case "text":
                    this.__update("keyboardType", validator.string("text"));
                    break;
                case "search":
                    this.__update("keyboardType", validator.string("web-search"));
                    break;
                case "number":
                    this.__update("keyboardType", validator.string("numeric"));
                    break;
                case "email":
                    this.__update("keyboardType", validator.string("email-address"));
                    break;
                case "url":
                    this.__update("keyboardType", validator.string("url"));
                    break;

                case "password":
                    this.__update("password", validator.boolean(value));
                    break;
            }
        },
        "get type": function () {
            return this.__config__.type;
        },
        "set numberOfLines": function (value) {
            this.__update("numberOfLines", validator.number(value));
        },
        "set placeholder": function (value) {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.placeholder = value;
            }

            this.__update("placeholder", validator.string(value));
        },
        "get placeholder": function (value) {
            return this.__config__.placeholder || "";
        },
        "set placeholderTextColor": function (value) {
            this.__update("placeholderTextColor", validator.color(value));
        },
        blur: function () {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.blur();
            }
            this.__native__.__callNative("blur", []);
        },
        focus: function () {
            if (nativeVersion.shouldUseWeb()) {
                this.__native__.__webElement__.focus();
            }
            this.__native__.__callNative("focus", []);
        },

        __createWebElement: function () {
            var input = document.createElement("input");

            input.addEventListener("focus", boostEventGenerator.genFromWebEvent);
            input.addEventListener("blur", boostEventGenerator.genFromWebEvent);
            input.addEventListener("change", boostEventGenerator.genFromWebEvent);
            input.addEventListener("input", detectChange);
            input.addEventListener("keyup", detectChange);
            //input.addEventListener("propertychange", detectChange);
            //input.addEventListener("change", detectChange);
            //input.addEventListener("click", detectChange);
            //input.addEventListener("paste", detectChange);
            input.addEventListener("keyup", function (e) {
                if (e.keyCode === 13) {
                    boostEventGenerator.genFromWebEvent(e, "submit");
                }
            });

            function detectChange (e) {
                var el = e.target;
                if (el.getAttribute("data-oldValue") !== el.value) {
                    el.setAttribute("data-oldValue", el.value);
                    boostEventGenerator.genFromWebEvent(e, "change");
                }
            }

            return input;
        }
    });
    module.exports = TextInput;
});
define("boost/TextStylePropTypes",function(require, exports, module) {
    "use strict";


    var StyleSheet = require("boost/StyleSheet");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var validator = require("boost/validator");

    var number = validator.number;
    var px = validator.px;
    var string = validator.string;
    var color = validator.color;
    var font = validator.font;
    var _enum = validator.oneOf;

    var TextStylePropTypes = StyleSheet.createPropTypes(LayoutPropTypes, {
        "color": [color, 0xff000000|0],
        //"fontFamily": string,
        "backgroundColor": [color, 0x00000000|0],
        "fontFamily": [font, "sans-serif"],
        "fontSize": [px, 14],
        "fontStyle": [_enum('normal', 'italic'), "normal"],
        "fontWeight": [_enum("normal", 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'), "normal"],
        "letterSpacing": [number, null], //TODO: 未在native代码中找到相应属性
        "lineHeight": [px, 0], //TODO: ok?
        "textAlign": [_enum("auto", 'left', 'right', 'center', 'justify'), "auto"],
        //"textDecorationColor": [string, "black"],
        //"textDecorationLine": [_enum("none", 'underline', 'line-through', 'underline line-through'), "none"],
        //"textDecorationStyle": [_enum("solid", 'double', 'dotted', 'dashed'), "solid"],
        "writingDirection": [_enum("auto", 'ltr', 'rtl'), "ltr"],
        "textDecoration": [_enum("none", "underline", "line-through"), "none"]
    });

    var unsupportedLayoutStyles = [
        "padding",
        "paddingLeft",
        "paddingRight",
        "paddingTop",
        "paddingBottom",
        "paddingHorizontal",
        "paddingVertical"
    ];
    unsupportedLayoutStyles.forEach(function (name) {
        delete TextStylePropTypes["set " + name];
        delete TextStylePropTypes["get " + name];
    });

    module.exports = TextStylePropTypes;
});
define("boost/Toast",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var TYPE_ID = require("boost/TYPE_ID");

    var Toast = derive(NativeElement, function (conf) {
        conf = conf || {};
        //this._super(NATIVE_VIEW_TYPE, "Toast");
        NativeElement.call(this, TYPE_ID.TOAST, "Toast");
        if (conf.duration) {
            this.duration = conf.duration;
        }
        if (conf.gravityVertical) {
            this.gravityVertical = conf.gravityVertical;
        }
        if (conf.gravityHorizontal) {
            this.gravityHorizontal = conf.gravityHorizontal;
        }
    }, {
        show: function () {
            this.nativeObject.__callNative("show", []);
        },
        cancel: function () {
            this.nativeObject.__callNative("cancel", []);
        },
        "get duration": function () {
            return this.__config__.duration;
        },
        "get gravityVertical": function () {
            return this.__config__.gravityVertical;
        },
        "get gravityHorizontal": function () {
            return this.__config__.gravityHorizontal;
        },
        "set duration": function (value) {
            assert(value === "long" || value === "short", "duration只能为long|short");
            this.__update("duration", value);
        },
        "set gravityVertical": function (value) {
            assert(value === "top" || value === "center" || value === "bottom", "gravityVertical只能为top|center|bottom");
            this.__update("gravityVertical", value);
        },
        "set gravityHorizontal": function (value) {
            assert(value === "left" || value === "center" || value === "right", "gravityHorizontal只能为left|center|right");
            this.__update("gravityHorizontal", value);
        }
    });
    module.exports = Toast;
});
//native版服务导航 TODO: 从boost基础库中抽离，改为用户自定义标签元素
define("boost/Toolbar",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var LayoutStyle = require("boost/LayoutStyle");
    var backgroundPage = require("boost/nativeObject/backgroundPage");
    var TYPE_ID = require("boost/TYPE_ID");

    var Toolbar = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "Toolbar");
        NativeElement.call(this, TYPE_ID.TOOL_BAR, "Toolbar");
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "openpage":
                    //外界不需关心，不向外派发，这里直接处理
                    backgroundPage.postMessage("openPage", e.data);
                    break;
                case "share":
                    this.dispatchEvent(new Event(this, "share"));
                    break;
                default:
                    NativeElement.prototype.__onEvent.call(this, type, e);
            }
            return event && event.propagationStoped;
        },
        __getStyle: function () {
            return new LayoutStyle();
        },
        //show之前应先setData
        setData: function (data) {
            this.__update("data", JSON.stringify(data));
        },
        show: function () {
            this.nativeObject.__callNative("showToolbar", []);
        },
        hide: function () {
            this.nativeObject.__callNative("hideToolbar", []);
        }
    });
    module.exports = Toolbar;
});
define("boost/TouchEvent",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var Event = require("boost/Event");

    var TouchEvent = derive(Event, function (target, type, x, y) {
        //this._super(target, type);
        Event.call(this, target, type);
        this.__x__ = x;
        this.__y__ = y;
    }, {

        "get x": function () {
            return this.__x__;
        },

        "get y": function () {
            return this.__y__;
        }
    });

    module.exports = TouchEvent;
});
define("boost/View",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeElement = require("boost/NativeElement");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var TYPE_ID = require("boost/TYPE_ID");

    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var View = derive(NativeElement, function () {
        //this._super(NATIVE_VIEW_TYPE, "View");
        NativeElement.call(this, TYPE_ID.VIEW, "View");
    }, {
        __getStyle: function () {
            return new ViewStyle();
        }
    });
    module.exports = View;
});
define("boost/ViewPager",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var each = require("base/each");
    var assert = require("base/assert");
    var NativeElement = require("boost/NativeElement");
    var Event = require("boost/Event");
    var ViewStylePropTypes = require("boost/ViewStylePropTypes");
    var StyleSheet = require("boost/StyleSheet");
    var ViewStyle = derive(StyleSheet, ViewStylePropTypes);
    var boolean = require("boost/validator").boolean;
    var number = require("boost/validator").number;
    var Linkage = require("boost/nativeObject/Linkage");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");
    var boostEventGenerator = require("boost/boostEventGenerator");

    var ViewPager = derive(NativeElement, function () {
        NativeElement.call(this, TYPE_ID.VIEW_PAGER, this.__getRealTagName());

        this.__currentItem__ = 0; //默认认为第一个元素被选中
    }, {
        /**
         * 子类扩展点
         * @returns {string}
         * @private
         */
        __getRealTagName: function () {
            return "ViewPager";
        },
        __onEvent: function (type, e) {
            switch (type) {
                case "selected":
                    var event = new Event(this, "selected");
                    event.data = { position: e.data.position };
                    this.dispatchEvent(event);

                    this.__currentItem__ = e.data.position;
                    break;
                case "pagescroll":
                    var event = new Event(this, "pagescroll");
                    event.stopPropagation(); //scroll不冒泡与捕获
                    event.data = {  }; //TODO
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
        setLinkage: function (linkage) {
            assert(linkage instanceof Linkage);
            this.nativeObject.__callNative("setLinkage", [linkage.tag]);
        },
        getCurrentItem: function () {
            return this.__currentItem__;
        },
        /**
         * @param index {int}
         * @param [smooth] {boolean}
         */
        setCurrentItem: function (index, smooth) {
            if (nativeVersion.shouldUseWeb()) {
                this.__showItemInWeb(index);
                //选中事件在o2o下由native派发，而web下自己派发
                boostEventGenerator.gen("selected", {position: index}, this.tag);
            } else {
                this.nativeObject.__callNative("setCurrentItem", [index, smooth || true]);
            }
            //真正对this.__currentItem__的修改在__onEvent里统一对web与o2o下进行
        },

        __createWebElement: function (info) {
            return document.createElement("div");
        },
        __addComposedChildAt: function (child, index) {
            if (nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.display = index === this.__currentItem__ ? "block" : "none";
            }
            NativeElement.prototype.__addComposedChildAt.call(this, child, index);
        },
        __removeComposedChildAt: function (index) {
            var child = this.__composedChildren__[index];
            if (child && nativeVersion.shouldUseWeb()) {
                child.nativeObject.__webElement__.style.display = "block";
            }
            NativeElement.prototype.__removeComposedChildAt.call(this, index);
        },
        __showItemInWeb: function (index) {
            assert(index < this.__children__.length, "index of item to show could not exceed the amount of children");
            assert(nativeVersion.shouldUseWeb());

            each(this.__children__, function (child, childIndex) {
                var childWebElement = child.__native__.__webElement__;
                childWebElement.style.display = childIndex === index ? "block" : "none";
            });
        }
    });
    module.exports = ViewPager;
});
define("boost/ViewStylePropTypes",function(require, exports, module) {
    "use strict";


    var StyleSheet = require("boost/StyleSheet");
    var LayoutPropTypes = require("boost/LayoutPropTypes");
    var validator = require("boost/validator");

    var number = validator.number;
    var px = validator.px;
    var string = validator.string;
    var color = validator.color;
    var _enum = validator.oneOf;

    var ViewStylePropTypes = StyleSheet.createPropTypes(LayoutPropTypes, {
        "backgroundColor": [color, 0x00000000|0],
        "alpha": [number, 1],
        //"overflow": [_enum('visible', 'hidden'), 'hidden'],
        //"shadowColor": color, //
        //"shadowOffset": { //
        //    "width": px,
        //    "height": px
        //},
        //"shadowOpacity": number, //
        //"shadowRadius": px, //}
    });

    module.exports = ViewStylePropTypes;

});
define("boost/boost",function(require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var each = require("base/each");
    var hasOwnProperty = require("base/hasOwnProperty");
    var assert = require("base/assert");
    var EventTarget = require("boost/EventTarget");
    var bridge = require("boost/bridge");
    var elementCreator = require("boost/elementCreator");
    var nativeVersion = require("boost/nativeVersion");

    var documentProto = {
        constructor: function () {
            //this._super();
            EventTarget.call(this);
            this.__docuemntElement__ = null;
            this.__documentElementZIndex__ = 0;
        },
        "get documentElement": function () {
            if (this.__docuemntElement__ === null) {
                this.__docuemntElement__ = this.addLayer(this.__documentElementZIndex__);

                this.dispatchEvent({
                    type: "documentElementCreated"
                });
            }
            return this.__docuemntElement__;
        },
        /**
         * @param tagName
         * @param [extraData]
         * @returns {Element}
         */
        createElement: function (tagName, extraData) {
            var element = elementCreator.create(tagName, extraData);

            this.dispatchEvent({
                type: "createElement",
                element: element
            });
            return element;
        },
        setDocumentElementLayerZIndex: function (zIndex) {
            assert(
                this.__docuemntElement__ === null,
                "boost.documentElement has already been created, zIndex can't effect.\n" +
                "Please set it before any visit of boost.documentElement"
            );
            this.__documentElementZIndex__ = zIndex;
        },
        addLayer: function (zIndex) {
            //var rootView = this.createElement("RootView", nativeVersion.inIOS() ? -8 : undefined); //TODO: support multi layer in ios
            var rootView = this.createElement("RootView"); //TODO: support multi layer in ios

            if (nativeVersion.shouldUseWeb()) {
                document.body.appendChild(rootView.__native__.__webElement__);
                rootView.__native__.__webElement__.style.zIndex = zIndex;
            } else {
                bridge.addLayer(rootView.tag, zIndex);
            }

            return rootView;
        },
        removeLayer: function (layer) {
            if (nativeVersion.shouldUseWeb()) {
                document.body.removeChild(layer.nativeObject.__webElement__);
            } else {
                bridge.removeLayer(layer.tag);
            }
            layer.destroy();
        }
    };

    function bridgeDocumentElement(obj, method) {
        obj[method] = function () {
            var documentElement = this.documentElement;
            return documentElement[method].apply(documentElement, arguments);
        };
    }

    bridgeDocumentElement(documentProto, "getElementById");
    bridgeDocumentElement(documentProto, "getElementsByClassName");
    bridgeDocumentElement(documentProto, "getElementsByTagName");
    bridgeDocumentElement(documentProto, "querySelector");
    bridgeDocumentElement(documentProto, "querySelectorAll");

    var BoostDocument = derive(EventTarget, documentProto);
    module.exports = new BoostDocument();
});
define("boost/boostEventGenerator",function(require, exports, module) {
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

        if (!target) {
            return;
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
define("boost/bridge",function(require, exports, module) {
    "use strict";

    var genQueue = require("boost/genQueue");
    var hasOwnProperty = require("base/hasOwnProperty");
    var copyProperties = require("base/copyProperties");
    var assert = require("base/assert");
    var methodMap = require("boost/methodMap");
    var nativeCallbackMap = require("boost/nativeCallbackMap");

    var queue = genQueue(function (list) {
        lc_bridge.callQueue(list);
    });
    queue.run();

    var interceptedCommandsCollector = null;
    //一定程度上可认为对应native的PageEntity
    var bridge = {
        /**
         * 截获之后的cmd至commandsCollector中
         * 被截获的命令将不再被执行
         * 最初应用：在ListView中生成命令并交给native以便其重复执行
         * @param commandsCollector
         */
        interceptCommands: function (commandsCollector) {
            assert(!interceptedCommandsCollector, "commands已被截获，暂不支持嵌套截获");
            interceptedCommandsCollector = [];
        },
        finishIntercept: function () {
            var result = interceptedCommandsCollector;
            interceptedCommandsCollector = null;
            return result;
        },

        /**
         * @param objId
         * @param methodName
         * @param params
         * @param [callback]
         */
        invoke: function (objId, methodName, params, callback) {
            var cmd = [objId, methodMap.tryGetMethodId(methodName), params];
            if (callback) {
                cmd.push(nativeCallbackMap.genCallback(callback));
            }
            if (interceptedCommandsCollector) {
                interceptedCommandsCollector.push(cmd);
                return;
            }

            queue.push(cmd);
        },

        create: function (typeId, objId, conf) {
            this.__invokeOnBridge("create", [objId, typeId, conf || {}]);
        },
        destroy: function (objId) {
            this.__invokeOnBridge("destroy", [objId]);
        },
        destroyAll: function () {
            this.__invokeOnBridge("destroyAll", []);
            queue.flush();
        },
        postMessage: function (message) {
            this.__invokeOnBridge("postMessage", [message]);
        },
        addLayer: function (layerId, zIndex) {
            this.__invokeOnBridge("addLayer", [layerId, zIndex]);
        },
        removeLayer: function (layerId) {
            this.__invokeOnBridge("removeLayer", [layerId]);
        },
        getMethodMapping: function () {
            //TODO: 拿到map后把bridge里已有cmd也更新为数字?
            this.__invokeOnBridge("getMethodMapping", [], function (obj) {
                if (obj.state === "success" && obj.data) {
                    console.log("methodMapping got", obj);
                    methodMap.setMap(obj.data);
                }
            });
            this.flush();
        },

        flush: function () {
            queue.flush();
        },

        //loading相关
        handleLoading: function () {
            this.__invokeOnBridge("handleLoading", [true]);
        },
        cancelHandleLoading: function () {
            this.__invokeOnBridge("handleLoading", [false]);
        },
        showLoading: function (text) {
            this.__invokeOnBridge("showLoading", [text || "正在加载..."]);
        },
        hideLoading: function () {
            this.__invokeOnBridge("hideLoading", []);
        },

        /**
         * @param methodName
         * @param params
         * @param [callback]
         * @private
         */
        __invokeOnBridge: function (methodName, params, callback) {
            this.invoke(0, methodName, params, callback);
        }
    };

    module.exports = bridge;

    //TODO: 合并命令(NativeElement中)：
    //var createHeap;
    //var updateHeap;
    //
    //function clearHeap() {
    //    createHeap = {};
    //    updateHeap = {};
    //}
    //
    //clearHeap();
    //switch (method) {
    //    case "createView":
    //        viewTag = "_" + args[0];
    //
    //        //将 config 参数存起来,方便 update 的时候改动
    //        config = copyProperties({}, args[2]);
    //        createHeap[viewTag] = config;
    //        args[2] = config;
    //        //args[2] = {};
    //        break;
    //
    //    case "updateView":
    //
    //        viewTag = "_" + args[0];
    //
    //        //如果 create 堆里有需要 update 的节点,则直接更新 config
    //        if (hasOwnProperty(createHeap, viewTag)) {
    //            copyProperties(createHeap[viewTag], args[2]);
    //            return;
    //        }
    //
    //        //如果 update 堆里有需要 update 的节点,则直接更新 config
    //        if (hasOwnProperty(updateHeap, viewTag)) {
    //            copyProperties(updateHeap[viewTag], args[2]);
    //            return;
    //        }
    //
    //        //将 config 参数存起来,方便下次 update 的时候改动
    //        config = copyProperties({}, args[2]);
    //        updateHeap[viewTag] = config;
    //        args[2] = config;
    //        //args[2] = {};
    //        break;
    //
    //    default:
    //    // nothing
    //}

});
define("boost/cache",function(require, exports, module) {
    "use strict";
    var derive = require("base/derive");
    var assert = require("base/assert");
    var type = require("base/type");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var nativeVersion = require("boost/nativeVersion");

    var SUPPORT_VERSION = 2.4; //TODO: 目前2.3开发中，还未支持，故先写为2.4
    var OBJ_ID = -10; //TODO: edit
    /**
     * 提供离线缓存的能力
     * 目前提供的接口比较简单粗暴
     */
    var OfflineCache = derive(NativeObject, function () {
        NativeObject.call(this, null, OBJ_ID);
    }, {
        /**
         * 增加规则
         *  string内的'*'字符可匹配任意子串
         *  string中可以使用"./"与"../"书写相对路径
         *  若string以'/'开头，表示从当前域根目录开始匹配
         *  若string以非"http://"或"https://"开头，表示从当前目录开始匹配
         * @param rule {string}
         */
        addRule: function (rule) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("addRule", [ruleToRegStr(rule)]);
        },
        /**
         * 删除规则
         * @param rule
         */
        removeRule: function (rule) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeRule", [ruleToRegStr(rule)]);
        },
        /**
         * 更新url对应的缓存内容
         * @param url
         */
        updateContent: function (url) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("updateContent", [url]);
        },
        /**
         * 删除url对应的缓存内容
         * @param url
         */
        removeContent: function (url) {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeContent", [url]);
        },
        /**
         * 删除所有缓存的内容
         * 注：目前会删除其他页面缓存的内容。后续需改良缓存方案以解决此问题
         */
        removeAllContent: function () {
            if (nativeVersion.get() < SUPPORT_VERSION) {
                return;
            }
            this.__callNative("removeAllContent", []);
        }
    });

    /**
     *  若string以'/'开头，表示从当前域根目录开始匹配
     *  若string以非"http://"或"https://"开头，表示从当前目录开始匹配
     *  string内的'*'字符可匹配任意子串
     *  string中可以使用"./"与"../"书写相对路径
     * @param rule
     * @returns {string}
     */
    function ruleToRegStr (rule) {
        var h = dropHash(location.href);
        var str = rule;

        //把所有./去掉
        str = str.replace(/(^|\/)\.\//g, "$1");

        //根目录补全
        if (str[0] === "/") {
            str = location.origin + str;
        }

        if (!/^https?:\/\//.test(str)) {
            //当前目录补全
            str = h.slice(0, h.lastIndexOf("/")) + "/" + str;
        } else {
            //去除hash部分
            str = dropHash(str);
        }

        //处理所有../
        str = str.replace(/\/([^\/]*)\/\.\.\//g, "/");

        //转义特殊字符
        //var reg = new RegExp(rule.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        //var reg = new RegExp(rule.replace(/([\.\?\+\$\^\[\]\(\)\{\}\|\\\/])/g, "\\$1"));
        //str = str.replace(/([\*\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, "\\$1");
        str = str.replace(/([\.\?\+\$\^\[\]\(\)\{\}\|\\])/g, "\\$1");

        var magicStr = "#LKDSJFOINJlkasdfjoi21223400asjdflkj";
        //处理** (这里将2个以上的*都处理掉)
        str = str.replace(/\*{2,}/g, "." + magicStr); //防止直接替换成*与用户写的*混淆，这里替换成一个临时魔术数

        //处理单个的*
        str = str.replace(/\*/g, "[^/]*");

        //将magicStr再换回*
        str = str.replace(magicStr, "*");

        //加^与$
        str = "^" + str + "$";

        //console.log(str);
        return str;
    }
    function dropHash (url) {
        if (url.indexOf("#") === -1) {
            return url;
        }
        return url.slice(0, url.indexOf("#"));
    }

    module.exports = new OfflineCache();
});
define("boost/elementCreator",function(require, exports, module) {
    var assert = require("base/assert");
    var hasOwnProperty = require("base/hasOwnProperty");
    var each = require("base/each");

    var tagMap = {};
    exports.register = function (tagName, options) {
        tagMap[tagName.toUpperCase()] = options.constructor;
    };
    exports.create = function (tagName, extraData) { //TODO: remove when ios support multi layer, this is just for that
        tagName = tagName.toUpperCase();
        assert(hasOwnProperty(tagMap, tagName), "unknow tag \"" + tagName + "\"");

        if (extraData) {
            return new tagMap[tagName](extraData);
        } else {
            return new tagMap[tagName]();
        }
    };
});
define("boost/fontSetter",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var tagMap = require("boost/tagMap");
    var each = require("base/each");
    var assert = require("base/assert");
    var FontNativeObject = require("boost/nativeObject/Font");
    var nativeVersion = require("boost/nativeVersion");

    //TODO: 是否有默认已加载的font？
    var createdFont = {}; //key为fontName 值为FontNativeObject
    var fontToApply = {}; //key为nativeObject.tag，值为fontName

    //TODO: 单独抽离出一个font对应的NativeObject，将现有的NativeObject分离出基类与ElementNativeObject
    module.exports = {
        setFont: function (nativeObject, fontName) {
            if (nativeVersion.shouldUseWeb()) { //web下不需操作
                return;
            }

            if (createdFont[fontName]) { //load过的，直接应用即可
                nativeObject.updateView("font", createdFont[fontName].tag);
                delete fontToApply[nativeObject.tag]; //之前待load的字体已失效
            } else { //未load的，先加入缓存，待load完再应用
                fontToApply[nativeObject.tag] = fontName;
            }
        },
        createFont: function (fontName, src) {
            if (nativeVersion.shouldUseWeb()) {
                var style = document.createElement("style");
                style.innerText = '@font-face { font-family: ' + fontName + '; src: url("' + src + '"); }';
                document.head.appendChild(style);
                return;
            }

            if (createdFont[fontName] && createdFont[fontName].src !== src) {
                console.warn("正在尝试对同一个fontFamily从两个url加载字体，不予生效！");
                return;
            }
            if (createdFont[fontName]) {
                return; //已创建，不再重复创建
            }

            createdFont[fontName] = new FontNativeObject(fontName, src);
            //创建后即可使用，应用之
            each(fontToApply, function (applyFontName, nativeObjectTag) {
                if (applyFontName === fontName) {
                    var nativeObject = tagMap.get(nativeObjectTag);
                    assert(!!nativeObject);
                    nativeObject.updateView("font", createdFont[fontName].tag);
                    delete fontToApply[nativeObjectTag];
                }
            });
        }
    };
});
define("boost/genQueue",function(require, exports, module) {
    "use strict";

    function genQueue(callback) {
        var running = false;
        var waiting = false;
        var list = [];
        var timeFlag = null;
        var TIME_OUT = 1;

        function push(obj) {
            list.push(obj);
            if (running) {
                run();
            }
        }

        function run() {
            running = true;
            if (waiting) {
                return;
            }
            waiting = true;
            timeFlag = setTimeout(call, TIME_OUT);
        }

        function stop() {
            clearTimeout(timeFlag);
            waiting = false;
            running = false;
        }

        function call() {
            if (list.length > 0) {
                callback(list);
                list = [];
            }
            waiting = false;
        }


        function flush() {
            clearTimeout(timeFlag);
            call();
        }

        return {
            push: push,
            run: run,
            stop: stop,
            flush: flush
        };
    }

    module.exports = genQueue;
});
define("boost/mainFrontPage",function(require, exports, module) {
    "use strict";

    //TODO: change name to frontPage?
    var derive = require("base/derive");
    var assert = require("base/assert");
    var BoostPage = require("boost/BoostPage");
    var ElementNativeObject = require("boost/nativeObject/Element");

    var FRONTPAGE_OBJ_ID = -2;
    /**
     * 背景页中：对应o2o打开时背景页中由native创建的主/默认前景页
     * 前景页中：对应本页面的boostPage
     */
    var MainFrontPage = derive(BoostPage, function () {
        BoostPage.call(this);
    }, {
        __createView: function(type) {
            var self = this;
            var nativeObj = self.__native__ = new ElementNativeObject(type, FRONTPAGE_OBJ_ID);
            nativeObj.__onEvent = function(type, e) {
                return self.__onEvent(type, e);
            };
        }
    });

    module.exports = new MainFrontPage();
});
//FIXME: 与main.js重复，目前本文件在服务导航中使用，后续若有必要，迁移时注意回归
define("boost/mainModule",function(require, exports, module) {
    //加载必需被加载(其内监听事件、发起主动动作)的文件
    //FIXME: 换用boost/main.js 打包时打在一起
    require("boost/nativeEventHandler");
    require("boost/bridge");

    var tagMap = require("boost/tagMap");
    var mainFrontPage = require("boost/mainFrontPage");
    tagMap.set(-2, mainFrontPage); //目前BoostPage的onResume中向主页面发送事件使用 FIXME: -2 与mainFrontPage中重复
});
define("boost/methodMap",function(require, exports, module) {
    var inDebug = true;

    var map = {
        add: 20,
        addLayer: 118,
        addPoint: 160,
        addView: 146,
        blur: 163,
        canGoBackOrForward: 126,
        cancel: 121,
        captureAudio: 99,
        captureImage: 100,
        captureVideo: 101,
        closeSlider: 173,
        create: 3,
        destroy: 4,
        destroyAll: 5,
        directShare: 117,
        dismiss: 184,
        dismissMenu: 127,
        dopay: 107,
        exit: 1,
        focus: 164,
        followSite: 108,
        get: 102,
        getClientHeight: 30,
        getClientLeft: 31,
        getClientTop: 32,
        getClientWidth: 33,
        getLocationCityName: 12,
        getMethodMapping: 6,
        getNativeLayerSize: 13,
        getPicture: 98,
        getSubscribedAppinfos: 109,
        getUniqueId: 110,
        goBackOrForward: 128,
        goBack: 1128,
        handleLoading: 148,
        hideInputMethod: 14,
        hideLoading: 149,
        hideToolbar: 175,
        isBind: 111,
        isLogin: 89,
        jsHandleBack: 2,
        loadUrl: 129,
        login: 90,
        postMessage: 119,
        querySubscribe: 15,
        registerMulticast: 112,
        registerUnicast: 113,
        reload: 130,
        remove: 21,
        removeLayer: 120,
        removeViewAt: 147,
        scrollBy: 170,
        scrollTo: 171,
        seekToAudio: 91,
        setAlignItems: 151,
        setAlignSelf: 34,
        setAlpha: 35,
        setBackgroundColor: 36,
        setBorderBottomColor: 37,
        setBorderBottomLeftRadius: 38,
        setBorderBottomRightRadius: 39,
        setBorderBottomWidth: 40,
        setBorderColor: 41,
        setBorderLeftColor: 42,
        setBorderLeftWidth: 43,
        setBorderRadius: 44,
        setBorderRightColor: 45,
        setBorderRightWidth: 46,
        setBorderTopColor: 47,
        setBorderTopLeftRadius: 48,
        setBorderTopRightRadius: 49,
        setBorderTopWidth: 50,
        setBorderWidth: 51,
        setBottom: 52,
        setCancelable: 185,
        setCanceledOnTouchOutside: 186,
        setColor: 133,
        setCurrentItem: 178,
        setData: 176,
        setDefaultSource: 123,
        setDragBounds: 161,
        setDragMode: 162,
        setDuration: 8,
        setEasing: 9,
        setEditable: 165,
        setEllipsize: 134,
        setFlex: 53,
        setFlexDirection: 152,
        setFlexWrap: 153,
        setFont: 135,
        setFontFamily: 136,
        setFontSize: 137,
        setFontStyle: 138,
        setFontWeight: 139,
        setFrom: 22,
        setFromColor: 23,
        setGravityHorizontal: 181,
        setGravityVertical: 182,
        setHeight: 54,
        setJustifyContent: 154,
        setKeyboardType: 166,
        setLeft: 55,
        setLineHeight: 140,
        setLinkage: 172,
        setLoop: 179,
        setLoopScrollDuration: 180,
        setMargin: 56,
        setMarginBottom: 57,
        setMarginLeft: 58,
        setMarginRight: 59,
        setMarginTop: 60,
        setMaxHeight: 61,
        setMaxLines: 141,
        setMaxSlideWidth: 174,
        setMaxWidth: 62,
        setMinHeight: 63,
        setMinWidth: 64,
        setMultiline: 142,
        setNumberOfLines: 143,
        setPadding: 155,
        setPaddingBottom: 156,
        setPaddingLeft: 157,
        setPaddingRight: 158,
        setPaddingTop: 159,
        setPassword: 167,
        setPlaceholder: 168,
        setPlaceholderTextColor: 169,
        setPosition: 65,
        setProp: 24,
        setRepeatCount: 122,
        setResizeMode: 124,
        setRight: 66,
        setScaleX: 67,
        setScaleY: 68,
        setSelectorBackgroundColor: 69,
        setSelectorBorderBottomColor: 70,
        setSelectorBorderBottomLeftRadius: 71,
        setSelectorBorderBottomRightRadius: 72,
        setSelectorBorderBottomWidth: 73,
        setSelectorBorderColor: 74,
        setSelectorBorderLeftColor: 75,
        setSelectorBorderLeftWidth: 76,
        setSelectorBorderRadius: 77,
        setSelectorBorderRightColor: 78,
        setSelectorBorderRightWidth: 79,
        setSelectorBorderTopColor: 80,
        setSelectorBorderTopLeftRadius: 81,
        setSelectorBorderTopRightRadius: 82,
        setSelectorBorderTopWidth: 83,
        setSelectorBorderWidth: 84,
        setSource: 125,
        setStartOffset: 10,
        setTarget: 11,
        setTextAlign: 144,
        setTo: 25,
        setToColor: 26,
        setTop: 85,
        setTranslationX: 86,
        setTranslationY: 87,
        setType: 27,
        setUpdateColor: 28,
        setUrl: 29,
        setValue: 145,
        setVolume: 92,
        setWidth: 88,
        shareApp: 16,
        show: 183,
        showInputMethod: 17,
        showLoading: 150,
        showMenu: 131,
        showToolbar: 177,
        speedFF: 93,
        start: 103,
        startListen: 105,
        startPlayingAudio: 94,
        startRecordingAudio: 95,
        stop: 104,
        stopListen: 106,
        stopPlayingAudio: 96,
        stopRecordingAudio: 97,
        subscribe: 18,
        unSubscribeLight: 114,
        unregisterMulticast: 115,
        unregisterUnicast: 116,
        unsubscribe: 19,
        update: 7,
        updateMenu: 132
    };

    if (inDebug) {
        console.warn("in debug, use string");
        map = {};
    }

    exports.tryGetMethodId = function (methodName) {
        return map[methodName] || methodName;
    };
    exports.setMap = function (newMap) {
        map = newMap;
    };
});
define("boost/nativeCallbackMap",function(require, exports, module) {
    var tagMap = require("boost/tagMap");

    /**
     * @param {Function} callback
     * @returns {int} callbackId
     */
    exports.genCallback = function (callback) {
        var callbackId = tagMap.genTag();
        tagMap.set(callbackId, callback);
        return callbackId;
    };
    exports.get = function (callbackId) {
        return tagMap.get(callbackId);
    };
});
define("boost/nativeEventHandler",function(require, exports, module) {
    var nativeCallbackMap = require("boost/nativeCallbackMap");
    var tagMap = require("boost/tagMap");
    var lightApi = require("boost/nativeObject/lightApi");
    var bridge = require("boost/bridge");
    var assert = require("base/assert");
    var boostEventGenerator = require("boost/boostEventGenerator");

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
            //console.error("unregistered callbackId:", callbackId);
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

    document.addEventListener("touchstart", boostEventGenerator.genFromWebEvent);
    document.addEventListener("touchend", boostEventGenerator.genFromWebEvent);

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
define("boost/nativeObject/Element",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var toCamelCase = require("base/toCamelCase");
    var TYPE_ID = require("boost/TYPE_ID");
    var nativeVersion = require("boost/nativeVersion");

    var ElementNativeObject = derive(NativeObject, function (typeId, objId, nativeElement, webElementCreator) {
            NativeObject.call(this, typeId, objId);
            this.__nativeElement__ = nativeElement;

            if (nativeVersion.shouldUseWeb()) {
                var info = {
                    objId: this.__tag__
                };
                if (webElementCreator) {
                    this.__webElement__ = webElementCreator(info);
                } else {
                    this.__webElement__ = this.__createWebElement(info);
                }
                this.__webElement__.__boost_origin__ = this.__tag__;
            }
        },
        {
            __createWebElement: function () {
                return document.createElement("div");
            },
            addView: function (child, index) {
                if (nativeVersion.shouldUseWeb()) {
                    var el = this.__webElement__;
                    var referEl = this.__webElement__.childNodes[index];
                    var childEl = child.__native__.__webElement__;
                    if (index === el.childNodes.length) {
                        el.appendChild(childEl);
                    } else {
                        assert(!!referEl);
                        el.insertBefore(childEl, referEl);
                    }
                } else {
                    this.__callNative("addView", [child.__native__.__tag__, index]);
                }
            },

            updateView: function (key, value) {
                this.__callNative("set" + toCamelCase(key, true), [value]);
            },

            removeViewAt: function (index) {
                if (nativeVersion.shouldUseWeb()) {
                    this.__webElement__.removeChild(this.__webElement__.childNodes[index]);
                } else {
                    this.__callNative("removeViewAt", [index]);
                }
            },

            "get element": function () {
                return this.__nativeElement__;
            }
        }
    );

    module.exports = ElementNativeObject;
});
define("boost/nativeObject/Font",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var toCamelCase = require("base/toCamelCase");
    var TYPE_ID = require("boost/TYPE_ID");

    var FontNativeObject = derive(NativeObject, function (fontName, src) {
        this.__fontName = fontName;
        this.__src = src;
        NativeObject.call(this, TYPE_ID.FONT, undefined, { url: this.__src });
    }, {
        "get src": function () {
            return this.__src;
        },
        "get fontName": function () {
            return this.__fontName;
        }
    });

    module.exports = FontNativeObject;
});
define("boost/nativeObject/Linkage",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var copyProperties = require("base/copyProperties");
    var NativeElement = require("boost/NativeElement");
    var validator = require("boost/validator");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var TYPE_ID = require("boost/TYPE_ID");

    /**
     * 联动器
     * @param conf.prop {string} 支持各数值属性与颜色属性（color|backgroundColor）
     * @param conf.from {number | color}
     * @param conf.to {number | color}
     * @param conf.target {NativeElement}
     * @param conf.duration {number}
     * @param conf.type {"together"|"sequentially"}
     */
    var LinkageNativeObject = derive(NativeObject, function (conf) {
        conf = copyProperties({}, conf);
        if (conf.target) {
            assert(conf.target instanceof NativeElement);
            conf.target = conf.target.nativeObject.tag;
        }

        var colorProps = ["color", "backgroundColor"];
        if (colorProps.indexOf(conf.prop) > -1) {
            //isColor
            conf.updateColor = true;
            conf.fromColor = validator.color(conf.from);
            conf.toColor = validator.color(conf.to);
            delete conf.from;
            delete conf.to;
        }

        NativeObject.call(this, TYPE_ID.LINKAGE, undefined, conf);

        this._curIndex = 0;
    }, {
        addLinkage: function (linkage) {
            assert(linkage instanceof  LinkageNativeObject);
            this.__callNative("add", [linkage.tag, this._curIndex++]);
        }
    });

    module.exports = LinkageNativeObject;
});
define("boost/nativeObject/NativeObject",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var slice = require("base/slice");
    var EventTarget = require("boost/EventTarget");
    var tagMap = require("boost/tagMap");
    var bridge = require("boost/bridge");
    var toCamelCase = require("base/toCamelCase");
    var nativeVersion = require("boost/nativeVersion");

    var NativeObject = derive(
        EventTarget,
        /**
         * @param typeId
         * @param [objId]
         * @param [conf]
         */
        function(typeId, objId, conf) {
            assert(tagMap.get(objId) === null, objId + " already exist");
            EventTarget.call(this);
            if (objId === undefined) {
                objId = tagMap.genTag();
            }

            tagMap.set(objId, this);
            this.__tag__ = objId;

            if (objId > 1 && !nativeVersion.shouldUseWeb()) { //TODO: 要这样来过滤吗？0为rootElement、1为nativeGlobal、负数为已有对象
                bridge.create(typeId, this.__tag__, conf);
            }
        }, {
            "get tag": function() {
                return this.__tag__;
            },

            destroy: function() {
                bridge.destroy(this.__tag__);
            },

            /**
             * @param method {string}
             * @param args {Array}
             * @param callback
             * @private
             */
            __callNative: function(method, args, callback) {
                bridge.invoke(this.__tag__, method, args, callback);
            },

            /**
             * @param type
             * @param event
             * @private
             * @returns {boolean} 事件是否被取消掉
             *  为了构造click事件的地方能拿到touchstart/touchend是否被取消进而作为是否产生click的判断依据，通过此方法返回
             *  子类必需记得返回此值！
             */
            __onEvent: function(type, event) {
                //do nothing
                return event && event.propagationStoped;
            }
        }
    );


    NativeObject.bindNative = function(method) {
        return function() {
            this.__callNative(method, slice(arguments));
        };
    };

    var GLOBAL_TAG = null;
    var GLOBAL_OBJ_ID = 1;
    var NativeGlobalObject = derive(NativeObject, function() {
        //this._super(GLOBAL_TAG);
        NativeObject.call(this, GLOBAL_TAG, GLOBAL_OBJ_ID);
    }, {
        createAnimation: NativeObject.bindNative("createAnimation"), //TODO: remove
        startAnimation: NativeObject.bindNative("startAnimation"), //TODO: remove
        cancelAnimation: NativeObject.bindNative("cancelAnimation"), //TODO: remove
        //FOR TEST
        test: NativeObject.bindNative("test"), //TODO: remove

        //__destroy: NativeObject.bindNative("destroy"),
        destroyObject: function(tag) {
            this.__destroy(tag);
        }
    });

    var nativeGlobal = new NativeGlobalObject();
    NativeObject.global = nativeGlobal;

    NativeObject.getByTag = function(tag) {
        var obj = tagMap.get(tag);
        if (obj !== null && obj instanceof NativeObject) {
            return obj;
        }
        return null;
    };

    module.exports = NativeObject;
});
define("boost/nativeObject/backgroundPage",function(require, exports, module) {
    "use strict";

    //TODO: 限制只有特定代码才能使用. TODO: 要不要继承自BoostPage
    var derive = require("base/derive");
    var assert = require("base/assert");
    var bridge = require("boost/bridge");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var Event = require("boost/Event");
    var mainFrontPage = require("boost/mainFrontPage");

    var BACKGROUND_PAGE_OBJ_ID = -1;
    /**
     * 供前景页用作与背景页通信的中介（向背景页发送消息，监听背景页发来的消息）
     * 也可用作背景页自己操作自己的boostPage
     */
    var BackgroundPageNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, BACKGROUND_PAGE_OBJ_ID);
    }, {
        __onEvent: function (type, e) {
            switch (type) {
                case "back":
                    this.dispatchEvent(new Event(this, "back"));
                    break;
                case "closepage":
                    this.dispatchEvent(new Event(this, "closepage"));
                    break;
                case "resume":
                    this.dispatchEvent(new Event(this, "resume"));
                    break;
                default:
                    console.log("unknow event:" + type, e);
            }
            return event && event.propagationStoped;
        },

        /**
         * @param url
         * @param [useMiddlePage] {boolean}
         * @param [tipText]
         * @param [delay] {number} 毫秒为单位
         */
        openNewPage: function (url, useMiddlePage, tipText, delay) {
            var data = {
                url: completeUrl(url),
                useMiddlePage: useMiddlePage,
                tipText: tipText,
                delay: delay
            };
            this.postMessage("openPage", data);
        },
        openNewPageFromBg: function (url) {
            assert(/^https?:\/\//.test(url), "背景页打开新页面，必需传入完整url");
            mainFrontPage.dispatchEvent({
                type: "message",
                data: {
                    action: "openPage",
                    data: {
                        url: url
                    }
                }
            });
        },
        postMessage: function (action, data) {
            bridge.postMessage({
                action: action,
                data: data
            });
        },
        jsHandleBack: function () {
            this.__callNative("jsHandleBack", [true]);
        },
        exit: function () {
            this.__callNative("exit", []);
        }
    });

    module.exports = new BackgroundPageNativeObject();

    function completeUrl (inValue) {
        if (/^https?:\/\//.test(inValue)) {
            return inValue;
        }

        if (inValue[0] === "/") {
            return location.origin + inValue;
        }

        var h = location.href;
        return h.slice(0, h.lastIndexOf("/")) + "/" + inValue.slice(1);
    }
});
define("boost/nativeObject/lightApi",function(require, exports, module) {
    //TODO: 改名: commonUtil
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var NativeObject = require("boost/nativeObject/NativeObject");
    var nativeVersion = require("boost/nativeVersion");

    var OBJ_ID = -7;
    /**
     * 供背景页用作与前景页通信的中介（向前景页发送消息，监听前景页发来的消息）
     */
    var LightApiNativeObject = derive(NativeObject, function () {
        NativeObject.call(this, null, OBJ_ID);
    }, {
        __onEvent: function (type, event) {
            switch (type) {
                case "subscribe":
                case "unsubscribe":
                case "subscribestate":
                    this.dispatchEvent({
                        type: type,
                        data: event.data
                    });
                    break;
            }
            return event && event.propagationStoped;
        },
        follow: function (conf, callback) {
            this.__callNative("subscribe", [conf], callback);
        },
        unfollow: function (conf, callback) {
            this.__callNative("unsubscribe", [conf], callback);
        },
        checkFollow: function (conf, callback) {
            this.__callNative("querySubscribe", [conf], callback);
        },
        /**
         * @param conf
         * @param [callback]
         */
        share: function (conf, callback) {
            var data = {
                title: conf.title,
                url: conf.linkUrl,
                content: conf.content,
                weixin_send_url: true,
                share_type: 0, //mediaType不生效，全为0
                weibo_title: conf.title,
                weixin_title: conf.title,
                weixin_timeline_title: conf.title,
                weixin_description: conf.content,
                thumb_img_url: conf.imageUrl,
                img_url: conf.imageUrl
            };
            if (nativeVersion.get() < 2.3) {
                this.__callNative("shareApp", [data]);
            } else {
                //2.3之后支持了回调
                this.__callNative("shareApp", [data], callback || function () {});
            }
        },
        IMConsult: function (conf) {
            this.__callNative("consult", [conf], function () {});
        },

        showInputMethod: function () {
            this.__callNative("showInputMethod", []);
        },
        hideInputMethod: function () {
            this.__callNative("hideInputMethod", []);
        },
        getO2OWindowSize: function (callback) {
            this.__callNative("getNativeLayerSize", [], callback);
        },
        getLocatedCity: function (callback) {
            if (nativeVersion.shouldUseWeb()) {
                callback({
                    state: "fail",
                    info: "not in o2o"
                });
            } else {
                this.__callNative("getLocationCityName", [], callback);
            }
        },

        /**
         * 只应由背景页调用
         * 用于通知native背景页ready了
         * 背景：开始没网时，背景页与前景页都加载失败，但有网后点击刷新如果只刷新前景页则背景页仍然不出现导致前景页打开新页面等功能不能被响应
         * 故背景页ready后通知native，native在刷新前景页且背景页没有ready时同时刷新背景页
         * add at v2.3
         */
        setBackgroundPageReady: function () {
            if (nativeVersion.inAndroid()) {
                this.__callNative("setBackgroundPageReady", [true]);
            }
        }
    });

    module.exports = new LightApiNativeObject();
});
define("boost/nativeVersion",function(require, exports, module) {
    var reg = /BaiduRuntimeO2OZone\/(\d\.\d)/;
    var regResult = reg.exec(navigator.userAgent);
    var version = 0;
    if (regResult) {
        version = regResult[1];
    }

    //FIXME: this is just for debug in ios
    var inIOS = location.hash === "#ios";
    if (inIOS) {
        version = 2.3;
    }

    /**
     * @returns {Number} 两位版本。若不在o2o下，返回0
     */
    exports.get = function () {
        return parseFloat(version);
    };
    exports.shouldUseWeb = function () {
        return this.get() < 2.2;
    };
    exports.inIOS = function () {
        return inIOS;
    };
    exports.inAndroid = function () {
        return !this.shouldUseWeb() && !this.inIOS();
    };
    exports.inNative = function () {
        return !this.shouldUseWeb();
    };

    exports.inBox = function () {
        return this.get() == 2.3; //TODO: 暂时用此来判断2.3
    };
});
define("boost/shadowDomUtil/compareElementOrder",function(require, exports, module) {
    var assert = require("base/assert");

    /**
     * 比较两个元素在树中的顺序（深度优先先根前序）
     * 若a先于b，返回-1
     * 若b先于a，返回1
     * 否则(a与是同一个节点或两者不在同一棵树上)返回0
     * @param a
     * @param b
     * @return {int}
     */
    module.exports = function (a, b) {
        if (!a || !b || a === b) {
            return 0;
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
            return 0;
        }

        do {
            curA = aAncestors.pop();
            curB = bAncestors.pop();
        } while (curA === curB);

        if (!curA) {
            //a是b的祖先
            return -1;
        }
        if (!curB) {
            //b是a的祖先
            return 1;
        }

        //curA与curB是兄弟
        assert(curA.parentNode === curB.parentNode, "logic error: curA and curB should be brothers");
        var parent = curA.parentNode;
        var indexA = parent.__children__.indexOf(curA);
        var indexB = parent.__children__.indexOf(curB);
        return indexA < indexB ? -1 : 1;
    };
});
define("boost/shadowDomUtil/getIndexInComposedParent",function(require, exports, module) {
    var assert = require("base/assert");
    //FIXME: 可与__calculateComposedParent合并逻辑
    /**
     * @pre curNode的assignedSlot链已计算完
     * @param node
     * @returns {number}
     */
    module.exports = function (node) {
        var preNodeAmount = 0;
        for (var curNode = node; curNode.__assignedSlot__; curNode = curNode.__assignedSlot__) {
            preNodeAmount += getOlderBrothersNodeAmount(curNode.__assignedSlot__.__assignNodes__, curNode);
        }
        preNodeAmount += getOlderBrothersNodeAmount(curNode.parentNode.childNodes, curNode);
        return preNodeAmount;
    };

    function getOlderBrothersNodeAmount (siblings, curNode) {
        var result = 0;
        var curNodeIndex = siblings.indexOf(curNode);
        assert(curNodeIndex > -1);
        var olderBrothers = siblings.slice(0, curNodeIndex);
        olderBrothers.forEach(function (olderBrother) {
            result += getTotalNodeAmount(olderBrother);
        });
        return result;
    }
    function getTotalNodeAmount (node) {
        if (node.tagName !== "SLOT" || !node.__isEffective()) {
            return 1;
        }

        return node.__distributedNodes__.length;
    }
});
/**
 * @file isolated from boost/xml.js
 */
define("boost/styleRender",function(require, exports, module) {
    var assert = require("base/assert");
    var derive = require("base/derive");
    var each = require("base/each");
    var trim = require("base/trim");
    var copyProperties = require("base/copyProperties");
    var toCamelCase = require("base/toCamelCase");
    var fontSetter = require("boost/fontSetter");

    var StyleParser = derive(Object, function () {
        this._code = null;
        this._codeChar = null;
        this._index = 0;
        this._count = 0;
    }, {
        /**
         * @param str {string}
         * @param ret {Array} 返回值收集器
         * @returns {Array}
         */
        parse: function (str, ret) {
            this._code = this.preProcess(str);
            this._codeChar = this._code.split("");
            this._index = 0;
            this._count = this._codeChar.length;
            var selector;
            var rule;

            ret = ret || [];
            while (true) {
                this.ignoreWhiteSpace();
                selector = this.getSelector();
                rule = this.getRule();

                //TODO: 抽离出对@的统一处理
                if (selector === "@font-face") {
                    assert(!!rule.src, "@font-face should declare src");
                    assert(!!rule.fontFamily, "@font-face should declare font-family");
                    var fontUrl;

                    var assetsRegResult = /^\s*['"](assets!.*)['"]/.exec(rule.src);
                    if (assetsRegResult && assetsRegResult[1]) { //TODO: 统一使用url，不增加特殊处理。现在是跳不过fis的替换。。。
                        fontUrl = assetsRegResult[1];
                    } else { //url
                        var fontUrlReg = /^\s*url\(['"](.+)['"]\)/;
                        var fontUrlMatchResult = fontUrlReg.exec(rule.src);
                        fontUrl = fontUrlMatchResult && fontUrlMatchResult[1];
                        assert(!!fontUrl, "src of @font-face should match " + fontUrlReg.toString());
                    }

                    fontSetter.createFont(rule.fontFamily, fontUrl);
                    continue;
                }

                if (selector && rule) {
                    ret.push({
                        selector: selector,
                        rule: rule
                    });
                    continue;
                }
                break;
            }

            return ret;
        },
        preProcess: function (str) {
            return str.replace(/\/\*[\s\S]*?\*\//g, "");
        },
        ignoreWhiteSpace: function () {
            var count = this._count;
            var _codeChar = this._codeChar;
            var code;
            var index;

            for (index = this._index; index < count; index++) {
                code = _codeChar[index];
                if (code !== " " && code !== "\t" && code !== "\r" && code !== "\n") {
                    break;
                }
            }
            this._index = index;
        },
        getSelector: function () {
            var code = this._code;
            var end = code.indexOf("{", this._index);
            var selector;
            if (end < 0) {
                this.end();
                return false;
            }
            selector = code.substring(this._index, end);
            this._index = end;
            return trim(selector);
        },
        getRule: function () {
            var code = this._code;
            var index = this._index;
            var start = code.indexOf("{", index);
            var end;

            if (start < 0) {
                this.end();
                return false;
            }

            end = code.indexOf("}", start);
            if (end < 0) {
                this.end();
                return false;
            }

            this._index = end + 1;
            return this.parseRule(code.substring(start + 1, end));
        },
        parseRule: function (str) {
            var list = str.split(";");
            var count = list.length;
            var index;
            var item;
            var parts;
            var key;
            var ret = {};

            for (index = 0; index < count; index++) {
                item = list[index];
                parts = item.split(":");
                if (parts.length > 1) {
                    key = toCamelCase(trim(parts.shift()));
                    ret[key] = trim(parts.join(':'));
                }
            }
            return ret;
        },
        end: function () {
            this._index = this._count;
        }
    });

    /**
     * @constructor
     */
    function StyleRender () {
    //function StyleRender (xmlParser) {
        //this._xmlParser = xmlParser;
        this._parser = new StyleParser();
        this._ruleList = [];
    }
    StyleRender.prototype = {
        parse: function (str) {
            this._parser.parse(str, this._ruleList);
        },

        /**
         * FIXME: 本方法调用时机需要再斟酌~ 目前是在innerHTML、outerHTML改变时调用（因给用户的可parse一断内容的接口只有这两个）。但append、removeChild时并不会（如果也调就太频繁了）
         * @param rootElement {Element}
         */
        apply: function (rootElement) {
            var self = this;
            each(self._ruleList, function (item) {
                var selector = item.selector;
                var elements = rootElement.querySelectorAll(selector);

                if (self._satisfySelector(rootElement, selector)) {
                    elements.push(rootElement);
                }

                ////过滤掉自定义handler返回的节点不渲染
                //elements = elements.filter(function (element) {
                //    return !self._xmlParser.fromCustomHandler(element, rootElement);
                //});

                each(elements, function (element) {
                    self._applyRule(element, item.rule);
                });
            });
        },

        /**
         * 只(更新)渲染一个元素
         * @param element {Element}
         */
        applyOnOne: function (element) {
            var self = this;
            each(self._ruleList, function (item) {
                var selector = item.selector;
                if (self._satisfySelector(element, selector)) {
                    self._applyRule(element, item.rule);
                }
            });
        },

        _applyRule: function (element, rule) {
            copyProperties(element.style, rule);

            //保存以供_clearStyle中使用
            if (!element.__ruleFromStyleRender__) { element.__ruleFromStyleRender__ = {}; } //TODO: 在Element定义属性
            //TODO: 后续应考虑将元素不同来源比如cssRender与style对象甚至不同选择器应用上的样式都记录。综合按权重生效。不过也看效率与功能权衡
            copyProperties(element.__ruleFromStyleRender__, rule);
        },

        /**
         * 手动清除一个元素身上被本styleRender渲染上的样式规则
         * 目前因元素样式没有保留所有来源的规则再按优先级指定生效，故可能会清除掉非本styleRender（如js操作的）的样式
         * TODO 后续应考虑按选择器、内联（直接style属性或js操作style）分别记录并清除、并应适时自动clear
         * @param element
         */
        clearStyle: function (element) {
            each(element.__ruleFromStyleRender__, function (ruleValue, ruleName) {
                element.style[ruleName] = null;
            });
        },

        /**
         * TODO: 应由Element.js提供本功能
         * @param element
         * @param selector {string} 可含单元素选择器及','与' '
         * @return {Boolean}
         */
        _satisfySelector: function (element, selector) {
            var selectors = selector.split(',');
            var matchLast = false;
            for (var cur = selectors.pop(); !matchLast && cur; cur = selectors.pop()) {
                matchLast = this._satisfySingleSelector(element, cur);
            }
            return matchLast;
        },
        /**
         * @param element
         * @param singleSelector {string} 可含单元素选择器与' '，不可含','
         * @private
         */
        _satisfySingleSelector: function (element, singleSelector) {
            assert(singleSelector.indexOf(',') === -1, "unexpected ',' in single selector: " + singleSelector);

            assert(singleSelector.trim().length > 0, "empty selector is not valid");
            var list = singleSelector.split(/\s+/);

            var targetNodeMatch = this._satisfyOneElementSelector(element, list.pop());
            if (!targetNodeMatch) {
                return false;
            } else {
                var curSelector = list.pop();
                var curNode = element.parentNode;
                while (curSelector && curNode) {
                    if (this._satisfyOneElementSelector(curNode, curSelector)) {
                        curSelector = list.pop();
                        curNode = curNode.parentNode;
                    } else {
                        curNode = curNode.parentNode;
                    }
                }
                return !curSelector;
            }
        },
        /**
         * TODO: 应由Element.js提供本功能
         * @param element
         * @param selector {string} 单元素选择器：.xx|#xx|xx
         * @return {Boolean}
         */
        _satisfyOneElementSelector: function (element, selector) {
            var reg = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/;
            var match = reg.exec(selector);
            assert(match !== null, "not valid simple selector: " + selector + "(must be .xx,#xx,xx)");

            if (match[1]) {
                // ID selector
                return element.id === match[1];
            } else if (match[2]) {
                // Type selector
                return element.tagName === selector.toUpperCase();
            } else if (match[3]) {
                // Class selector
                return element.classList.indexOf(match[3]) > -1;
            }
        }
    };

    //module.exports = StyleRender;
    module.exports = new StyleRender();
});
define("boost/tagMap",function(require, exports, module) {
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
define("boost/validator",function(require, exports, module) {
    "use strict";

    var slice = require("base/slice");
    var assert = require("base/assert");
    var trim = require("base/trim");
    var hasOwnProperty = require("base/hasOwnProperty");

    var DEVICE_PIXEL_RATIO = window.devicePixelRatio;


    var validator = {
        map: function (set) {
            return function (value) {
                value = trim(value);
                assert(hasOwnProperty(set, value), "unknow key \"" + value + "\"");
                return set[value];
            };
        },
        oneOf: function ( /*list*/ ) {
            var list = slice(arguments);
            return function (value) {
                value = trim(value);
                assert(list.indexOf(value) > -1, "value mast be one of " + list.join());
                return value;
            };
        },

        string: function (value) {
            return String(value);
        },

        font: function (value) {
            return String(value);
        },

        px: function (value) {
            var regResult = /^(\-?\d+(?:\.\d+)?)(?:px)?$/.exec(value); //TODO: 目前阶段为了容错，暂时仍支持不加px单位，后续考虑不允许不写单位
            assert(!!regResult, "value must be number, unit must be px");
            return parseFloat(regResult[1]);
        },

        number: function (value) {
            assert(!isNaN(value) && isFinite(value), "must be number");
            value = parseFloat(value);
            return value;
        },

        boolean: function (value) {
            if (value !== true && value !== false) {
                value = trim(String(value)).toLowerCase();
                value = value === "true" ? true : value === "false" ? false : assert(false, "must be boolean");
            }
            return value;
        },

        color: (function () {
            var NAMEED_COLORS = {
                "transparent" : 0x00000000|0,
                "black"       : 0xff000000|0,
                "silver"      : 0xffc0c0c0|0,
                "gray"        : 0xff808080|0,
                "white"       : 0xffffffff|0,
                "maroon"      : 0xff800000|0,
                "red"         : 0xffff0000|0,
                "purple"      : 0xff800080|0,
                "fuchsia"     : 0xffff00ff|0,
                "green"       : 0xff008000|0,
                "lime"        : 0xff00ff00|0,
                "olive"       : 0xff808000|0,
                "yellow"      : 0xffffff00|0,
                "navy"        : 0xff000080|0,
                "blue"        : 0xff0000ff|0,
                "teal"        : 0xff008080|0,
                "aqua"        : 0xff00ffff|0,
                "orange"      : 0xffffa500|0
            };
            var REG_HEX_RGB = /^#([0-9a-f])([0-9a-f])([0-9a-f])$/;
            var REG_HEX_RRGGBB = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
            var REG_RGB = /^rgb\s*\(\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*\)$/;
            var REG_RGBA = /^rgba\s*\(\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*,\s*(\d+|\d*\.\d+)\s*\)$/;
            //^[1-9]/d*/./d*|0/./d*[1-9]/d*$

            function getHexValue(value, maxValue) {
                return Math.round(value * 0xFF / maxValue) | 0;
                //value = Math.round(value * 0xFF / maxValue);
                //return value < 0x10 ? "0" + value.toString(16) : value.toString(16);
            }

            return function (value) {

                value = trim(value).toLowerCase();

                if (hasOwnProperty(NAMEED_COLORS, value)) {
                    return NAMEED_COLORS[value];
                }
                if (REG_HEX_RGB.test(value)) {
                    return parseInt("0xff" +
                            RegExp.$1 + RegExp.$1 +
                            RegExp.$2 + RegExp.$2 +
                            RegExp.$3 + RegExp.$3) | 0;
                }
                if (REG_HEX_RRGGBB.test(value)) {
                    return parseInt("0xff" +
                            RegExp.$1 +
                            RegExp.$2 +
                            RegExp.$3) | 0;
                }
                if (REG_RGB.test(value)) {
                    return 0xFF << 24 |
                        (getHexValue(parseFloat(RegExp.$1), 0xFF) << 16) | // r
                        (getHexValue(parseFloat(RegExp.$2), 0xFF) << 8 ) | // g
                        (getHexValue(parseFloat(RegExp.$3), 0xFF) << 0 ); // b
                }
                if (REG_RGBA.test(value)) {
                    return (getHexValue(parseFloat(RegExp.$4), 1)    << 24) | // a
                        (getHexValue(parseFloat(RegExp.$1), 0xFF) << 16) | // r
                        (getHexValue(parseFloat(RegExp.$2), 0xFF) << 8 ) | // g
                        (getHexValue(parseFloat(RegExp.$3), 0xFF) << 0 ); // b
                }
                assert(false, "unknow color: \"" + value + "\"");
            };
        })()

    };

    module.exports = validator;

});
define("boost/validatorCache",function(require, exports, module) {
    var cache = {};

    exports.get = function (key, value) {
        return cache[getCacheKey(key, value)];
    };
    exports.set = function (key, value, validatorRes) {
        cache[getCacheKey(key, value)] = validatorRes;
    };

    function getCacheKey (key, value) {
        return key + value;
    }
});
define("boost/webDebugger/boostMonitor",function(require, exports, module) {
    var webMap = require("boost/webDebugger/webMap");
    var webMonitor = require("boost/webDebugger/webMonitor");
    var webContainer = require("boost/webDebugger/webContainer");
    var lock = require("boost/webDebugger/lock");
    var boost = require("boost/boost");
    var derive = require("base/derive");

    function onAttributeChange (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }

        lock.doNotUpdateBoostOnce = true;
        if (e.attributeName === "value" && (this.tagName === "TEXT" || this.tagName === "TEXTINPUT")) {
            webMap.getWebElement(this).innerText = e.attributeValue;
        } else {
            webMap.getWebElement(this)[e.attributeName] = e.attributeValue;
        }
    }
    function onStyleChange (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }

        var webValue;
        var key = e.key;
        var value = e.value;

        if (key === "flex") {
            webValue = "1 1 " + value + "px";
        }

        if (value === null) {
            webValue = "auto";
        } else if (typeof value === "number") {
            webValue = value + "px";
        } else {
            webValue = value;
        }

        lock.doNotUpdateBoostOnce = true;
        webMap.getWebElement(this).style[key] = webValue;
    }
    function onAppendChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var webChild = webMap.getWebElement(e.child);
        lock.doNotUpdateBoostOnce = true;
        webElement.appendChild(webChild);
    }
    function onInsertBefore (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var newWebElement = webMap.getWebElement(e.child);
        var referenceWebElement = webMap.getWebElement(e.reference);
        lock.doNotUpdateBoostOnce = true;
        webElement.insertBefore(newWebElement, referenceWebElement);
    }
    function onRemoveChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var childWebElement = webMap.getWebElement(e.child);
        lock.doNotUpdateBoostOnce = true;
        webElement.removeChild(childWebElement);
    }
    function onReplaceChild (e) {
        if (lock.doNotUpdateWeb) {
            return;
        }
        var webElement = webMap.getWebElement(this);
        var newChildWebElement = webMap.getWebElement(e.newChild);
        var oldChildWebElement = webMap.getWebElement(e.oldChild);
        lock.doNotUpdateBoostOnce = true;
        webElement.replaceChild(newChildWebElement, oldChildWebElement);
    }
    function listenElementChange (element) {
        //TODO: 改这些事件为与web统一的形式
        element.addEventListener("attributeChange", onAttributeChange);
        element.addEventListener("styleChange", onStyleChange);
        element.addEventListener("appendChild", onAppendChild);
        element.addEventListener("insertBefore", onInsertBefore);
        element.addEventListener("removeChild", onRemoveChild);
        element.addEventListener("replaceChild", onReplaceChild);
    }

    var BoostMonitor = derive(Object, {
        start: function () {
            boost.addEventListener("documentElementCreated", function () {
                webMap.set(boost.documentElement, webContainer.getContainerElement());
                listenElementChange(boost.documentElement);
            });
            boost.addEventListener("createElement", function (e) {
                if (lock.doNotUpdateWeb) {
                    return;
                }
                var webElement = document.createElement(e.element.tagName);
                webMap.set(e.element, webElement);

                listenElementChange(e.element);
            });
        }
    });

    module.exports = new BoostMonitor();
});
define("boost/webDebugger/lock",function(require, exports, module) {
    module.exports = {
        /**
         * 由web与boost在合适时机设值、取消值。避免形成
         */
        doNotUpdateWeb: false, //web改boost同步即触发，改完即可直接置回false（如果交给boost中置回，则入口太多，容易出错）
        doNotUpdateBoostOnce: false //boost改web时，web中observer回调非同步触发，故只能web中置回，好在入口只有一处，容易把控
    };
});
define("boost/webDebugger/webContainer",function(require, exports, module) {
    var containerElement = document.createElement("div");
    containerElement.id = "web-monitor-container";
    containerElement.style.visibility = 'hidden';

    exports.getContainerElement = function () {
        return containerElement;
    };
});
define("boost/webDebugger/webDebugger",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var webMonitor = require("boost/webDebugger/webMonitor");
    var boostMonitor = require("boost/webDebugger/boostMonitor");
    var webContainer = require("boost/webDebugger/webContainer");

    exports.start = function () {
        webMonitor.start();
        boostMonitor.start();
        document.documentElement.insertBefore(webContainer.getContainerElement(), document.body);
    };
});
define("boost/webDebugger/webMap",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var ID_ATTR_NAME = "_id";

    var WebMap = derive(Object, {
        _boostMap: {},
        _webMap: {},

        getBoostElement: function (webElement) {
            var id = this._getId(webElement);
            var boostElement = this._boostMap[id];

            return boostElement;
        },
        getWebElement: function (boostElement) {
            var id = this._getId(boostElement);
            var webElement = this._webMap[id];

            return webElement;
        },

        set: function (boostElement, webElement) {
            var id = boostElement.tag;

            this._markId(boostElement, id, "boost");
            this._boostMap[id] = boostElement;

            this._markId(webElement, id, "web");
            this._webMap[id] = webElement;
        },

        getAllWebElements: function () {
            var result = [];
            each(this._webMap, function (value) {
                result.push(value);
            });
            return result;
        },

        _getId: function (element) {
            return element.getAttribute(ID_ATTR_NAME);
        },
        _markId: function (element, id, type) {
            element.setAttribute(ID_ATTR_NAME, id);
        }
    });

    module.exports = new WebMap();
});
/**
 * @file 负责监控web中元素，将其改动更新至boost 被webMap中调用启动
 */

define("boost/webDebugger/webMonitor",function(require, exports, module) {
    "use strict";

    var derive = require("base/derive");
    var assert = require("base/assert");
    var each = require("base/each");
    var toCamelCase = require("base/toCamelCase");
    var lock = require("boost/webDebugger/lock");
    var webContainer = require("boost/webDebugger/webContainer");
    var xml = require("boost/xml");
    require("boost/webDebugger/webMap");
    require("boost/webDebugger/webDebugger");
    require("boost/boost");
    var INTERVAL = 30;

    var WebMonitor = derive(Object, {
        _setIntervalHandle: null,

        start: function () {
            assert(this._setIntervalHandle === null, "already been started");

            var self = this;

            var boost = require("boost/boost");
            var observer = new MutationObserver(function (records) {
                if (lock.doNotUpdateBoostOnce) {
                    lock.doNotUpdateBoostOnce = false;
                    return; //avoid dead loop
                }

                records.forEach(function (record) {
                    var webMap = require("boost/webDebugger/webMap"); //因为有循环依赖，需在此使用时重新require
                    var webElement;
                    var boostElement;
                    switch (record.type) {
                        case "attributes":
                            webElement = record.target;
                            boostElement = webMap.getBoostElement(webElement);
                            if (record.attributeName === 'style') {
                                self._handleStyle(boostElement, webElement.getAttribute("style"));
                            } else if (record.attributeName === "class") {
                                lock.doNotUpdateWeb = true;
                                boostElement.className = webElement.className; //FIXME: can't trigger style update by className
                                lock.doNotUpdateWeb = false;
                            } else {
                                lock.doNotUpdateWeb = true;
                                boostElement.setAttribute(record.attributeName, webElement.getAttribute(record.attributeName));
                                lock.doNotUpdateWeb = false;
                            }
                            break;
                        case "characterData":
                            webElement = record.target.parentElement;
                            boostElement = webMap.getBoostElement(webElement);
                            var tagName = webElement.tagName.toUpperCase();
                            if (tagName === "TEXT" || tagName === "TEXTINPUT") {
                                lock.doNotUpdateWeb = true;
                                boostElement.value = webElement.innerHTML; //innerText can't get value~
                                lock.doNotUpdateWeb = false;
                            }
                            break;
                        case "childList":
                            webElement = record.target;
                            boostElement = webMap.getBoostElement(webElement);

                            each(record.removedNodes, function (removedNode) {
                                var removedBoostElement = webMap.getBoostElement(removedNode);
                                lock.doNotUpdateWeb = true;
                                boostElement.removeChild(removedBoostElement); //but do not destroy, for maybe is move/cut
                                lock.doNotUpdateWeb = false;
                            });

                            each(record.addedNodes, function (addedNode) {
                                if (addedNode.nodeName === "#text") {
                                    return; //文本节点不处理
                                }
                                var addedBoostNode = webMap.getBoostElement(addedNode);
                                if (!addedBoostNode) {
                                    lock.doNotUpdateWeb = true;
                                    addedBoostNode = xml.parse(addedNode.outerHTML);
                                    webMap.set(addedBoostNode, addedNode);
                                    lock.doNotUpdateWeb = false;
                                }
                                if (record.nextSibling) {
                                    lock.doNotUpdateWeb = true;
                                    boostElement.insertBefore(addedBoostNode, webMap.getBoostElement(record.nextSibling));
                                    lock.doNotUpdateWeb = false;
                                } else {
                                    lock.doNotUpdateWeb = true;
                                    boostElement.appendChild(addedBoostNode);
                                    lock.doNotUpdateWeb = false;
                                }
                            });
                            break;
                    }
                });
            });
            //TODO: 增加一个特殊元素作为作用域，避免插件等的影响
            observer.observe(webContainer.getContainerElement(), {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        },

        _handleStyle: function(boostElement, styleText) {
            var self = this;
            styleText = styleText.replace(/\/\*.*?\*\//g, "");
            var styleList = styleText.split(";");
            styleList = styleList.filter(function (styleItem) { return styleItem.trim().length > 0; });
            self._clearOldStyle(boostElement);
            styleList.forEach(function (styleItem) {
                var tempArray = styleItem.split(":");
                try {
                    self._handleStyleItem(boostElement,  tempArray[0].trim(), tempArray[1].trim());
                } catch (e) {
                    console.error(e); //打印error、但还继续解析下一个
                }
            });
        },

        _clearOldStyle: function (boostElement) {
            lock.doNotUpdateWeb = true;
            each(boostElement.style.__styleProps__, function (value, key) {
                boostElement.style[key] = null;
            });
            lock.doNotUpdateWeb = false;
        },

        _handleStyleItem: function (boostElement, styleName, styleValue) {
            var keyMap = {
                "margin": [
                    'margin-top',
                    'margin-right',
                    'margin-bottom',
                    'margin-left'
                ],
                "padding": [
                    'padding-top',
                    'padding-right',
                    'padding-bottom',
                    'padding-left'
                ],
                "border-width": [
                    'border-top-width',
                    'border-right-width',
                    'border-bottom-width',
                    'border-left-width'
                ],
                "border-color": [
                    'border-top-color',
                    'border-right-color',
                    'border-bottom-color',
                    'border-left-color'
                ]
            };
            var webDebugger = require("boost/webDebugger/webDebugger");
            var subStyleValues;
            switch (styleName) {
                case "margin":
                case "padding":
                case "border-width":
                case "border-color":
                    subStyleValues = styleValue.split(/\s+/);
                    if (subStyleValues.length === 1) {
                        subStyleValues.push(subStyleValues[0]); //right
                        subStyleValues.push(subStyleValues[0]); //bottom
                        subStyleValues.push(subStyleValues[0]); //left
                    } else if (subStyleValues.length === 2) {
                        subStyleValues.push(subStyleValues[0]); //bottom
                        subStyleValues.push(subStyleValues[1]); //left
                    } else if (subStyleValues.length === 3) {
                        subStyleValues.push(subStyleValues[1]); //left
                    }
                    lock.doNotUpdateWeb = true;
                    keyMap[styleName].forEach(function (subStyleKey, index) {
                        boostElement.style[webKeyToBoostKey(subStyleKey)] = webValueToBoostValue(subStyleValues[index]);
                    });
                    lock.doNotUpdateWeb = false;
                    break;
                case "flex":
                    subStyleValues = styleValue.split(/\s+/);
                    var flexValue = subStyleValues.length === 1 ? subStyleValues[0] : parseFloat(subStyleValues[2]);
                    boostElement.style[webKeyToBoostKey(styleName)] = webValueToBoostValue(flexValue);
                    break;
                default :
                    lock.doNotUpdateWeb = true;
                    boostElement.style[webKeyToBoostKey(styleName)] = webValueToBoostValue(styleValue);
                    lock.doNotUpdateWeb = false;
                    break;
            }

            function webValueToBoostValue (webValue) {
                return webValue; //目前没有特殊处理了
            }
            function webKeyToBoostKey (webKey) {
                return toCamelCase(webKey);
            }
        },

        _hasChild: function (parent, child) {
            var has = false;
            each(parent.childNodes, function (each) {
                if (each === child) {
                    has = true;
                }
            });
            return has;
        }
    });

    module.exports = new WebMonitor();
});
define("boost/xml",function(require, exports, module) {
    "use strict";

    var styleRender = require("boost/styleRender");
    var Event = require("boost/Event");
    var EventTarget = require("boost/EventTarget");
    var copyProperties = require("base/copyProperties");
    var toCamelCase = require("base/toCamelCase");
    var elementCreator = require("boost/elementCreator");
    var FROM_CUSTOM_HANDLER = "__from_custom_handler__";

    /**
     * @param [customHandler] {Function} TODO: change to webComponent/customElement
     * @constructor
     */
    function XmlParser (customHandler) {
        this._customHandler = customHandler;
        //this._styleRender = new StyleRender(this); //每次实例一个以避免本次parse中的style影响外界
        this._styleRender = styleRender;
    }
    XmlParser.prototype = {
        /**
         * @param xmlStr {string} 不需包含<?xml>说明节点，需为单根
         * @return {Element}
         */
        parse: function (xmlStr) {
            //从template里直接innerHTML得来的内容中，web会把<image></image>转换为<img>这里做处理：
            xmlStr = xmlStr.replace(/<img(\s+[^>]*)?\/?>/g, '<image$1></image>');

            var domParser = new DOMParser();
            console.log("parse");
            var XML_DECLARE_STR = "<?xml version='1.0' encoding='UTF-8' ?>";
            var xmlDoc = domParser.parseFromString(XML_DECLARE_STR + xmlStr, "text/xml");

            //if (xmlDoc.querySelector('parsererror div')) {
            //    console.error("xml parse error: " + xmlDoc.querySelector('parsererror div').innerText);
            //    console.error(xmlStr);
            //    console.error(xmlDoc);
            //}

            return this._process(xmlDoc);
        },

        /**
         * 判断一个元素是否来自this._customHandler（而非parse中直接处理到的默认标签）
         * @param element
         * @param rootElement
         * @returns {boolean}
         */
        fromCustomHandler: function (element, rootElement) {
            var elementWithMark = this._findUpstream(element, function (node) {
                return node.getAttribute(FROM_CUSTOM_HANDLER);
            });

            return !!(elementWithMark && elementWithMark !== rootElement);
        },

        /**
         * 从node开始，向上寻找
         * @param node {Element}
         * @param predicate {Function}
         * @return {Element|null}
         * @private
         */
        _findUpstream: function (node, predicate) {
            do {
                if (predicate(node) === true) {
                    return node;
                }
            } while ((node = node.parentNode) !== null);
            return null;
        },

        /**
         * @param xmlDocument
         * @return {Element}
         * @private
         */
        _process: function (xmlDocument) {
            //console.log("process:", xmlDocument);
            console.log("process:");
            var rootNativeElement = this._processElement(xmlDocument.documentElement);
            console.log("element got");
            return rootNativeElement;
        },

        /**
         * @param xmlElement
         * @returns {Element|null}
         * @private
         */
        _processElement: function (xmlElement) {
            var nativeElement;
            var attributes;
            var attribute;
            var count;
            var index;

            var result = null;
            var tagName = xmlElement.tagName.toUpperCase();
            switch (tagName) {
                case "PARSERERROR":
                    console.error(xmlElement.innerText);
                    break;

                case "STYLE":
                    this._styleRender.parse(xmlElement.firstChild ? xmlElement.firstChild.nodeValue: '');
                    break;

                //case "FLUSH":
                //    nativeGlobal.test();
                //    break;

                default:
                    var customHandlerResult = this._customHandler ? this._customHandler(xmlElement) : false;
                    switch (customHandlerResult) {
                        case false:
                            //this._customHandler未处理，走默认处理
                            nativeElement = elementCreator.create(xmlElement.tagName);
                            attributes = xmlElement.attributes;
                            count = attributes.length;
                            for (index = 0; index < count; index++) {
                                attribute = attributes[index];
                                //nativeElement.setAttribute(toCamelCase(attribute.name), attribute.value); //从template里拿时，没有大小写区分，故让用户写'-'分割，这里转成驼峰
                                nativeElement.setAttribute(attribute.name, attribute.value);
                            }

                            if (tagName === "TEXT" || tagName === "TEXTINPUT") {
                                var value = xmlElement.firstChild ? xmlElement.firstChild.nodeValue : '';
                                nativeElement.value = value;
                            } else {
                                this._walkElement(xmlElement, nativeElement);
                            }

                            ////TODO: 在Element定义属性
                            //nativeElement.__styleRender__ = this._styleRender;

                            result = nativeElement;
                            break;

                        case undefined:
                        case null:
                            //handler处理但没有dom元素要添加
                            break;

                        default :
                            //handler处理并返回其处理结果，打标记并直接append
                            customHandlerResult.setAttribute(FROM_CUSTOM_HANDLER, true);
                            result = customHandlerResult;
                            break;
                    }
            }

            return result;
        },

        _walkElement: function (xmlElement, nativeParentElement) {
            var xmlChild;
            for (xmlChild = xmlElement.firstElementChild; xmlChild !== null; xmlChild = xmlChild.nextElementSibling) {
                var elementChild = this._processElement(xmlChild);
                if (elementChild) {
                    nativeParentElement.appendChild(elementChild);
                }
            }
        }
    };

    var xml = new EventTarget();
    var xmlParser = new XmlParser();
    copyProperties(xml, {
        /**
         * @param xmlStr {string} xml串，不需包含<?xml>说明标签，需单根
         * @returns {Element}
         */
        parse: function (xmlStr) {
            return xmlParser.parse(xmlStr);
        },

        parseNodes: function (xmlStr) {
            var virtualRoot = this.parse("<view>" + xmlStr + "</view>"); //parse需要单根
            var nodes = virtualRoot.childNodes.slice();
            virtualRoot.destroy(); //destroy接口保证其会removeChild但不会销毁child
            return nodes;
        }
    });
    module.exports = xml;
});
//加载必需被加载(其内监听事件、发起主动动作)的文件
console.log("boost/main.js loaded");
require([
    "base/assert",
    "base/type",
    "base/derive",
    "base/each",
    "base/copyProperties",

    "boost/nativeEventHandler",
    "boost/bridge",
    "boost/boost",
    "boost/nativeVersion",
    "boost/$",
    "boost/nativeObject/backgroundPage",
    "boost/nativeObject/lightApi",
    "boost/nativeObject/Linkage",

    "boost/View",
    "boost/Element",
    "boost/Text",
    "boost/TextInput",
    "boost/Image",
    "boost/ScrollView",
    "boost/BoostPage",
    "boost/Slider",
    "boost/RootView",
    "boost/Slot",
    "boost/ViewPager",
    "boost/Toolbar",
    "boost/Dialog",
    "boost/Carousel",
    "boost/elementCreator"
], function (
    assert, type, derive, each, copyProperties,
    nativeEventHandler, bridge, boost, nativeVersion, $, backgroundPage, lightApi, Linkage,

    View,
    Element,
    Text,
    TextInput,
    Image,
    ScrollView,
    BoostPage,
    Slider,
    RootView,
    Slot,
    ViewPager,
    Toolbar,
    Dialog,
    Carousel,
    elementCreator
) {
    console.log("boost/main.js module start");
    //console.log("no getMethodMapping");
    //bridge.getMethodMapping();// TODO: 为了性能，暂去掉getMethodMapping

    var TAG_MAP = {
        "View": View,
        "Text": Text,
        "TextInput": TextInput,
        "Image": Image,
        "Img": Image,
        "ScrollView": ScrollView,
        "Slider": Slider,
        "Slot": Slot,
        "ViewPager": ViewPager,
        "Toolbar": Toolbar,
        "BoostPage": BoostPage,
        "RootView": RootView,
        "Carousel": Carousel
    };
    each(TAG_MAP, function (constructor, tagName) {
        elementCreator.register(tagName, {
            constructor: constructor
        });
    });

    var Boost = derive(Object, {
        //base
        assert: assert,
        each: each,
        type: type,
        copyProperties: copyProperties,

        $: $,
        Linkage: Linkage,
        Dialog: Dialog,

        inO2O: !nativeVersion.shouldUseWeb(),

        "get documentElement": function () {
            return boost.documentElement;
        },
        openNewPage: function (href) {
            function completeHref (inValue) {
                if (/^https?:\/\//.test(inValue)) {
                    return inValue;
                }

                if (inValue[0] === "/") {
                    return location.origin + inValue;
                }

                var h = location.href;
                return h.slice(0, h.lastIndexOf("/")) + "/" + inValue.slice(1);
            }

            var url = completeHref(href);

            if (nativeVersion.shouldUseWeb()) {
                window.open(url);
            } else {
                backgroundPage.postMessage("openPage", url);
            }
        },
        showLoading: function () {
            bridge.handleLoading();
            bridge.showLoading();
        },
        hideLoading: function () {
            bridge.hideLoading();
            bridge.cancelHandleLoading(); //为保证安全，每次hide都交还控制权
        }
    });
    var exportBoost = new Boost();
    exportsMethod("createElement", boost);
    exportsMethod("getElementById", boost);
    exportsMethod("addLayer", boost);
    exportsMethod("removeLayer", boost);
    exportsMethod("getElementsByClassName", boost);
    exportsMethod("getElementsByTagName", boost);
    exportsMethod("querySelector", boost);
    exportsMethod("querySelectorAll", boost);
    exportsMethod("dispatchEvent", boost);
    exportsMethod("setDocumentElementLayerZIndex", boost);
    exportsMethod("flush", bridge);
    exportsMethod("getLocatedCity", lightApi);
    exportsMethod("showInputMethod", lightApi);
    exportsMethod("hideInputMethod", lightApi);
    exportsMethod("inBox", nativeVersion);
    exportsMethod("inWeb", nativeVersion, "shouldUseWeb");
    exportsMethod("inAndroid", nativeVersion);

    window.boost = exportBoost;

    function exportsMethod (methodName, obj, fromMethodName) {
        if (!fromMethodName) {
            fromMethodName = methodName;
        }
        exportBoost[methodName] = $.proxy(obj[fromMethodName], obj);
    }

    if (nativeVersion.shouldUseWeb()) {
        var styleEl = document.createElement("style");
        styleEl.innerText = '' +
            'html, body {' +
            '    margin: 0;' +
            '    padding: 0;' +
            '    height: 100%;' +
            '    overflow: hidden;' +
            '}' +
            'div, input {' +
            '    box-sizing: border-box;' +
            '    position: relative;' +
            '    display: flex;' +
            '    flex-direction: column;' +
            '    align-items: stretch;' +
            '    flex-shrink: 0;' +
            '    align-content: flex-start;' +
            '    border: 0 solid black;' +
            '    margin: 0;' +
            '    padding: 0;' +
            '    overflow: hidden;' +
            '}' +
            'input {' +
            '    border: none;' +
            '    outline: -webkit-focus-ring-color auto 0px;' +
            '}' +
            'input[type="search"]::-webkit-search-decoration,' +
            'input[type="search"]::-webkit-search-cancel-button,' +
            'input[type="search"]::-webkit-search-results-button,' +
            'input[type="search"]::-webkit-search-results-decoration { ' +
            '    display: none;' +
            '}';
        document.head.appendChild(styleEl);
    }
});
})();