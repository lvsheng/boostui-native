define(function (require, exports, module) {
    "use strict";

    var type = require("base/type");
    var assert = require("base/assert");
    var derive = require("base/derive");
    var isFunction = require("base/isFunction");
    var boost = require("boost/boost");
    var copyProperties = require("base/copyProperties");
    var Event = require("boost/Event");

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
        //TODO: change to update all children style
        walkTree(element, function (curElement) {
            var elementStyleRender = curElement.__styleRender__;
            if (!elementStyleRender) {
                //应对非xml-parser解析出的元素
                console.warn("to auto update element's style when it's class changes, element.__styleRender(added in xml-parser.js) is required.");
                return;
            }

            elementStyleRender.clearStyle(curElement);
            elementStyleRender.applyOnOne(curElement);
        });
    }

    function $(selector, context) {
        var dom;
        if (!selector) {
            dom = [];
        } else if (typeof selector == 'string') {
            // FIXME 不支持传HTML
            context = context || boost;
            dom = context.querySelectorAll(selector);
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
            assert(arguments.length > 1, "目前只支持 css(key, value)");
            return this.each(function (idx, element) {
                element.style[key] = value;
            });
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
