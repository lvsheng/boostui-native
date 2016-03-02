define(function (require, exports, module) {
    var each = require("base/each");
    var View = require("boost/View");
    var Element = require("boost/Element");
    var Text = require("boost/Text");
    var TextInput = require("boost/TextInput");
    var Image = require("boost/Image");
    var ScrollView = require("boost/ScrollView");
    var BoostPage = require("boost/BoostPage");
    var Slider = require("boost/Slider");
    var RootView = require("boost/RootView");
    var Slot = require("boost/Slot");
    var ViewPager = require("boost/ViewPager");
    var Toolbar = require("boost/Toolbar");
    var Dialog = require("boost/Dialog");
    var Carousel = require("boost/Carousel");
    var elementCreator = require("boost/elementCreator");

    var TAG_MAP = {
        "View": View,
        "Text": Text,
        "TextInput": TextInput,
        "Image": Image,
        "Img": Image,
        "ScrollView": ScrollView,
        "Slider": Slider,
        "Slot": Slot,
        "ViewPager": ViewPager,
        "Toolbar": Toolbar,
        "BoostPage": BoostPage,
        "RootView": RootView,
        "Carousel": Carousel
    };
    each(TAG_MAP, function (constructor, tagName) {
        elementCreator.register(tagName, {
            constructor: constructor
        });
    });
});
