define(function (require, exports, module) {
    var map = {
        "isLogin": 1,
        "login": 2,
        "seekToAudio": 3,
        "setVolume": 4,
        "speedFF": 5,
        "startPlayingAudio": 6,
        "startRecordingAudio": 7,
        "stopPlayingAudio": 8,
        "stopRecordingAudio": 9,
        "getPicture": 10,
        "captureAudio": 11,
        "captureImage": 12,
        "captureVideo": 13,
        "get": 14,
        "start": 15,
        "stop": 16,
        "startListen": 17,
        "stopListen": 18,
        "dopay": 19,
        "followSite": 20,
        "getUniqueId": 21,
        "isBind": 22,
        "registerMulticast": 23,
        "registerUnicast": 24,
        "unSubscribeLight": 25,
        "unregisterMulticast": 26,
        "unregisterUnicast": 27,
        "directShare": 28,
        "create": 29,
        "destroy": 30,
        "destroyAll": 31,
        "update": 32,
        "canGoBackOrForward": 33,
        "goBackOrForward": 34,
        "loadUrl": 35,
        "reload": 36,
        "setDuration": 37,
        "setEasing": 38,
        "setStartOffset": 39,
        "setTarget": 40,
        "add": 41,
        "cancel": 42,
        "remove": 43,
        "setType": 44,
        "setFrom": 45,
        "setProp": 46,
        "setRepeatCount": 47,
        "setTo": 48,
        "setAlignItems": 49,
        "setBorderBottomWidth": 50,
        "setBorderLeftWidth": 51,
        "setBorderRightWidth": 52,
        "setBorderTopWidth": 53,
        "setBorderWidth": 54,
        "setFlexDirection": 55,
        "setFlexWrap": 56,
        "setJustifyContent": 57,
        "setPadding": 58,
        "setPaddingBottom": 59,
        "setPaddingLeft": 60,
        "setPaddingRight": 61,
        "setPaddingTop": 62,
        "dismiss": 63,
        "setCancelable": 64,
        "setCanceledOnTouchOutside": 65,
        "setGravityHorizontal": 66,
        "setGravityVertical": 67,
        "show": 68,
        "addPoint": 69,
        "setDragBounds": 70,
        "setDragMode": 71,
        "blur": 72,
        "focus": 73,
        "setEditable": 74,
        "setKeyboardType": 75,
        "setPassword": 76,
        "setPlaceholder": 77,
        "setPlaceholderTextColor": 78,
        "setBorderColor": 79,
        "setBorderRadius": 80,
        "setDefaultSource": 81,
        "setResizeMode": 82,
        "setSource": 83,
        "hideInputMethod": 84,
        "querySubscribe": 85,
        "shareApp": 86,
        "showInputMethod": 87,
        "subscribe": 88,
        "unsubscribe": 89,
        "setFromColor": 90,
        "setToColor": 91,
        "setUpdateColor": 92,
        "attachToPopWindow": 93,
        "dismissPopWindow": 94,
        "exit": 95,
        "addView": 96,
        "scrollBy": 97,
        "scrollTo": 98,
        "setLinkage": 99,
        "closeSlider": 100,
        "setMaxSlideWidth": 101,
        "setColor": 102,
        "setEllipsize": 103,
        "setFont": 104,
        "setFontFamily": 105,
        "setFontSize": 106,
        "setFontStyle": 107,
        "setFontWeight": 108,
        "setLineHeight": 109,
        "setMaxLines": 110,
        "setMultiline": 111,
        "setNumberOfLines": 112,
        "setTextAlign": 113,
        "setValue": 114,
        "setUrl": 115,
        "removeViewAt": 116,
        "setCurrentItem": 117,
        "setLoop": 118,
        "setLoopScrollDuration": 119,
        "setAlignSelf": 120,
        "setAlpha": 121,
        "setBackgroundColor": 122,
        "setBorderBottomColor": 123,
        "setBorderBottomLeftRadius": 124,
        "setBorderBottomRightRadius": 125,
        "setBorderLeftColor": 126,
        "setBorderRightColor": 127,
        "setBorderTopColor": 128,
        "setBorderTopLeftRadius": 129,
        "setBorderTopRightRadius": 130,
        "setBottom": 131,
        "setFlex": 132,
        "setHeight": 133,
        "setLeft": 134,
        "setMargin": 135,
        "setMarginBottom": 136,
        "setMarginLeft": 137,
        "setMarginRight": 138,
        "setMarginTop": 139,
        "setMaxHeight": 140,
        "setMaxWidth": 141,
        "setMinHeight": 142,
        "setMinWidth": 143,
        "setPosition": 144,
        "setRight": 145,
        "setScaleX": 146,
        "setScaleY": 147,
        "setSelectorBackgroundColor": 148,
        "setSelectorBorderBottomColor": 149,
        "setSelectorBorderBottomLeftRadius": 150,
        "setSelectorBorderBottomRightRadius": 151,
        "setSelectorBorderBottomWidth": 152,
        "setSelectorBorderColor": 153,
        "setSelectorBorderLeftColor": 154,
        "setSelectorBorderLeftWidth": 155,
        "setSelectorBorderRadius": 156,
        "setSelectorBorderRightColor": 157,
        "setSelectorBorderRightWidth": 158,
        "setSelectorBorderTopColor": 159,
        "setSelectorBorderTopLeftRadius": 160,
        "setSelectorBorderTopRightRadius": 161,
        "setSelectorBorderTopWidth": 162,
        "setSelectorBorderWidth": 163,
        "setTop": 164,
        "setWidth": 165
    };
    exports.tryGetMethodId = function (methodName) {
        return map[methodName] || methodName;
    };
});
