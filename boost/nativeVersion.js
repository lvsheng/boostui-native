define(function (require, exports, module) {
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
});
