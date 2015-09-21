define(function (require, exports, module) {
    var derive = require("base/derive");
    var Element = require("boost/Element");

    /**
     * shadowRoot不参与渲染，故只继承Element(w3c规范里是继承自DocumentFragment、又增加了innerHTML与styleSheets等属性)
     */
    module.exports = derive(Element, function (host) {
        this._super("ShadowRoot");

        this.__host__ = host;
    }, {
        "get host": function () {
            return this.__host__;
        }
    });
});
