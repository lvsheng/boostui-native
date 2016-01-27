define(function (require, exports, module) {
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

