define(function (require, exports, module) {
    var derive = require("base/derive");
    require("boost/Element");

    var ShadowRoot;
    exports.getShadowRoot = function () {
        //FIXME: 因与Element有循环依赖，故暂时封一个方法而非直接exports
        if (!ShadowRoot) {
            /**
             * shadowRoot不参与渲染，故只继承Element(w3c规范里是继承自DocumentFragment、又增加了innerHTML与styleSheets等属性)
             */
            ShadowRoot = derive(require("boost/Element"), function (host) {
                this._super("ShadowRoot");

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
