define(function (require, exports, module) {
    var createText = require("test/shadow-dom/createText");
    var randomColor = require("test/shadow-dom/randomColor");
    var inform = require("test/shadow-dom/inform");

    var shadowHost = boost.createElement("View");
    shadowHost.style.backgroundColor = randomColor(0.3);
    boost.documentElement.appendChild(shadowHost);

    inform("创建t、t123");
    var t = createText("t");
    shadowHost.appendChild(t);
    var t1 = createText("t1");
    t1.slot = "s1";
    shadowHost.appendChild(t1);
    var t2 = createText("t2");
    t2.slot = "s2";
    shadowHost.appendChild(t2);
    var t3 = createText("t3");
    t3.slot = "s3";
    shadowHost.appendChild(t3);

    setTimeout(function () {
        inform("创建s124、默认s\nt3将不被展现，s4作为普通元素展现");
        var shadowRoot = shadowHost.attachShadow();
        shadowRoot.appendChild(createSlot("s1"));
        var s2 = createSlot("s2");
        shadowRoot.appendChild(s2);
        shadowRoot.appendChild(createSlot("s4"));
        shadowRoot.appendChild(createSlot(""));

        setTimeout(function () {
            //构建子树
            //TODO: 打印树图出来
            var root = boost.createElement("View");
            root.style.backgroundColor = randomColor(0.1);
            var node00 = boost.createElement("View"); //高位为父元素编号，最低位为自己在兄弟节点中的编号
            node00.appendChild(createSlot("", "00-s"));
            root.appendChild(node00);
            var node01 = boost.createElement("View");
            root.appendChild(node01);
            var node02 = boost.createElement("View");
            root.appendChild(node02);
            var node010 = boost.createElement("View");
            node01.appendChild(node010);
            var node011 = boost.createElement("View");
            node011.appendChild(createSlot("s1", "011-s1"));
            node01.appendChild(node011);
            var node020 = boost.createElement("View");
            node02.appendChild(node020);
            var node0200 = boost.createElement("View");
            node0200.appendChild(createSlot("s2", "0200-s2"));
            node020.appendChild(node0200);
            var node0201 = boost.createElement("View");
            node0201.appendChild(createSlot("s3", "0201-s3"));
            node020.appendChild(node0201);
            var node0202 = boost.createElement("View");
            node0202.appendChild(createSlot("s5", "0202-s5"));
            node020.appendChild(node0202);

            inform("s2前插入子树,子树中有默认s,s1235\nt1仍在旧s1中，t,t2移至新s,s2中，t3展现在新s3中，新s5作为普通节点展现");
            shadowRoot.insertBefore(root, s2);
        });
    });
    
    function createSlot (name, text) {
        if (!name) {
            name = "";
        }
        if (!text) {
            text = name || "s";
        }
        var slot = boost.createElement("Slot");
        slot.name = name;
        slot.appendChild(createText(text));
        return slot;
    }
});
