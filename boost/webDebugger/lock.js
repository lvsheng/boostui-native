define(function (require, exports, module) {
    module.exports = {
        /**
         * 由web与boost在合适时机设值、取消值。避免形成
         */
        doNotUpdateWeb: false, //web改boost同步即触发，改完即可直接置回false（如果交给boost中置回，则入口太多，容易出错）
        doNotUpdateBoostOnce: false //boost改web时，web中observer回调非同步触发，故只能web中置回，好在入口只有一处，容易把控
    };
});
