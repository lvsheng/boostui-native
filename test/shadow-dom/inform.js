define(function (require, exports, module) {
    module.exports = function (info) {
        alert(info); //先确认
        console.info(info); //再在log打印以备确认
    };
});
