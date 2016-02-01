define(function (require, exports, module) {
    var reg = /BaiduRuntimeO2OZone\/(\d\.\d)/;
    var regResult = reg.exec(navigator.userAgent);
    var version = 0;
    if (regResult) {
        version = regResult[1];
    }

    /**
     * @returns {Number} 两位版本。若不在o2o下，返回0
     */
    exports.get = function () {
        return parseFloat(version);
    };

    exports.inBox = function () {
        return this.get() == 2.3; //TODO: 暂时用此来判断2.3
    };
});
