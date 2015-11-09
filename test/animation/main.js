define(function (require, exports, module) {
    var boost = require("boost/boost");
    var PropAnimation = require("boost/PropAnimation");
    var AnimationSet = require("boost/AnimationSet");

    var text = boost.createElement("text");
    boost.documentElement.appendChild(text);
    text.value = "hello, boost";
    text.style.color = "rgba(0, 0, 0, 1)";
    text.style.backgroundColor = "rgba(0, 0, 0, 0.1)";
    text.style.fontSize = "22";
    text.style.fontWeight = "bold";
    text.style.fontStyle = "italic";
    text.style.alignSelf = "center";

    var moveLeftAnimation = new PropAnimation({
        prop: "left",
        from: 0,
        to: 100,
        duration: 1000,
        easing: "easeInOutSine",
        element: text
    });
    var scaleXAnimation = new PropAnimation({
        prop: "scaleX",
        from: 1,
        to: 1.5,
        duration: 500,
        easing: "easeOutBack",
        element: text
    });
    var scaleYAnimation = new PropAnimation({
        prop: "scaleY",
        from: 1,
        to: 1.5,
        duration: 500,
        easing: "easeOutBack",
        element: text
    });
    var scaleAnimation = new AnimationSet({
        type: "together",
        element: text
    });
    scaleAnimation.add(scaleXAnimation);
    scaleAnimation.add(scaleYAnimation);
    var wholeAnimation = new AnimationSet({
        type: "sequentially",
        element: text
    });
    wholeAnimation.add(moveLeftAnimation);
    //wholeAnimation.add(scaleAnimation);
    wholeAnimation.start();

    //setTimeout(function () {
    //    wholeAnimation.cancel();
    //}, 1300);
});

