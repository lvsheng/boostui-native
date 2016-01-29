define(function (require, exports, module) {
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
