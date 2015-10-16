define(function (require, exports, module) {
    var containerElement = document.createElement("div");
    containerElement.id = "web-monitor-container";
    containerElement.style.visibility = 'hidden';

    exports.getContainerElement = function () {
        return containerElement;
    };
});
