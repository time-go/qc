(function () {
    var PREFIX = "qc";
    (function () {
        //IE6 IE7做处理*/ IE8 开始支持这个方法
        if (!document.querySelectorAll) {
            document.querySelectorAll = function (selectors) {
                var style = document.createElement('style'), elements = [], element;
                document.documentElement.firstChild.appendChild(style);
                document._qsa = [];

                style.styleSheet.cssText = selectors + '{x-qsa:expression(document._qsa && document._qsa.push(this))}';
                window.scrollBy(0, 0);
                style.parentNode.removeChild(style);

                while (document._qsa.length) {
                    element = document._qsa.shift();
                    element.style.removeAttribute('x-qsa');
                    elements.push(element);
                }
                document._qsa = null;
                return elements;
            };
        }
        if (!document.querySelector) {
            document.querySelector = function (selectors) {
                var elements = document.querySelectorAll(selectors);
                return (elements.length) ? elements[0] : null;
            };
        }
        /*string方法扩展*/
        String.prototype.mySplit = function (z) {
            var str = this;
            var list = [];
            var temp = "";
            var isStr = "";
            for (var i = 0; i < str.length; i++) {
                var char = str.charAt(i);
                if ((char === "\"" || char === "'" ) && isStr === "") {
                    isStr = char;
                    temp += char;
                } else if ((char === "\"" || char === "'" ) && isStr === char) {
                    temp += char;
                    isStr = "";
                } else {
                    if (char === z) {
                        list.push(temp);
                        temp = "";
                    } else {
                        temp += char;
                    }
                }
                if (i === str.length - 1) {
                    list.push(temp);
                    temp = "";
                }
            }
            return list;

        }
    })()
    /*私有函数*/ //tbosy 复制 iebug
    function setTBodyInnerHTML(tbody, html) {//兼容ie6-ie9 的table innerHTML 不能修改
        var div = document.createElement('div')
        div.innerHTML = '<table><tbody>' + html + '</tbody></table>'
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild)
        }
        while (div.firstChild.firstChild.childNodes.length > 0) {
            tbody.appendChild(div.firstChild.firstChild.childNodes[0])
        }
    }

    function setTBodyAppendHtml(tbody, html) {
        var div = document.createElement('div')
        div.innerHTML = '<table><tbody>' + html + '</tbody></table>';
        while (div.firstChild.firstChild.childNodes.length > 0) {
            tbody.appendChild(div.firstChild.firstChild.childNodes[0])
        }
    }

    var fun = (function () {
        var retFun = {};

        //内部生成不重复数字函数
        var random = new Date().getTime();

        function getRandom() {
            random++;
            return random;
        }

        /*针对IE6
         /*判断是否为空对象*/
        function isNullObj(obj) {
            for (var i in obj) {
                if (obj.hasOwnProperty(i)) {
                    return false;
                }
            }
            return true;
        }

        /*创建虚拟节点*/

        function expresssion(exp) {
            var list = [];
            var text = exp;
            var v = "";
            for (var t = 0; t < text.length; t++) {
                var char = text.charAt(t);
                if (char == "{") {
                    if (v !== "") {
                        list.push(v);
                    }
                    v = "{"
                } else if (char == "}") {
                    v += "}"
                    list.push(v);
                    v = "";
                } else {
                    v += char;
                }
                if (t === text.length - 1) {
                    if (v !== "") {
                        list.push(v);
                        v = ""
                    }
                }
            }
            return list;
        }

        function exp(exp) {
            var o = {};
            var css = exp.mySplit(";");
            for (var i = 0; i < css.length; i++) {
                var exp = css[i].mySplit(":");
                o[exp[0]] = expresssion(exp[1]);
            }
            return o;
        }

        function htmlToObj(dom) {//浏览器兼容性有待测试
            var retObj = {};

            function to(d, o, p) {
                if (d.nodeName === "#text") {
                    o.localName = "#text";
                    o.nodeValue = d.nodeValue;
                    return;
                }
                o.localName = d.nodeName.toLowerCase();
                if (p !== undefined) {
                    o.parentNode = p;
                }
                if (d.className !== "") {
                    o.className = d.className.mySplit(" ");
                } else {
                    o.className = [];
                }
                o.attributes = {};
                o[PREFIX] = {};
                try {
                    o.innerHTML = d.innerHTML;
                } catch (e) {
                    setTBodyInnerHTML(o, d.innerHTML);
                }
                if (d.attributes.length > 0) {
                    for (var a = 0; a < d.attributes.length; a++) {
                        var _node = d.attributes[a]
                        if (_node.nodeName.indexOf(PREFIX + "-") == 0 && _node.nodeName !== PREFIX + "-view") {
                            if (_node.nodeName === PREFIX + "-text") {//text文本
                                o[PREFIX][_node.nodeName] = expresssion(_node.value);
                            } else if (_node.nodeName === PREFIX + "-css") {//style
                                o[PREFIX][_node.nodeName] = exp(_node.value);
                            } else if (_node.nodeName === PREFIX + "-attr") {//属性
                                o[PREFIX][_node.nodeName] = exp(_node.value);
                            } else if (_node.nodeName === PREFIX + "-class") {//class
                                o[PREFIX][_node.nodeName] = exp(_node.value);
                            } else if (_node.nodeName === PREFIX + "-prop") {//prop
                                o[PREFIX][_node.nodeName] = exp(_node.value);
                            } else if (_node.nodeName === PREFIX + "-visible") {//是否显示
                                o[PREFIX][_node.nodeName] = expresssion(_node.value);
                            } else {
                                o[PREFIX][_node.nodeName] = ["{" + _node.value + "}"];
                            }
                            //处理表达式；
                        } else if (_node.nodeName !== "class" && _node.nodeName !== "style") {
                            o.attributes[_node.nodeName] = _node.value;
                        } else if (_node.nodeName === "style") {
                            var styleList = _node.value.split(";");
                            o.style = {};
                            for (var k = 0; k < styleList.length; k++) {
                                var v = styleList[k].mySplit(":");
                                o.style[v[0]] = v[1];
                            }
                        }
                    }
                }
                o.childNodes = [];
                for (var i = 0; i < d.childNodes.length; i++) {
                    if (d.childNodes[i].nodeType !== 8) {
                        var child = {};
                        to(d.childNodes[i], child, o);
                        o.childNodes.push(child);
                    }
                }
            }

            to(dom, retObj);
            return retObj;
        }

//---------------私有函数-----------------//
        function isArray(v) {
            if (Object.prototype.toString.call(v) === "[object Array]") {
                return true
            } else {
                return false;
            }
        }

        function parse(exp) {//代替eval
            var option = {
                "+": "+",
                "-": "-",
                "*": "*",
                "/": "/",
                "%": "%",
                "!": "!",
                "?": "?",
                "&&": "&&",
                "||": "||",
                "==": "==",
                "===": "===",
                "=!": "!=",
                "==!": "!==",
                ">": ">",
                "=>": ">=",
                "<": "<",
                "=<": "<="
            }

            function caseValue(pushStr, list) {
                switch (pushStr) {
                    case "true":
                        list.push({expType: 1, expValue: true});
                        break;
                    case "false":
                        list.push({expType: 1, expValue: false});
                        break;
                    case "null":
                        list.push({expType: 1, expValue: null});
                        break;
                    default:
                        if (pushStr !== "") {
                            if (isNaN(pushStr)) {
                                list.push({expType: 1, expValue: pushStr});
                            } else {
                                list.push({expType: 1, expValue: pushStr * 1});
                            }
                        }
                }
            }

            var trope = {
                "\\\\": "\\\\"//转义字符串
            }

            function tree(exp) {
                var list = [];//语法树存储
                var stack = 0;
                var stackQ = 0;
                var temp = [];
                var isStr = false;
                var fun = "";
                var str = "";
                var lock = true;
                for (var i = 0; i < exp.length; i++) {
                    var char = exp.charAt(i);
                    if (isStr) {
                        if (temp.length > 0 && lock) {
                            var tp = temp.pop();
                            if (trope.hasOwnProperty(tp + char)) {
                                temp.push(char);
                                lock = false;
                                continue;
                            } else {
                                temp.push(tp);
                            }
                        }
                        lock = true;
                        if (char === str) {
                            list.push({expType: 1, expValue: temp.join("")});
                            temp = [];
                            str = "";
                            isStr = false;
                        } else {
                            temp.push(char);
                        }
                    } else {
                        if (stack > 0) {
                            if (char === "(") {
                                stack++;
                            } else if (char === ")") {
                                stack--;
                            }
                            if (stack === 1) {
                                if (fun === "") {
                                    list.push({expType: 1, expValue: tree(temp.join(""))});
                                } else {
                                    var argList = [];
                                    if (temp.length > 0) {
                                        argList = temp.join("").mySplit(",");
                                        for (var a = 0; a < argList.length; a++) {
                                            argList[a] = tree(argList[a]);
                                        }
                                    }
                                    if (qc.fun.hasOwnProperty(fun) && typeof qc.fun[fun] === "function") {
                                        var _value = qc.fun[fun].apply(qc.fun[fun], argList);
                                        if (_value === undefined) {
                                            _value = "\"\""
                                        } else {
                                            _value = _value + "";
                                        }
                                        list.push({expType: 1, expValue: _value});
                                    } else {
                                        window.console && console.log("%c函数" + fun + "未定义", "color:red")
                                    }
                                    fun = "";
                                }
                                temp = [];
                                stack = 0;
                            } else {
                                temp.push(char);
                            }
                            continue;
                        }
                        if (stackQ > 0) {
                            if (char === "[") {
                                stackQ++;
                            } else if (char === "]") {
                                stackQ--;
                            }
                            if (stackQ === 1) {
                                list.push({expType: 1, expValue: temp.join("").mySplit(",")});
                                temp = [];
                                stackQ = 0;
                            } else {
                                temp.push(char);
                            }
                            continue;
                        }
                        var optStr = "";
                        var opt = "";
                        var optIndex = 0;
                        for (var p = temp.length - 1; p >= 0; p--) {
                            optStr += temp[p];
                            if (option.hasOwnProperty(optStr)) {
                                opt = optStr;
                                optIndex = p;
                            }
                        }
                        if ((opt !== "") && (!option.hasOwnProperty(char + opt))) {
                            var pushStr = temp.splice(0, optIndex).join("");
                            caseValue(pushStr, list);
                            list.push({expType: 0, expValue: option[opt]});
                            temp = [];
                        }
                        if (char === "\"" || char === "'") {
                            if (temp.length !== 0) {
                                window.console && console.log("%c表达式:" + exp + "有误 ", "color:red");
                                return;
                            }
                            isStr = true;
                            str = char;
                        } else if (char === "(") {
                            if (temp.length !== 0) {
                                fun = temp.join("");
                                temp = [];
                            }
                            stack = 2;
                        } else if (char === "[") {
                            if (temp.length !== 0) {
                                window.console && console.log("%c表达式:" + exp + "有误 ", "color:red");
                                return;
                            }
                            stackQ = 2;
                        } else {
                            if (char !== " ") {
                                temp.push(char);
                            }
                        }
                    }
                }
                if (temp.length > 0) {
                    var endStr = temp.join("");
                    caseValue(endStr, list);
                    temp = [];
                }
                var result;
                if (list.length === 0) {
                    window.console && console.log("%c表达式为空", "color:red");
                    return;
                }
                if (list.length == 1) {
                    result = list[0].expValue;
                } else {
                    if (list[0].expType === 0) {
                        result = !list[1].expValue
                    } else {
                        result = list[0].expValue
                        var i = 1;
                        var len = list.length - 1;
                        while (i < len) {
                            if (len - i >= 2) {
                                var opt = list[i + 2].expValue;
                                var opt0 = list[i].expValue;
                                if (opt !== "*" && opt !== "/" && opt !== "%") {
                                    result = count(result, opt0, list[i + 1].expValue);
                                    i = i + 2;
                                } else {
                                    var temp = list[i + 1].expValue;
                                    i = i + 2;
                                    while (i < len) {
                                        temp = count(temp, list[i].expValue, list[i + 1].expValue);
                                        if (len - i >= 2) {
                                            var opt = list[i + 2].expValue;
                                            i = i + 2;
                                            if (opt !== "*" && opt !== "/" && opt !== "%") {
                                                break;
                                            }
                                        } else {
                                            i = i + 2;
                                        }
                                    }
                                    result = count(result, opt0, temp);
                                }
                            } else {
                                result = count(result, list[i].expValue, list[i + 1].expValue);
                                break;
                            }
                        }

                    }
                    function count(result, opt, value) {
                        if (opt === "+") {
                            result = (result + value);

                        } else if (opt === "-") {
                            result = (result - value);
                        } else if (opt === "*") {
                            result = (result * value);
                        }
                        else if (opt === "/") {
                            result = (result / value);
                        }
                        else if (opt === "%") {
                            result = (result % value);
                        }
                        else if (opt === "!") {
                            result = (!value);
                        }
                        else if (opt === "&&") {
                            result = (result && value);
                        }
                        else if (opt === "||") {
                            result = (result || value);
                        }
                        else if (opt === "!=") {
                            result = (result != value)
                        }
                        else if (opt === "!==") {
                            result = (result !== value)
                        }
                        else if (opt === ">") {
                            result = (result > value)
                        }
                        else if (opt === ">=") {
                            result = (result >= value)
                        } else if (opt === "<") {
                            result = (result < value)
                        }
                        else if (opt === "<=") {
                            result = (result <= value)
                        }
                        else if (opt === "==") {
                            if (isArray(value)) {
                                var index = -1;
                                for (var v = 0; v < value.length; v++) {
                                    if (tree(value[v]) == result) {
                                        index = v;
                                        break;
                                    }
                                }
                                result = index;
                            } else {
                                result = (result == value)
                            }
                        }
                        else if (opt === "===") {
                            if (isArray(value)) {
                                var index = -1;
                                for (var v = 0; v < value.length; v++) {
                                    if (tree(value[v]) === result) {
                                        index = v;
                                        break;
                                    }
                                }
                                result = index;
                            } else {
                                result = (result === value)
                            }
                        }
                        else if (opt === "?") {
                            if (isArray(value)) {
                                if (result === -1) {
                                    result = tree(value[value.length - 1]);
                                } else {
                                    if (value.length > result) {
                                        result = tree(value[result]);
                                    } else {
                                        result = "";
                                    }
                                }
                            } else {
                                result = value;
                            }
                        }
                        return result;
                    }
                }
                return result;
            }

            /*计算值*/
            return tree(exp);
        }

        //计算属性值
        function valuePro(moudel, p) {
            var mou = moudel;
            p = p.substr(1, p.length - 2);
            p = p.mySplit(".");
            for (var i = 0; i < p.length; i++) {
                if (mou.hasOwnProperty(p[i])) {
                    mou = mou[p[i]];
                } else {
                    mou = "";
                    break;
                }
            }
            if (typeof mou === "number" || typeof  mou === "boolean") {

                return mou + "";

            } else if (mou === null) {

                return "\"\"";

            } else if (typeof mou === "string") {
                mou = mou.replace(/\\/g, "\\\\");
                mou = mou.replace(/\"/g, "\\\"");
                return "\"" + mou + "\"";

            } else {

                return mou;

            }
        }

        function getValue(moudel, p, uuid, type, exp, widget) {
            var retValue;
            (function (mou) {
                p = p.substr(1, p.length - 2);
                p = p.mySplit(".");
                var parent1, parent2;
                var parentName1, parentName2;
                for (var i = 0; i < p.length; i++) {
                    parentName1 = parentName2;
                    parentName2 = p[i];
                    if (mou.hasOwnProperty(p[i])) {
                        parent1 = parent2;
                        parent2 = mou;
                        mou = mou[p[i]];
                    } else if (i === p.length - 1) {
                        mou[p[i]] = "";
                        mou = mou[p[i]]
                    } else {
                        mou = "";
                        break;
                    }
                }
                retValue = mou;
                if (isArray(parent2)) {
                    if (parent1 !== undefined) {
                        if (!parent1.hasOwnProperty("$map")) {
                            parent1.$map = {};
                        }
                        if (!parent1.$map.hasOwnProperty(parentName1)) {
                            parent1.$map[parentName1] = {};
                        }
                        if (!parent1.$map[parentName1].hasOwnProperty(uuid)) {
                            parent1.$map[parentName1][uuid] = [];
                        }
                        if (widget === undefined) {
                            parent1.$map[parentName1][uuid].push({uuid: uuid, type: type, exp: exp, vm: moudel});
                        } else {
                            parent1.$map[parentName1][uuid].push({
                                uuid: uuid,
                                type: type,
                                exp: exp,
                                vm: moudel,
                                widget: widget
                            });
                        }
                    }
                } else {
                    if (parent2 !== undefined) {
                        if (!parent2.hasOwnProperty("$map")) {
                            parent2.$map = {};
                        }
                        if (!parent2.$map.hasOwnProperty(parentName2)) {
                            parent2.$map[parentName2] = {};
                        }
                        if (!parent2.$map[parentName2].hasOwnProperty(uuid)) {
                            parent2.$map[parentName2][uuid] = [];
                        }
                        if (widget === undefined) {
                            parent2.$map[parentName2][uuid].push({uuid: uuid, type: type, exp: exp, vm: moudel})
                        } else {
                            parent2.$map[parentName2][uuid].push({
                                uuid: uuid,
                                type: type,
                                exp: exp,
                                vm: moudel,
                                widget: widget
                            })
                        }
                    }
                }
            })
            (moudel)
            if (typeof retValue === "number" || typeof  retValue === "boolean") {

                return retValue + "";

            } else if (retValue === null) {

                return "\"\"";

            } else {
                retValue = retValue.replace(/\\/g, "\\\\");
                retValue = retValue.replace(/\"/g, "\\\"");
                return "\"" + retValue + "\"";

            }
        }

        /*获取注释节点*/
        function getCommentNodes(value) {
            if (isLowIe()) {
                var doms = document.getElementsByTagName("!");
                for (var i = 0; i < doms.length; i++) {
                    if (doms[i].nodeValue === (value + "")) {
                        return doms[i];
                    }
                }
            } else {
                var objs = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null, false);
                var o;
                while (o = objs.nextNode()) {
                    if (o.nodeValue === (value + "")) {
                        return o;
                    }
                }
            }
            return null;
        }

        function count(moudel, expList) {
            var text = expList;
            var textList = [];
            for (var i = 0; i < text.length; i++) {
                if (text[i].indexOf("{") == 0) {
                    textList.push(valuePro(moudel, text[i]))
                } else {
                    textList.push(text[i]);
                }
            }
            var _expshow = textList.join("");
            ;
            try {
                var myValue = parse(_expshow);
                var t = typeof myValue;
                if (t == "string" || t == "number" || t == "boolean") {
                    return myValue;
                }

            } catch (e) {
                return "";
            }
        }

        function render(maps, dub) {
            for (var _map in  maps) {
                var map = maps[_map];
                var dom = document.querySelector("[" + PREFIX + "-id=\"" + _map + "\"" + "]");
                var comDom = getCommentNodes(_map);
                for (var m = 0; m < map.length; m++) {
                    var uuid = map[m]["uuid"];
                    var type = map[m]["type"];
                    var exp = map[m]["exp"];
                    var vm = map[m]["vm"];
                    var widget = map[m]["widget"];

                    type = type.split(",");
                    var k = type[0];
                    var v = type.length > 1 ? type[1] : "";
                    if (k === "visible") {
                        var myValue = count(vm, exp);
                        if (myValue) {
                            if (dom === null) {
                                if (comDom === null) {
                                    delete maps[uuid];
                                } else {
                                    //绑定
                                    delete maps[uuid];
                                    var ele = document.createElement("div");
                                    comDom.parentNode.insertBefore(ele, comDom);
                                    comDom.parentNode.removeChild(comDom);
                                    ele.outerHTML = bindData(vm, vm["$visible" + uuid]);
                                    fun.load();
                                    delete vm["$visible" + uuid];
                                }
                                break;
                            }
                        } else {
                            if (dom !== null) {
                                var comNode = document.createComment(uuid);//创建注释节点
                                dom.parentNode.insertBefore(comNode, dom);
                                dom.parentNode.removeChild(dom);
                            }
                            //垃圾回收
                            fun.collection();
                            break;
                        }
                    } else {
                        if (dom !== null) {
                            var myValue = count(vm, exp);
                            if (k === "attr") {
                                dom.setAttribute(v, dom);
                            } else if (k === "css") {
                                dom.style[v] = myValue;
                            } else if (k === "class") {
                                var classList = dom.className.split(" ");
                                for (var c = classList.length - 1; c >= 0; c--) {
                                    if (classList[c] === v) {
                                        classList.splice(c, 1);
                                    }
                                }
                                if (myValue) {
                                    classList.push(v);
                                }
                                dom.className = classList.join(" ");
                            } else if (k === "prop") {
                                if (myValue) {
                                    dom.setAttribute(v, "true");
                                } else {
                                    dom.removeAttribute(v);
                                }
                            } else if (k === "value") {
                                if (v === "text") {
                                    if (document.activeElement !== dom || dub !== dom) {
                                        dom.value = myValue;
                                    }
                                } else if (v === "textarea") {
                                    if (document.activeElement !== dom || dub !== dom) {
                                        dom.value = myValue;
                                    }
                                }

                            } else if (k === "text") {
                                try {
                                    dom.innerHTML = innerText(myValue);
                                } catch (e) {
                                    setTBodyInnerHTML(dom, innerText(myValue));
                                }
                            } else if (k === "html") {
                                try {
                                    dom.innerHTML = myValue;
                                } catch (e) {
                                    setTBodyInnerHTML(dom, myValue);
                                }
                            } else if (k === "select") {
                                if (document.activeElement !== dom) {
                                    for (var i = 0; i < dom.options.length; i++) {
                                        if (myValue == dom.options[i].value) {
                                            dom.options[i].selected = true;
                                            break;
                                        }
                                    }
                                }
                            }
                            else if (k === "check") {
                                if (document.activeElement !== dom) {
                                    if (myValue) {
                                        dom.setAttribute("checked", true);
                                    } else {
                                        dom.removeAttribute("checked");
                                    }
                                }
                            } else if (k === "radio") {
                                if (document.activeElement !== dom) {
                                    if (myValue === dom.value) {
                                        dom.checked = true;
                                    } else {
                                        dom.checked = false;
                                    }
                                }
                            } else if (k === "widget") {
                                widget.props[v] = myValue;
                                if (widget.hasOwnProperty("update") && typeof widget["update"] === "function") {
                                    widget.update();
                                }
                            }
                        } else {
                            if (comDom === null) {
                                delete maps[uuid];
                                break;
                            }
                        }
                    }
                }
            }
        }


        function expEval(moudel, expList, uuid, type, widget) {
            var text = expList;
            var textList = [];
            for (var i = 0; i < text.length; i++) {
                if (text[i].indexOf("{") == 0) {
                    textList.push(getValue(moudel, text[i], uuid, type, text, widget))
                } else {
                    textList.push(text[i]);
                }
            }
            var _expshow = textList.join("");
            ;
            try {
                var myValue = parse(_expshow);
                var t = typeof myValue;
                if (t == "string" || t == "number" || t == "boolean") {
                    return myValue;
                }

            } catch (e) {
                return "";
            }
        }

        function isLowIe() {
            var ret = false;
            var isIE = !!window.ActiveXObject;
            var isIE6 = isIE && !window.XMLHttpRequest;
            var isIE8 = isIE && !!document.documentMode;
            var isIE7 = isIE && !isIE6 && !isIE8;
            if (isIE) {
                if (isIE6) {
                    ret = true;
                } else if (isIE8) {
                    ret = true;
                } else if (isIE7) {
                    ret = true;
                }
            }
            return ret;
        }

        function getModel(o) {
            function _getModel(m) {
                var _o;
                if (isArray(m)) {
                    _o = [];
                    for (var i = 0; i < m.length; i++) {
                        _o.push(_getModel(m[i]))
                    }
                } else if (typeof m == "object") {
                    _o = {};
                    for (var p in  m) {
                        if (typeof m[p] !== "function" && p.indexOf("$") < 0) {
                            if (isArray(m[p])) {
                                _o[p] = [];
                                for (var i = 0; i < m[p].length; i++) {
                                    _o[p].push(_getModel(m[p][i]))
                                }
                            } else if (typeof m[p] == "object") {
                                _o[p] = _getModel(m[p]);
                            } else {
                                _o[p] = m[p];
                            }
                        }
                    }
                } else {
                    _o = m;
                }
                return _o;
            }

            return _getModel(o);
        }

        function innerText(bindText) {//此处为了兼容火狐不支持 innerText
            if (typeof bindText === "string") {
                bindText = bindText.replace(/</g, "&lt;");
                bindText = bindText.replace(/>/g, "&gt;");
                bindText = bindText.replace(/\r\n/g, "<br>");
                bindText = bindText.replace(/\n/g, "<br>");
            }
            return bindText;
        }

        //垃圾回收
        function collection() {
            for (var cll in  qc.vms) {
                var cllDom = document.querySelector("[" + PREFIX + "-id=\"" + cll + "\"" + "]");
                if (cllDom === null) {
                    delete qc.vms[cll];
                }
            }
        }

        function load() {
            for (var load in qc.load) {//渲染完触发回调
                qc.load[load].load();
            }
            qc.load = [];//
        }

        retFun.collection = collection;
        retFun.load = load;
        retFun.innerText = innerText;
        retFun.isArray = isArray;
        retFun.isNullObj = isNullObj;
        retFun.getRandom = getRandom;
        retFun.render = render;
        retFun.htmlToObj = htmlToObj;
        retFun.expEval = expEval;//计算值 并且生成映射表 moudel 当前vm expList 表达式 数组 uuid dom的标志 type="attr,color" 绑定类型
        retFun.getModel = getModel;// 获取纯净的数据对象
        retFun.valuePro = valuePro;//计算属性值 moudle,对象 p 属性
        retFun.isLowIe = isLowIe;
        retFun.parse = parse;
        retFun.count = count;
        return retFun;
    })
    ()

    function bindData(vm, vDom, option) {
        var path = "_";
        var show = true;
        if (vm.hasOwnProperty("$path")) {
            path = vm.$path;
        }
        function bindSet(vm, $p) {
            if ($p !== undefined) {
                vm.$p = $p;
            }
            if (!vm.hasOwnProperty("$map")) {
                vm.$map = {};
            }
            vm.setValue = function (key, value, dub) {
                function getMypath(path) {
                    path = path.replace(/\[\d+\]/g, "");
                    var view = vm.$path;
                    var len = view.indexOf(".");
                    if (len > -1) {
                        view = view.substr(0, len)
                    }
                    if (view !== null) {
                        view = qc.vms[view].$watch;
                        for (var i = 0; i < view.length; i++) {
                            if (view[i].path === path) {
                                return view[i].callback;
                            }
                        }
                    }
                    return false;
                }

                if (fun.isArray(value)) {
                    if (typeof key === "object") {
                        return;
                    }
                    var watch = getMypath(vm.$path + "." + key);
                    var oldValue = fun.getModel(vm[key]);
                    var each = this["$" + PREFIX + "-each-" + key];
                    vm[key] = value;
                    for (var _k = each.length - 1; _k >= 0; _k--) {
                        var html = [];
                        for (var l = 0; l < vm[key].length; l++) {
                            vm[key][l].$p = vm;
                            vm[key][l].$key = l;
                            vm[key][l].$path = vm.$path + "." + key + "[" + l + "]";
                            html.push(bindData(vm[key][l], each[_k].vDom));
                            if (html.length > 1000) {//数组进行性能优化
                                html = [html.join("")];
                            }
                        }
                        var s = document.querySelector("[" + PREFIX + "-id=\"" + each[_k].uuid + "\"" + "]");
                        if (s === null) {
                            each.splice(_k, 1);
                        } else {
                            try {
                                s.innerHTML = html.join("");
                            } catch (e) {
                                setTBodyInnerHTML(s, html.join(""));
                            }
                            fun.load();
                        }
                    }
                    //更新数组长度绑定
                    fun.render(this["$map"][key]);
                    //垃圾回收
                    fun.collection();
                    if (watch) {
                        watch(value, oldValue, vm);
                    }
                } else if (typeof key === "object") {
                    var watch = getMypath(vm.$path);
                    var oldValue = fun.getModel(this);

                    function setObject(map, data) {
                        for (var m in  map) {
                            if (typeof map[m] !== "function" && m.indexOf("$") < 0) {
                                if (map.hasOwnProperty("$" + PREFIX + "-each-" + m)) {
                                    if (data[m] !== undefined) {
                                        map.setValue(m, data[m]);
                                    }
                                    continue;
                                }
                                if (map["$map"] && map["$map"][m] !== undefined) {
                                    if (data[m] !== undefined) {
                                        if (typeof map[m] === "object") {
                                            if (data[m] !== undefined) {
                                                if (map[m].hasOwnProperty("$map")) {
                                                    setObject(map[m], data[m]);
                                                }
                                            }
                                        } else {
                                            map[m] = data[m];
                                            fun.render(map["$map"][m]);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    setObject(this, key);
                    if (watch) {
                        watch(key, oldValue, this.$p);
                    }
                }
                else {
                    if (this[key] === value) {
                        return;
                    }
                    var watch = getMypath(vm.$path + "." + key);
                    var oldValue = fun.getModel(vm[key]);
                    this[key] = value;
                    if (this.hasOwnProperty("$map")) {
                        var list = this.$map[key];
                        if (list !== undefined) {
                            fun.render(list, dub);
                        }
                    }
                    if (watch) {
                        watch(value, oldValue, vm);
                    }
                }
            }

            for (var v in vm) {
                if (typeof vm[v] !== "function" && v.indexOf("$") < 0 && !fun.isArray(vm[v]) && typeof vm[v] === "object") {
                    vm[v].$path = vm.$path + "." + v;
                    bindSet(vm[v], vm);
                }
            }
        }

        bindSet(vm)
        if (vDom.localName === "#text") {
            return vDom.nodeValue;
        }
        var uuid = fun.getRandom() + "";

        if (qc.widget.hasOwnProperty(vDom.localName)) {
            var implement = qc.widget[vDom.localName];
            if (implement.hasOwnProperty("view") && typeof implement.view === "function") {
                var obj = {
                    props: {},
                    id: uuid,
                    vDom: implement.vDom,
                    getElement: function () {
                        return document.querySelector("[" + PREFIX + "-id=\"" + this.id + "\"" + "]");
                    },
                    parent: {},
                    updateParent: function (key, value) {
                        function getValue(path) {
                            path = path.split(".");
                            var vm = qc.vms[path[0]];
                            for (var i = 1; i < path.length - 1; i++) {
                                var s = path[i];
                                if (s.indexOf("[") > -1) {
                                    var index = s.substr(s.indexOf("["));
                                    index = index.substr(1, index.length - 2);
                                    index = index * 1;
                                    s = s.substr(0, s.indexOf("["));
                                    vm = vm[s][index];
                                } else {
                                    vm = vm[s];
                                }
                            }
                            return {
                                vm: vm,
                                pro: path[path.length - 1]
                            }
                        }

                        var vmValue = getValue(this.parent[key]);
                        vmValue.vm.setValue(vmValue.pro, value);
                    },
                    view: implement.view
                }
                qc.vms[uuid] = {};
                qc.vms[uuid].$ve = {};
                qc.vms[uuid].$watch = [];
                qc.vms[uuid].$ve.$watch = function (path, callback) {
                    qc.vms[uuid].$watch.push({path: uuid + "." + path, callback: callback})
                }
                if (vDom.hasOwnProperty("attributes")) {
                    for (var ar in vDom.attributes) {
                        var name = ar;
                        var value = vDom.attributes[ar];
                        if (name.indexOf("bind:") === 0) {
                            name = name.substr(5);
                            var pValue = fun.expEval(vm, ["{" + value + "}"], uuid, "widget," + name, obj);
                            obj.props[name] = pValue;
                            obj.parent[name] = vm.$path + "." + value;
                        } else {
                            obj.props[name] = value;
                        }
                    }
                }
                obj.viewModel = qc.vms[uuid];
                obj.view(qc.vms[uuid], qc.vms[uuid].$ve);
                if (implement.hasOwnProperty("update")) {
                    obj.update = implement.update;
                }
                if (implement.hasOwnProperty("load")) {
                    obj.load = implement.load;
                    qc.load.push(obj);
                }
                delete qc.vms[uuid].$ve.$watch;
                qc.vms[uuid].$path = uuid;
                var widgetStr = bindData(qc.vms[uuid], obj.vDom);
                widgetStr = widgetStr.replace(">", " " + PREFIX + "-id=\"" + uuid + "\"" + " >");
                return widgetStr;

            }
        }
        if (vDom[PREFIX].hasOwnProperty(PREFIX + "-visible")) {
            var expV = vDom[PREFIX][PREFIX + "-visible"];
            vm["$visible" + uuid] = vDom;//建立绑定映射
            if (!fun.expEval(vm, expV, uuid, "visible")) {
                show = false;
            }
        }
        var html = ["<" + vDom.localName];
        if (show) {
            if (!fun.isNullObj(vDom[PREFIX])) {
                html.push(" " + PREFIX + "-id=\"" + uuid + "\"")
            }
            var classObject = {};
            if (vDom.hasOwnProperty("className")) {
                var classList = vDom.className;
                for (var i = 0; i < classList.length; i++) {
                    classObject[classList[i]] = classList[i];
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-class")) {
                var dClass = vDom[PREFIX][PREFIX + "-class"];
                for (var c in dClass) {
                    var result = fun.expEval(vm, dClass[c], uuid, "class," + c);
                    if (result) {
                        classObject[c] = c;
                    } else {
                        delete classObject[c];
                    }
                }
                classList = [];
                for (var c in classObject) {
                    classList.push(c);
                }
                if (classList.length > 0) {
                    html.push(" class=\"" + classList.join(" ") + "\"");//class
                }
            } else {
                if (vDom.className.length > 0) {
                    html.push(" class=\"" + vDom.className.join(" ") + "\"");//class
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-attr")) {
                var dAttr = vDom[PREFIX][PREFIX + "-attr"];
                for (var a in dAttr) {
                    var value = fun.expEval(vm, dAttr[a], uuid, "attr," + a);
                    html.push(" " + a + "=" + "\"" + value + "\"");
                    if (a === "value" && vDom.localName === "option") {
                        if (option === value) {
                            html.push(" selected");
                        }
                    }
                    if (a === "value") {
                        if (vDom[PREFIX].hasOwnProperty(PREFIX + "-radio")) {
                            var textValue = vDom[PREFIX][PREFIX + "-radio"];
                            var text = textValue[0];
                            text = text.substr(1, text.length - 2);
                            if (fun.expEval(vm, textValue, uuid, "radio") === value) {
                                html.push(" checked onclick=qc.bindRadio(\"" + path + "." + text + "\",this)");
                            } else {
                                html.push(" onclick=qc.bindRadio(\"" + path + "." + text + "\",this)");
                            }
                        }
                    }
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-prop")) {
                var dProp = vDom[PREFIX][PREFIX + "-prop"];
                for (var p in dProp) {
                    if (fun.expEval(vm, dProp[p], uuid, "prop," + p)) {
                        html.push(" " + p);
                    }
                }
            }
            if (vDom.hasOwnProperty("attributes")) {
                for (var ar in vDom.attributes) {
                    var name = ar;
                    var value = vDom.attributes[ar];
                    if (((!vDom[PREFIX].hasOwnProperty(PREFIX + "-attr")) || vDom[PREFIX][PREFIX + "-attr"][name] === undefined) && ((!vDom[PREFIX].hasOwnProperty(PREFIX + "-prop")) || vDom[PREFIX][PREFIX + "-prop"][name] === undefined)) {
                        html.push(" " + name + "=" + "\"" + value + "\"");
                        if (name === "value" && vDom.localName === "option") {
                            if (option === value) {
                                html.push(" selected");
                            }
                        }
                        if (name === "value") {//因为要和自身的属性value做比较，所以放在 属性的循环里
                            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-radio")) {
                                var textValue = vDom[PREFIX][PREFIX + "-radio"];
                                var text = textValue[0];
                                text = text.substr(1, text.length - 2);
                                if (fun.expEval(vm, textValue, uuid, "radio") === value) {
                                    html.push(" checked onclick=qc.bindRadio(\"" + path + "." + text + "\",this)");
                                } else {
                                    html.push(" onclick=qc.bindRadio(\"" + path + "." + text + "\",this)");
                                }
                            }
                        }
                    }

                }
            }
            var styleList = [];
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-css")) {
                var dCss = vDom[PREFIX][PREFIX + "-css"];
                for (var c in dCss) {
                    styleList.push(c + ":" + fun.expEval(vm, dCss[c], uuid, "css," + c));
                }
            }
            if (vDom.hasOwnProperty("style")) {
                for (var sy in vDom.style) {
                    if ((!vDom[PREFIX].hasOwnProperty(PREFIX + "-css")) || vDom[PREFIX][PREFIX + "-css"][sy] === undefined) {
                        styleList.push(sy + ":" + vDom.style[sy]);
                    }
                }
            }
            if (styleList.length > 0) {
                html.push(" style=\"" + styleList.join(";") + "\"");
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value")) {
                var textValue = vDom[PREFIX][PREFIX + "-value"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + fun.expEval(vm, textValue, uuid, "value,text") + "\"");
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-change")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-change"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + fun.expEval(vm, textValue, uuid, "value,text") + "\"");
                }
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                if (fun.isLowIe()) {
                    html.push(" onpropertychange=qc.bindText(\"" + path + "." + text + "\",this)");
                } else {
                    html.push(" oninput=qc.bindText(\"" + path + "." + text + "\",this)");
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-blur")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-blur"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + fun.expEval(vm, textValue, uuid, "value,text") + "\"");
                }
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                html.push(" onchange=qc.bindText(\"" + path + "." + text + "\",this)");
            }
            var selectValue = null;
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-select")) {
                var textValue = vDom[PREFIX][PREFIX + "-select"];
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                selectValue = fun.expEval(vm, textValue, uuid, "select");
                html.push(" onchange=qc.bindSelect(\"" + path + "." + text + "\",this)");
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-check")) {
                var textValue = vDom[PREFIX][PREFIX + "-check"];
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                if (fun.expEval(vm, textValue, uuid, "check")) {
                    html.push(" checked onclick=qc.bindCheck(\"" + path + "." + text + "\",this)");
                } else {
                    html.push(" onclick=qc.bindCheck(\"" + path + "." + text + "\",this)");
                }
            }
            //绑定事件
            // click,dblclick,mousedown,mouseup
            //移动 touchstart touchend//需要扩展
            var eventList = ["click", "dblclick", "mousedown", "mouseup", "mousemove", "mouseenter ", "mouseleave", "mouseover", "mouseout"];
            eventList = eventList.concat(["touchstart", "touchmove", "touchend", "touchcancel"]);
            for (var i = 0; i < eventList.length; i++) {
                var veType = eventList[i];
                if (vDom[PREFIX].hasOwnProperty(PREFIX + "-" + veType + "")) {
                    var veName = vDom[PREFIX][PREFIX + "-" + veType + ""];
                    veName = veName[0];
                    veName = veName.substr(1, veName.length - 2)
                    html.push(" " + PREFIX + "-path=\"" + path + "\"");
                    html.push(" " + PREFIX + "-vetype=\"" + veType + "\"");
                    html.push(" " + PREFIX + "-vename=\"" + veName + "\"");
                }
            }
            for (var veType in  qc.ve) {//扩展事件绑定
                if (vDom[PREFIX].hasOwnProperty(PREFIX + "-" + veType + "")) {
                    var veName = vDom[PREFIX][PREFIX + "-" + veType + ""];
                    veName = veName[0];
                    veName = veName.substr(1, veName.length - 2)
                    html.push(" " + PREFIX + "-path=\"" + path + "\"");
                    html.push(" " + PREFIX + "-vetype=\"" + veType + "\"");
                    html.push(" " + PREFIX + "-vename=\"" + veName + "\"");
                }
            }
            html.push(">");
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value")) {
                var textValue = vDom[PREFIX][PREFIX + "-value"];
                if (vDom.localName !== "input") {
                    html.push(fun.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-change")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-change"];
                if (vDom.localName !== "input") {
                    html.push(fun.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-blur")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-blur"];
                if (vDom.localName !== "input") {
                    html.push(fun.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
        }
        var arr = vDom[PREFIX][PREFIX + "-each"]
        if (arr !== undefined) {
            arr = arr[0];
            arr = arr.substr(1, arr.length - 2);
            var arrList = arr.split(".");
            var $parent, $prop;
            if (arrList.length > 1) {
                $prop = arrList.pop();
                $parent = fun.valuePro(vm, "{" + arrList.join(".") + "}");
            } else {
                $parent = vm;
                $prop = arr;
            }
            var list = $parent[$prop];
            if (list === undefined) {
                $parent[$prop] = [];
                list = $parent[$prop];
            }
            for (var i = 0; i < vDom.childNodes.length; i++) {
                if (vDom.childNodes[i].localName !== "#text") {
                    if (!$parent.hasOwnProperty("$" + PREFIX + "-each-" + $prop)) {
                        $parent["$" + PREFIX + "-each-" + $prop] = [];
                    }
                    $parent["$" + PREFIX + "-each-" + $prop].push({
                        uuid: uuid,
                        vDom: vDom.childNodes[i]
                    })
                    for (var l = 0; l < list.length; l++) {
                        list[l].$p = $parent;
                        list[l].$key = l;
                        list[l].$path = path + "." + arr + "[" + l + "]";
                        if (selectValue === null) {
                            html.push(bindData(list[l], vDom.childNodes[i]));
                        } else {
                            html.push(bindData(list[l], vDom.childNodes[i], selectValue));
                        }
                        if (html.length > 1000) {//数组进行性能优化
                            html = [html.join("")];
                        }
                    }
                    $parent[$prop + "push"] = function (value) {
                        var divObject = $parent["$" + PREFIX + "-each-" + $prop];
                        var list = $parent[$prop];
                        var start = list.length;
                        list.push(value)
                        list[start].$p = $parent;
                        list[start].$key = start;
                        list[start].$path = path + "." + arr + "[" + start + "]";
                        for (var k = divObject.length - 1; k >= 0; k--) {
                            var divText = [];
                            divText.push(bindData(list[start], divObject[k].vDom));
                            var s = document.querySelector("[" + PREFIX + "-id=\"" + divObject[k].uuid + "\"" + "]");
                            if (s === null) {
                                divObject.splice(k, 1);
                            } else {
                                try {
                                    s.innerHTML = s.innerHTML + divText.join("");
                                } catch (e) {
                                    setTBodyAppendHtml(s, divText.join(""));
                                }
                                fun.load();
                            }
                        }
                        //更新数组长度绑定
                        fun.render($parent["$map"][$prop]);
                    }
                    $parent[$prop + "pop"] = function () {
                        var list = fun.getModel($parent[$prop]);
                        list.pop();
                        $parent.setValue($prop, list);

                    }
                    $parent[$prop + "splice"] = function () {
                        var list = fun.getModel($parent[$prop]);
                        list.splice.apply(list, arguments);
                        $parent.setValue($prop, list);

                    }
                    $parent[$prop + "shift"] = function () {
                        var list = fun.getModel($parent[$prop]);
                        list.shift();
                        $parent.setValue($prop, list);
                    }
                    $parent[$prop + "unshift"] = function (value) {
                        var list = fun.getModel($parent[$prop]);
                        list.unshift(value);
                        $parent.setValue($prop, list);
                    }
                    $parent[$prop + "concat"] = function (value) {
                        var divObject = $parent["$" + PREFIX + "-each-" + $prop];
                        var list = $parent[$prop];
                        var start = list.length;
                        list.concat(value)
                        for (var k = divObject.length - 1; k >= 0; k--) {
                            var divText = [];
                            for (var l = start; l < value.length + start; l++) {
                                list[l].$p = $parent;
                                list[l].$key = l;
                                list[l].$path = path + "." + arr + "[" + l + "]";
                                divText.push(bindData(list[l], divObject[k].vDom));
                            }
                            var s = document.querySelector("[" + PREFIX + "-id=\"" + divObject[k].uuid + "\"" + "]");
                            if (s === null) {
                                divObject.splice(k, 1);
                            } else {
                                try {
                                    s.innerHTML = s.innerHTML + divText.join("");
                                } catch (e) {
                                    setTBodyAppendHtml(s, divText.join(""));
                                }
                                fun.load();
                            }
                        }
                        //更新数组长度绑定
                        fun.render($parent["$map"][$prop]);

                    }
                    break;
                }

            }
        }
        else {
            if (show) {
                if (vDom.childNodes.length === 0) {
                    if (vDom[PREFIX].hasOwnProperty(PREFIX + "-text")) {//绑定text
                        var text = vDom[PREFIX][PREFIX + "-text"];
                        var bindText = fun.expEval(vm, text, uuid, "text");
                        html.push(fun.innerText(bindText));
                    } else if (vDom[PREFIX].hasOwnProperty(PREFIX + "-html")) {
                        var text = vDom[PREFIX][PREFIX + "-text"];
                        var bindText = fun.expEval(vm, text, uuid, "text");
                        html.push(bindText);
                    } else {
                        html.push(vDom.innerHTML);
                    }
                } else {
                    for (var i = 0; i < vDom.childNodes.length; i++) {
                        if (selectValue === null) {
                            html.push(bindData(vm, vDom.childNodes[i]));
                        } else {
                            html.push(bindData(vm, vDom.childNodes[i], selectValue));
                        }
                        ;
                        if (html.length > 1000) {//数组进行性能优化
                            html = [html.join("")];
                        }
                    }
                }
            } else {
                for (var i = 0; i < vDom.childNodes.length; i++) {
                    if (selectValue === null) {
                        bindData(vm, vDom.childNodes[i])
                    } else {
                        bindData(vm, vDom.childNodes[i], selectValue)
                    }
                }
            }
        }
        html.push("</" + vDom.localName + ">")
        if (show) {
            return html.join("");
        } else {
            return "<!--" + uuid + "-->";
        }
    }

    function template(html, data) {
        function temp(vm, vDom, option) {
            if (vDom.localName === "#text") {
                return vDom.nodeValue;
            }

            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-visible")) {
                var expV = vDom[PREFIX][PREFIX + "-visible"];
                if (!fun.count(vm, expV)) {
                    return "";
                }
            }
            var html = ["<" + vDom.localName];
            var classObject = {};
            if (vDom.hasOwnProperty("className")) {
                var classList = vDom.className;
                for (var i = 0; i < classList.length; i++) {
                    classObject[classList[i]] = classList[i];
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-class")) {
                var dClass = vDom[PREFIX][PREFIX + "-class"];
                for (var c in dClass) {
                    var result = fun.count(vm, dClass[c]);
                    if (result) {
                        classObject[c] = c;
                    } else {
                        delete classObject[c];
                    }
                }
                classList = [];
                for (var c in classObject) {
                    classList.push(c);
                }
                if (classList.length > 0) {
                    html.push(" class=\"" + classList.join(" ") + "\"");//class
                }
            } else {
                if (vDom.className.length > 0) {
                    html.push(" class=\"" + vDom.className.join(" ") + "\"");//class
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-attr")) {
                var dAttr = vDom[PREFIX][PREFIX + "-attr"];
                for (var a in dAttr) {
                    var value = fun.count(vm, dAttr[a]);
                    html.push(" " + a + "=" + "\"" + value + "\"");
                    if (a === "value" && vDom.localName === "option") {
                        if (option === value) {
                            html.push(" selected");
                        }
                    }
                    if (a === "value") {
                        if (vDom[PREFIX].hasOwnProperty(PREFIX + "-radio")) {
                            var textValue = vDom[PREFIX][PREFIX + "-radio"];
                            var text = textValue[0];
                            text = text.substr(1, text.length - 2);
                            if (fun.count(vm, textValue) === value) {
                                html.push(" checked");
                            }
                        }
                    }
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-prop")) {
                var dProp = vDom[PREFIX][PREFIX + "-prop"];
                for (var p in dProp) {
                    if (fun.count(vm, dProp[p])) {
                        html.push(" " + p);
                    }
                }
            }
            if (vDom.hasOwnProperty("attributes")) {
                for (var ar in vDom.attributes) {
                    var name = ar;
                    var value = vDom.attributes[ar];
                    if (((!vDom[PREFIX].hasOwnProperty(PREFIX + "-attr")) || vDom[PREFIX][PREFIX + "-attr"][name] === undefined) && ((!vDom[PREFIX].hasOwnProperty(PREFIX + "-prop")) || vDom[PREFIX][PREFIX + "-prop"][name] === undefined)) {
                        html.push(" " + name + "=" + "\"" + value + "\"");
                        if (name === "value" && vDom.localName === "option") {
                            if (option === value) {
                                html.push(" selected");
                            }
                        }
                        if (name === "value") {//因为要和自身的属性value做比较，所以放在 属性的循环里
                            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-radio")) {
                                var textValue = vDom[PREFIX][PREFIX + "-radio"];
                                var text = textValue[0];
                                text = text.substr(1, text.length - 2);
                                if (fun.count(vm, textValue) === value) {
                                    html.push(" checked");
                                }
                            }
                        }
                    }

                }
            }
            var styleList = [];
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-css")) {
                var dCss = vDom[PREFIX][PREFIX + "-css"];
                for (var c in dCss) {
                    styleList.push(c + ":" + fun.count(vm, dCss[c]));
                }
            }
            if (vDom.hasOwnProperty("style")) {
                for (var sy in vDom.style) {
                    if ((!vDom[PREFIX].hasOwnProperty(PREFIX + "-css")) || vDom[PREFIX][PREFIX + "-css"][sy] === undefined) {
                        styleList.push(sy + ":" + vDom.style[sy]);
                    }
                }
            }
            if (styleList.length > 0) {
                html.push(" style=\"" + styleList.join(";") + "\"");
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value")) {
                var textValue = vDom[PREFIX][PREFIX + "-value"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + fun.count(vm, textValue) + "\"");
                }
            }
            var selectValue = null;
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-select")) {
                var textValue = vDom[PREFIX][PREFIX + "-select"];
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                selectValue = fun.count(vm, textValue);
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-check")) {
                var textValue = vDom[PREFIX][PREFIX + "-check"];
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                if (fun.count(vm, textValue)) {
                    html.push(" checked");
                }
            }
            html.push(">");
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value")) {
                var textValue = vDom[PREFIX][PREFIX + "-value"];
                if (vDom.localName !== "input") {
                    html.push(fun.count(vm, textValue));
                }
            }
            var arr = vDom[PREFIX][PREFIX + "-each"]
            if (arr !== undefined) {
                arr = arr[0];
                arr = arr.substr(1, arr.length - 2);
                var arrList = arr.split(".");
                var $parent, $prop;
                if (arrList.length > 1) {
                    $prop = arrList.pop();
                    $parent = fun.count(vm, "{" + arrList.join(".") + "}");
                } else {
                    $parent = vm;
                    $prop = arr;
                }
                var list = $parent[$prop];
                if (list === undefined) {
                    $parent[$prop] = [];
                    list = $parent[$prop];
                }
                for (var i = 0; i < vDom.childNodes.length; i++) {
                    if (vDom.childNodes[i].localName !== "#text") {
                        for (var l = 0; l < list.length; l++) {
                            list[l].$key = l;
                            if (selectValue === null) {
                                html.push(temp(list[l], vDom.childNodes[i]));
                            } else {
                                html.push(temp(list[l], vDom.childNodes[i], selectValue));
                            }
                            if (html.length > 1000) {//数组进行性能优化
                                html = [html.join("")];
                            }
                        }
                        break;
                    }

                }
            }
            else {
                if (vDom.childNodes.length === 0) {
                    if (vDom[PREFIX].hasOwnProperty(PREFIX + "-text")) {//绑定text
                        var text = vDom[PREFIX][PREFIX + "-text"];
                        var bindText = fun.count(vm, text);
                        html.push(fun.innerText(bindText));
                    } else if (vDom[PREFIX].hasOwnProperty(PREFIX + "-html")) {
                        var text = vDom[PREFIX][PREFIX + "-text"];
                        var bindText = fun.count(vm, text);
                        html.push(bindText);
                    } else {
                        html.push(vDom.innerHTML);
                    }
                } else {
                    for (var i = 0; i < vDom.childNodes.length; i++) {
                        vDom.childNodes[i]
                        if (selectValue === null) {
                            html.push(temp(vm, vDom.childNodes[i]));
                        } else {
                            html.push(temp(vm, vDom.childNodes[i], selectValue));
                        }
                        ;
                        if (html.length > 1000) {//数组进行性能优化
                            html = [html.join("")];
                        }
                    }
                }
            }
            html.push("</" + vDom.localName + ">")
        }

        var dom = document.createElement("div");
        try {
            dom.innerHTML = html;
        } catch (e) {
            setTBodyInnerHTML(dom, html)
        }
        dom = dom.children[0];
        var vDom = fun.htmlToObj(dom);
        return temp(data, vDom);
    }

//---------------初始化对象----------------//
    (function () {
        var qc = {};
        qc.widget = {};//控件扩展
        qc.ve = {};//事件扩展
        qc.vms = {};//储存vm所有对象
        qc.load = [];
        qc.view = function (name, factory) {//初始化view并扫描
            qc.vms[name] = {};
            qc.vms[name].$ve = {};
            qc.vms[name].$watch = [];
            qc.vms[name].$ve.$watch = function (path, callback) {
                qc.vms[name].$watch.push({path: name + "." + path, callback: callback})
            }
            factory(qc.vms[name], qc.vms[name].$ve);//vm对象
            delete qc.vms[name].$ve.$watch;
            qc.sweep(name);
            return qc.vms[name];
        }
//---------------扫描事件----------------//
        qc.sweep = function (_vm) {
            var dom = document.querySelector("[" + PREFIX + "-view='" + _vm + "']");
            if (dom !== null) {
                var VDom = fun.htmlToObj(dom);
                qc.vms[_vm].$path = _vm + "";
                var outerHtml = bindData(qc.vms[_vm], VDom);
                dom.outerHTML = outerHtml;
                fun.load();
                //绑定事件
                var newDom = document.querySelector("[" + PREFIX + "-view='" + _vm + "']");
                newDom.removeAttribute(PREFIX + "-view");
                newDom.setAttribute(PREFIX + "-id", _vm)
                newDom.onclick = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;//兼容IE
                    bindEvent(event.target, _vm, "click", event);
                }
                newDom.ondblclick = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(event.target, _vm, "dblclick", event);

                }
                if (isMobile()) {//移动
                    newDom.addEventListener("touchstart", function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "touchstart", event);
                    })
                    newDom.addEventListener("touchmove", function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "touchmove", event);
                    })
                    newDom.addEventListener("touchend", function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "touchend", event);

                    })
                    newDom.addEventListener("touchcancel", function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "touchcancel", event);

                    })

                } else {//pc
                    newDom.onmousedown = function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "mousedown", event);

                    }
                    newDom.onmouseup = function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "mouseup", event);
                    }
                    newDom.onmousemove = function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "mousemove", event);
                    }
                    newDom.onmouseout = function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "mouseout", event);
                        bindEvent(event.target, _vm, "mouseleave", event, true);
                    }
                    newDom.onmouseover = function (e) {
                        var event = window.event || e;
                        event.target = event.target ? event.target : event.srcElement;
                        bindEvent(event.target, _vm, "mouseover", event);
                        bindEvent(event.target, _vm, "mouseenter", event, true);
                    }
                }
            }
            function bindEvent(_this, vmName, vType, event, rec) {
                function getTarget(_this) {
                    var veType = _this.getAttribute(PREFIX + "-vetype");
                    if ((veType !== undefined) && (veType !== null)) {
                        if (veType === vType || qc.ve.hasOwnProperty(veType)) {
                            var path = _this.getAttribute(PREFIX + "-path");
                            var veName = _this.getAttribute(PREFIX + "-vename");
                            if (qc.vms[vmName].$ve.hasOwnProperty(veName) && typeof qc.vms[vmName].$ve[veName] === "function") {
                                path = path.split(".");
                                var vm = qc.vms[path[0]];
                                for (var i = 1; i < path.length; i++) {
                                    var s = path[i];
                                    if (s.indexOf("[") > -1) {
                                        var index = s.substr(s.indexOf("["));
                                        index = index.substr(1, index.length - 2);
                                        index = index * 1;
                                        s = s.substr(0, s.indexOf("["));
                                        vm = vm[s][index];
                                    } else {
                                        vm = vm[s];
                                    }
                                }
                                var run = (function (vmName, veName, _this, vm, event) {
                                    return function () {
                                        qc.vms[vmName].$ve[veName].call(_this, vm, event);
                                    }
                                })(vmName, veName, _this, vm, event);
                                if (veType === vType) {
                                    run();
                                } else {
                                    var extend = qc.ve[veType];
                                    if (extend.hasOwnProperty(vType) && typeof extend[vType] === "function") {
                                        extend[vType].call(extend, run, event);
                                    }
                                }
                            }
                        } else if (_this !== newDom && _this.parentNode !== newDom && rec !== true) {
                            getTarget(_this.parentNode)
                        }
                    } else if (_this !== newDom && _this.parentNode !== newDom) {
                        getTarget(_this.parentNode)
                    }
                }

                getTarget(_this);
            }
        }
        //创建控件
        qc.createWidget = function (name, implement) {
            if (!qc.hasOwnProperty("widget")) {
                qc.widget = {};
            }
            if (implement.hasOwnProperty("templete") && implement.templete !== "") {
                var dom = document.createElement("div");
                try {
                    dom.innerHTML = implement.templete;
                } catch (e) {
                    setTBodyInnerHTML(dom, implement.templete);
                }
                dom = dom.children[0];
                implement.vDom = fun.htmlToObj(dom);
            }

            qc.widget[name] = implement;
        }
        function isMobile() {
            if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
                return true;
            }
            else {
                return false;
            }
        }

        function getValue(path) {
            path = path.split(".");
            var vm = qc.vms[path[0]];
            for (var i = 1; i < path.length - 1; i++) {
                var s = path[i];
                if (s.indexOf("[") > -1) {
                    var index = s.substr(s.indexOf("["));
                    index = index.substr(1, index.length - 2);
                    index = index * 1;
                    s = s.substr(0, s.indexOf("["));
                    vm = vm[s][index];
                } else {
                    vm = vm[s];
                }
            }
            return {
                vm: vm,
                pro: path[path.length - 1]
            }
        }

        qc.extendEvent = function () {
            var ars = arguments;
            for (var i = 0; i < ars.length; i++) {
                qc.ve[ars[i].name] = ars[i];
            }
        }
        qc.bindText = function (path, obj) {
            if (document.activeElement === obj) {
                var v = getValue(path);
                v.vm.setValue(v.pro, obj.value, obj);
            }
        }
        qc.bindSelect = function (path, obj) {
            if (document.activeElement === obj) {
                var v = getValue(path);
                if (obj.selectedIndex < obj.options.length) {
                    v.vm.setValue(v.pro, obj.options[obj.selectedIndex].value);
                } else {
                    obj.selectedIndex = -1;
                }
            }
        }
        qc.bindCheck = function (path, obj) {
            if (document.activeElement === obj) {
                var v = getValue(path);
                if (obj.checked) {
                    v.vm.setValue(v.pro, true);
                } else {
                    v.vm.setValue(v.pro, false);
                }
            }
        }
        qc.bindRadio = function (path, obj) {
            if (document.activeElement === obj) {
                var v = getValue(path);
                if (obj.checked) {
                    v.vm.setValue(v.pro, obj.value);
                }
            }
        }
        qc.fun = {};
        qc.collection = fun.collection;
        qc.getModel = fun.getModel;
        qc.parse = fun.parse;
        qc.template = template;
        qc.getRandom = fun.getRandom;
        /*储存函数调用*/
        window.qc = qc;
    })()
})()
;
(function () {
    //---------------commonjs规范----------------//
    function sendAjaxRequest(data) {
        var XMLHttpReq;
        try {
            XMLHttpReq = new ActiveXObject("Msxml2.XMLHTTP");//IE高版本创建XMLHTTP
        }
        catch (E) {
            try {
                XMLHttpReq = new ActiveXObject("Microsoft.XMLHTTP");//IE低版本创建XMLHTTP
            }
            catch (E) {
                XMLHttpReq = new XMLHttpRequest();//兼容非IE浏览器，直接创建XMLHTTP对象
            }
        }                                //创建XMLHttpRequest对象
        XMLHttpReq.open("get", data.url, false);
        XMLHttpReq.onreadystatechange = processResponse; //指定响应函数
        XMLHttpReq.send(null);
//回调函数
        function processResponse() {
            if (XMLHttpReq.readyState == 4 && XMLHttpReq.status == 200) {
                var text = XMLHttpReq.responseText;
                //text = window.decodeURI(text);
                if (typeof data.success === "function") {
                    data.success(text);
                }
            } else {
                if (typeof data.error === "function") {
                    data.error();
                }
            }
        }
    }

    var tmpTag = document.location.protocol + "//";
    var _cssCache = {};
    var _absUrl = (function () {
        var a;
        return function (url) {
            if (!a) a = document.createElement('a');
            a.href = url;
            return a.href;
        };
    })();
    var _require = function (parent, path) {
        var _moudle;
        var _type = "js";
        var _basePath;
        if (path.indexOf(tmpTag) < 0) {
            if (path.substr(0, 2) == "./") {
                path = path.substr(2);
                _basePath = parent + path;
            } else if (path.substr(0, 1) == "/") {
                _basePath = tmpTag + window.location.host + path;
            } else {
                var _host;
                if (parent == "") {
                    _host = window.location.href;
                } else {
                    _host = parent;
                }
                if (_host.indexOf("/") > -1) {
                    _host = _host.substr(0, _host.lastIndexOf("/") + 1);
                } else {
                    _host = _host + "/";
                }
                _basePath = _host + path;
            }
        } else {
            _basePath = path;
        }
        var _path = _basePath;
        _basePath = _basePath.substr(0, _basePath.lastIndexOf("/") + 1);
        if (_path.lastIndexOf("!") > -1) {
            _type = _path.substr(_path.lastIndexOf("!") + 1);
            _path = _path.substr(0, _path.lastIndexOf("!"));
        } else {
            if (_path.lastIndexOf(".js") < 0) {
                _path = _path + ".js";
            }
        }
        var _myUrl = _absUrl(_path);
        sendAjaxRequest({
            "url": _myUrl + "?r=" + (new Date() - 1),
            "error": function () {
                window.console && console.log(_myUrl + "加载失败");
            },
            "success": function (data) {
                _moudle = data;
            }
        });

        if (_type == "js") { //js预编译
            var _script = "(function(exports){\n";
            _script += "var $parent = \"" + _basePath + "\";\n";
            _script += _moudle.replace(/require\(/g, "_require($parent,");
            _script += "\n return exports;\n";
            _script += "})({});" + "//@ sourceURL=" + _myUrl;
            _moudle = eval(_script);
        } else if (_type == "css") {
            var _key = _myUrl;
            if (!_cssCache.hasOwnProperty(_key)) {
                $("<style></style>").html(_moudle).appendTo("head");
                _cssCache[_key] = "load";
            }
        }
        return _moudle;
    }
    window.require = function (path) {
        return _require("", path);
    };
})();
;
(function () {
    //创建组件
    qc.UIComponent = function (config) {
        var url = config.url;
        var id = config.id;
        var data = config.data;
        var element = document.getElementById(id);
        element.setAttribute("qc-view", id);
        return require(url)(document.getElementById(id), id, data);
    }
})()