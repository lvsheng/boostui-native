var require, define;
(function () {
    var factoryMap = {};
    var moduleMap = {};
    var watingModules = [];
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

        var index = watingModules.indexOf(name);
        watingModules.push(name);
        if (index > -1) {
            throw "循环依赖咯:" + watingModules.slice(index).join(" > ");
        }
        var module = {
            exports: {}
        };
        var returnValue = factoryMap[name](innerRequire, module.exports, module);
        if (returnValue !== undefined) {
            console.error("不支持return模块内容，请直接更改module.exports哦");
        }
        moduleMap[name] = module.exports;
        watingModules.pop();
    }
})();
