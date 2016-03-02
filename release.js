#!/usr/bin/env node

//config
var BOOST_DIR = [
    "base",
    "boost"
];
var BOOST_MAIN = "boost/main.js";
var BOOST_DEPENDENCY = [
    "amd.js"
    //,
    //"bridge.js" //为防止主页面与服务导航全局变量冲突。bridge.js合入boost/bridge.js中了
];
var OUT_PUT = {
    boost: "release/boost.js"
};

//require
var shell = require('shelljs');
var fs = require("fs");

function defineTimeLogger (exports) {
    if (exports.timeLogger) {
        return;
    }
    var preFix = "performance: ";
    var pageStartTime = performance.timing.fetchStart;
    var lastTime = pageStartTime;
    var results = [];
    exports.timeLogger = function (key) {
        var curTime = +new Date;
        var timing = curTime - pageStartTime;
        var duration = curTime - lastTime;
        console.log(preFix, key, "[" + timing + "]: ", duration);
        results.push({
            key: key,
            timing: timing,
            duration: duration
        });
        //console.trace();
        lastTime = curTime;
    };
    exports.timeLoggerOverView = function () {
        results.sort(function (a, b) {
            return b.duration - a.duration;
        });
        console.log("\nperformance:\noverview:\n ", results.map(function (item) {
            return item.key + "[" + item.timing + "]: " + item.duration;
        }).join("\n  "));
    };
}
var defineTimeLoggerStr = "(" + defineTimeLogger.toString() + ")(window);";

//main
var boostContent = '' +
    '(function () {' +
    'console.log("performance: ", "update at' + (new Date()) + '");' + //为了通过performance:也能筛选出此项，加此前缀。。
    //'alert("update at' + (new Date()) + '");' + //为了通过performance:也能筛选出此项，加此前缀。。
    defineTimeLoggerStr +
    'timeLogger("boost.js开始执行");' +
    'console.log("first js statement");' +
    'console.time("page");' +
    'console.time("define.boost");';
var pageContent = '' +
    defineTimeLoggerStr +
    'timeLogger("page.js开始执行");';
BOOST_DEPENDENCY.forEach(function (filePath) {
    boostContent += getFileContent(filePath);
});
boostContent += packCMD(BOOST_DIR);
boostContent += getFileContent(BOOST_MAIN);
boostContent += "})();";

writeFile(OUT_PUT.boost, boostContent);

//method
function packCMD (dirs) {
    var jsFiles = [];
    var content = "";
    dirs.forEach(function (dir) {
        jsFiles = jsFiles.concat(getJsFiles(dir));
    });
    jsFiles.forEach(function (filePath) {
        if (filePath === BOOST_MAIN) {
            return;
        }

        var fileContent = getFileContent(filePath);
        var modulePath = filePath.replace(/\.js$/, "");
        fileContent = addCMDDefinePath(fileContent, modulePath);
        content += fileContent;
    });
    return content;
}

function getFileContent (path) {
    return fs.readFileSync(path, {encoding: "utf8"})
}

function writeFile (path, content) {
    fs.writeFile(path, content, function (e) {
        if (e) {
            throw e;
        } else {
            console.log("write: ", path);
        }
    });
}

function getJsFiles (baseDir) {
    return shell.find(baseDir).filter(function (filePath) {
        return /\.js/.test(filePath);
    });
}

function addCMDDefinePath (fileContent, modulePath) {
    return fileContent.replace(/define\(\s*function\s*\(/, 'define("' + modulePath + '",function(');
}
