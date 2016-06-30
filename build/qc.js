/**
 * Created by zhangyan on 2016/4/5.
 * head.js
 */
;
(function (qc) {
    var PREFIX = "q";
    if (!window.qc) {
        window.qc = {};
        window.qc.PREFIX = PREFIX;
        window.qc.fun = {};
        window.qc.animate = {};
    }
})()

/**
 * Created by zhangyan on 2016/4/5.
 * 主要用于放和ie的兼容处理相关内容
 * ie.js
 */
;(function () {
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
    /*私有函数*/ //tbosy 复制 iebug
    var setTBodyInnerHTML = function (tbody, html) {//兼容ie6-ie9 的table innerHTML 不能修改
        var div = document.createElement('div')
        div.innerHTML = '<table><tbody>' + html + '</tbody></table>'
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild)
        }
        while (div.firstChild.firstChild.childNodes.length > 0) {
            tbody.appendChild(div.firstChild.firstChild.childNodes[0])
        }
    }

    var setTBodyAppendHtml = function (tbody, html) {
        var div = document.createElement('div')
        div.innerHTML = '<table><tbody>' + html + '</tbody></table>';
        while (div.firstChild.firstChild.childNodes.length > 0) {
            tbody.appendChild(div.firstChild.firstChild.childNodes[0])
        }
    }

    var isLowIe = function () {/*ie11以下为低版本*/
        return window.ActiveXObject ? true : false;
    }
    /*获取注释节点*/
    var getCommentNodes = function (value) {
        if (window.NodeFilter) {
            var objs = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, null, false);
            var o;
            while (o = objs.nextNode()) {
                if (o.nodeValue === (value + "")) {
                    return o;
                }
            }
        } else {
            var doms = document.getElementsByTagName("!");
            for (var i = 0; i < doms.length; i++) {
                if (doms[i].nodeValue === (value + "")) {
                    return doms[i];
                }
            }

        }
        return null;
    }

    if (!window.qclib) {
        window.qclib = {};
    }
    qclib.setTBodyInnerHTML = setTBodyInnerHTML;
    qclib.setTBodyAppendHtml = setTBodyAppendHtml;
    qclib.isLowIe = isLowIe;
    qclib.getCommentNodes = getCommentNodes;
})()
/**
 * Created by zhangyan on 2016/4/5.
 * parse.js
 */
/*处理表达式解析器*/
;
(function (qc) {
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
            } else if (isStr !== "") {
                temp += char;
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
    var isArray = function (v) {
        if (Object.prototype.toString.call(v) === "[object Array]") {
            return true;
        } else {
            return false;
        }
    }
    //计算属性值
    var parse = function (exp) {//代替eval
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

        var caseValue = function (pushStr, list) {
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

//1.针对火狐做的优化 火狐被调用的函数必须定义在调用前
//2. 火狐在调用内联函数的时候 如果 外面有同名函数 会调用外面的 二不调用内联的

        var countExp = function (result, opt, value) {
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

        var trope = {
            "\\\\": "\\\\"//转义字符串
        }

        var tree = function (exp) {
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
                                        _value = _value;
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
                    if (list[0].expValue === "!") {
                        result = !list[1].expValue
                    } else if (list[0].expValue === "-") {
                        result = -list[1].expValue
                    } else {
                        result = list[1].expValue
                    }
                } else {
                    result = list[0].expValue
                    var i = 1;
                    var len = list.length - 1;
                    while (i < len) {
                        if (len - i >= 2) {
                            var opt = list[i + 2].expValue;
                            var opt0 = list[i].expValue;
                            if (opt !== "*" && opt !== "/" && opt !== "%") {
                                result = countExp(result, opt0, list[i + 1].expValue);
                                i = i + 2;
                            } else {
                                var temp = list[i + 1].expValue;
                                i = i + 2;
                                while (i < len) {
                                    temp = countExp(temp, list[i].expValue, list[i + 1].expValue);
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
                                result = countExp(result, opt0, temp);
                            }
                        } else {
                            result = countExp(result, list[i].expValue, list[i + 1].expValue);
                            break;
                        }
                    }

                }
            }
            return result;
        }
        /*计算值*/
        return tree(exp);
    }
    if (!window.qclib) {
        window.qclib = {};
    }
    window.qclib.isArray = isArray;
    window.qclib.parse = parse;
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * creatvm.js
 */

/*创建虚拟节点*/
//需要依赖ie.js
;
(function (qc) {
    var PREFIX = qc.PREFIX;
    var expresssion = function (exp) {
        var list = [];
        var text = exp;
        var v = "";
        try {
            text.length;
        } catch (e) {
            window.console && console.log(text);
        }
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

    var exp = function (exp) {
        var o = {};
        var css = exp.mySplit(";");
        for (var i = 0; i < css.length; i++) {
            var exp = css[i].mySplit(":");
            o[exp[0]] = expresssion(exp[1]);
        }
        return o;
    }

    var htmlToObj = function (dom) {
        var retObj = {};
        var to = function (d, o, p) {
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
                qclib.setTBodyInnerHTML(o, d.innerHTML);
            }
            if (d.attributes.length > 0) {
                for (var a = 0; a < d.attributes.length; a++) {
                    var _node = d.attributes[a]
                    if (_node.nodeName.indexOf(PREFIX + "-") == 0 && _node.nodeName !== PREFIX + "-view") {
                        if (_node.nodeName === PREFIX + "-text" || _node.nodeName === PREFIX + "-html") {//text文本
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

    if (!window.qclib) {
        window.qclib = {};
    }
    window.qclib.htmlToObj = htmlToObj;
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * other.js
 */
;
(function (qc) {
    var PREFIX = qc.PREFIX;
    //内部生成不重复数字函数
    var random = new Date().getTime();

    var getRandom = function () {
        random++;
        return random;
    }

    /*针对IE6
     /*判断是否为空对象*/
    var isNullObj = function (obj) {
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                return false;
            }
        }
        return true;
    }
    /*
     //获得属性值
     *moudel 属性所在模型
     * 属性p 有可能为 xxx.xxx
     * */
    var valuePro = function (moudel, p) {
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
    /*
     *
     //获得属性值 并建立映射表 本文件私有方法
     *moudel 属性所在模型
     * 属性p 有可能为 xxx.xxx
     * uuid 属性唯一id
     * type 类型$visible attr css prop textarea value class text html select radio check widget
     * exp 表达式 比如{name}+':'+{age}
     * widget 是否为控件
     * */
    var getValue = function (moudel, p, uuid, type, exp, widget) {
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
                    parent1 = parent2;
                    parent2 = mou;
                    mou[p[i]] = "";
                    mou = mou[p[i]]
                } else {
                    mou[p[i]] = {};
                    parent1 = parent2;
                    parent2 = mou;
                    mou = mou[p[i]];

                }
            }
            retValue = mou;
            if (qclib.isArray(parent2)) {
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

    /*
     计算表达式值
     *moudel 表达式所在模型
     * expList 表达式如{name}+':'+{age}
     */
    var count = function (moudel, expList) {
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
            var myValue = qclib.parse(_expshow);
            var t = typeof myValue;
            if (t == "string" || t == "number" || t == "boolean") {
                return myValue;
            }

        } catch (e) {
            return "";
        }
    }

    /* //在biandata调用 比getValue高一级
     *moudel 属性所在模型
     * uuid 属性唯一id
     * type 类型$visible attr css prop textarea value class text html select radio check widget
     * exp 表达式 比如{name}+':'+{age}
     * widget 是否为控件
     * */
    var expEval = function (moudel, expList, uuid, type, widget) {
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
        if (type === "dhtml") {
            //判断函数
            return _expshow.replace(/\"/g, "");
        }
        try {
            var myValue = qclib.parse(_expshow);
            var t = typeof myValue;
            if (t == "string" || t == "number" || t == "boolean") {
                return myValue;
            }

        } catch (e) {
            return "";
        }
    }

    var getModel = function (o) {
        function _getModel(m) {
            var _o;
            if (qclib.isArray(m)) {
                _o = [];
                for (var i = 0; i < m.length; i++) {
                    _o.push(_getModel(m[i]))
                }
            } else if (typeof m == "object") {
                _o = {};
                for (var p in  m) {
                    if (typeof m[p] !== "function" && p.indexOf("$") < 0) {
                        if (qclib.isArray(m[p])) {
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

    var innerText = function (bindText) {//此处为了兼容火狐不支持 innerText
        if (typeof bindText === "string") {
            bindText = bindText.replace(/</g, "&lt;");
            bindText = bindText.replace(/>/g, "&gt;");
            bindText = bindText.replace(/\r\n/g, "<br>");
            bindText = bindText.replace(/\n/g, "<br>");
        }
        return bindText;
    }

    //垃圾回收
    var collection = function () {
        for (var cll in  qc.vms) {
            var cllDom = document.querySelector("[" + PREFIX + "-id=\"" + cll + "\"" + "]");
            if (cllDom === null) {
                delete qc.vms[cll];
            }
        }
    }

    var load = function () {
        for (var load in qc.load) {//渲染完触发回调
            qc.load[load].load();
        }
        qc.load = [];//
    }

    qclib.load = load;//控件加载完毕执行
    qclib.innerText = innerText; //兼容火狐不支持innerText
    qclib.isNullObj = isNullObj;//判断对象是都为空
    qclib.expEval = expEval;//计算值 并且生成映射表 moudel 当前vm expList 表达式 数组 uuid dom的标志 type="attr,color" 绑定类型
    qclib.valuePro = valuePro;//计算属性值 moudle,对象 p 属性
    qclib.count = count;

    qc.collection = collection;//垃圾回收
    qc.getRandom = getRandom;//生成随机数
    qc.getModel = getModel;// 获取纯净的数据对象

})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * binddata.js
 */
;
(function (qc) {
    /*
     * 更新视图
     * maps 需要更新的元素列表
     * dub 触发更新事件的  比如input 如果焦点不在上面 或者触发事件的元素不只自己 满足一个条件才更新
     * */
    var PREFIX = qc.PREFIX;
    var render = function (maps, dub) {
        for (var _map in  maps) {
            var map = maps[_map];
            var dom = document.querySelector("[" + PREFIX + "-id=\"" + _map + "\"" + "]");
            var comDom = qclib.getCommentNodes(_map);//获取注释节点
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
                    var myValue = qclib.count(vm, exp);
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
                                var newid = qc.getRandom() + "";
                                ele.outerHTML = bindData(vm, vm["$visible" + uuid], undefined, newid);
                                qclib.load();
                                var newDom = document.querySelector("[" + PREFIX + "-id='" + newid + "']");
                                if (newDom.hasAttribute(PREFIX + "-animate")) {
                                    var veAnimate = newDom.getAttribute(PREFIX + "-animate");
                                    if (qc.animate.hasOwnProperty(veAnimate) && typeof qc.animate[veAnimate] == "function") {
                                        qc.animate[veAnimate].call(newDom, "enter");//显示
                                    }
                                }
                                delete vm["$visible" + uuid];
                            }
                            break;
                        }
                    } else {
                        if (dom !== null) {
                            var remove = function () {
                                var comNode = document.createComment(uuid);//创建注释节点
                                dom.parentNode.insertBefore(comNode, dom);
                                dom.parentNode.removeChild(dom);
                            }

                            if (dom.hasAttribute(PREFIX + "-animate")) {
                                var veAnimate = dom.getAttribute(PREFIX + "-animate");
                                if (qc.animate.hasOwnProperty(veAnimate) && typeof qc.animate[veAnimate] == "function") {
                                    qc.animate[veAnimate].call(dom, "leave", remove);//显示
                                } else {
                                    remove();
                                }
                            } else {
                                remove();
                            }
                        }
                        //垃圾回收
                        qc.collection();
                        break;
                    }
                } else {
                    if (dom !== null) {
                        var myValue;
                        if (k === "dhtml") {
                            exp = exp[0];
                            exp = exp.replace("{", "").replace("}", "");
                            myValue = vm[exp];
                        } else {
                            myValue = qclib.count(vm, exp);
                        }
                        if (k === "attr") {
                            dom.setAttribute(v, myValue);
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
                                try {
                                    if (document.activeElement !== dom || dub !== dom) {
                                        dom.value = myValue;
                                    }
                                } catch (e) {//iebug修复
                                    dom.value = myValue;
                                }
                            } else if (v === "textarea") {
                                if (document.activeElement !== dom || dub !== dom) {
                                    dom.value = myValue;
                                }
                            }

                        } else if (k === "text") {
                            try {
                                dom.innerHTML = qclib.innerText(myValue);
                            } catch (e) {
                                qclib.setTBodyInnerHTML(dom, qclib.innerText(myValue));
                            }
                        } else if (k === "html" || k === "dhtml") {
                            try {
                                dom.innerHTML = myValue;
                            } catch (e) {
                                qclib.setTBodyInnerHTML(dom, myValue);
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
                                widget.update(v, myValue);
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

    function bindData(vm, vDom, option, uuid) {
        var path = "_";
        var show = true;
        if (vm.hasOwnProperty("$path")) {
            path = vm.$path;
        }
        var bindSet = function (vm, $p) {
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

                if (qclib.isArray(value)) {
                    if (typeof key === "object") {
                        return;
                    }
                    if (!qclib.isArray(vm[key])) {
                        return;
                    }
                    var watch = getMypath(vm.$path + "." + key);
                    var oldValue = qc.getModel(vm[key]);
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
                                qclib.setTBodyInnerHTML(s, html.join(""));
                            }
                            qclib.load();
                        }
                    }
                    //更新数组长度绑定
                    render(this["$map"][key]);
                    //垃圾回收
                    qc.collection();
                    if (watch) {
                        watch(value, oldValue, vm);
                    }
                } else if (typeof key === "object") {
                    function setObject(map, data) {
                        for (var m in  map) {
                            if (typeof map[m] !== "function" && m.indexOf("$") < 0) {
                                if (map.hasOwnProperty("$" + PREFIX + "-each-" + m)) {
                                    if (data[m] !== undefined) {
                                        map.setValue(m, data[m]);
                                    }
                                    continue;
                                }
                                if (data[m] !== undefined) {
                                    if (typeof map[m] === "object") {
                                        if (typeof data[m] === "object" && data[m] != null) {
                                            setObject(map[m], data[m]);
                                        }
                                    }
                                }
                            }
                        }
                        for (var m in  map) {
                            if (typeof map[m] !== "function" && m.indexOf("$") < 0) {
                                if (map.hasOwnProperty("$" + PREFIX + "-each-" + m)) {
                                    continue;
                                }
                                if (data[m] !== undefined) {
                                    if (typeof map[m] !== "object") {
                                        map[m] = data[m];
                                        if (map["$map"] && map["$map"][m] !== undefined) {
                                            render(map["$map"][m]);
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
                } else if (typeof value === "object") {
                    vm[key].setValue(value);
                }
                else {
                    if (this[key] === value) {
                        return;
                    }
                    var watch = getMypath(vm.$path + "." + key);
                    var oldValue = qc.getModel(vm[key]);
                    this[key] = value;
                    if (this.hasOwnProperty("$map")) {
                        var list = this.$map[key];
                        if (list !== undefined) {
                            render(list, dub);
                        }
                    }
                    if (watch) {
                        watch(value, oldValue, vm);
                    }
                }
            }

            for (var v in vm) {
                if (typeof vm[v] !== "function" && v.indexOf("$") < 0 && !qclib.isArray(vm[v]) && vm[v] != null && typeof vm[v] === "object") {
                    vm[v].$path = vm.$path + "." + v;
                    bindSet(vm[v], vm);
                }
            }
        }

        bindSet(vm)
        if (vDom.localName === "#text") {
            return vDom.nodeValue;
        }
        if (uuid === undefined || uuid === "" || uuid === null) {
            uuid = qc.getRandom() + "";
        }

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
                            var pValue = qclib.expEval(vm, ["{" + value + "}"], uuid, "widget," + name, obj);
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
            if (!qclib.expEval(vm, expV, uuid, "visible")) {
                show = false;
            }
        }
        var html = ["<" + vDom.localName];
        if (show) {
            if (!qclib.isNullObj(vDom[PREFIX])) {
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
                    var result = qclib.expEval(vm, dClass[c], uuid, "class," + c);
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
                    var value = qclib.expEval(vm, dAttr[a], uuid, "attr," + a);
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
                            if (qclib.expEval(vm, textValue, uuid, "radio") === value) {
                                html.push(" checked onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
                            } else {
                                html.push(" onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
                            }
                        }
                    }
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-prop")) {
                var dProp = vDom[PREFIX][PREFIX + "-prop"];
                for (var p in dProp) {
                    if (qclib.expEval(vm, dProp[p], uuid, "prop," + p)) {
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
                                if (qclib.expEval(vm, textValue, uuid, "radio") === value) {
                                    html.push(" checked onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
                                } else {
                                    html.push(" onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
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
                    styleList.push(c + ":" + qclib.expEval(vm, dCss[c], uuid, "css," + c));
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
                var tempValue = qclib.expEval(vm, vDom[PREFIX][PREFIX + "-value"], uuid, "value,text");
                if (vDom.localName === "input") {
                    if (vDom[PREFIX].hasOwnProperty(PREFIX + "-radio")) {
                        var textValue = vDom[PREFIX][PREFIX + "-radio"];
                        var text = textValue[0];
                        text = text.substr(1, text.length - 2);
                        if (qclib.expEval(vm, textValue, uuid, "radio") === tempValue) {
                            html.push(" checked onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
                        } else {
                            html.push(" onchange=qc.bindRadio(\"" + path + "." + text + "\",this)");
                        }
                    }
                    html.push(" value=\"" + tempValue + "\"");
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-change")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-change"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + qclib.expEval(vm, textValue, uuid, "value,text") + "\"");
                }
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                if (qclib.isLowIe()) {
                    html.push(" onkeyup=qc.bindText(\"" + path + "." + text + "\",this)");
                } else {
                    html.push(" oninput=qc.bindText(\"" + path + "." + text + "\",this)");
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-blur")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-blur"];
                if (vDom.localName === "input") {
                    html.push(" value=\"" + qclib.expEval(vm, textValue, uuid, "value,text") + "\"");
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
                selectValue = qclib.expEval(vm, textValue, uuid, "select");
                html.push(" onchange=qc.bindSelect(\"" + path + "." + text + "\",this)");
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-check")) {
                var textValue = vDom[PREFIX][PREFIX + "-check"];
                var text = textValue[0];
                text = text.substr(1, text.length - 2);
                if (qclib.expEval(vm, textValue, uuid, "check")) {
                    html.push(" checked onchange=qc.bindCheck(\"" + path + "." + text + "\",this)");
                } else {
                    html.push(" onchange=qc.bindCheck(\"" + path + "." + text + "\",this)");
                }
            }
            //绑定事件
            // click,dblclick,mousedown,mouseup
            //移动 touchstart touchend//需要扩展
            var eventList = ["click", "dblclick", "keydown", "keyup", "mousedown", "mouseup", "mousemove", "mouseenter ", "mouseleave", "mouseover", "mouseout"];
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
            /*动画*/
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-animate")) {
                var lenAnimate = vDom[PREFIX][PREFIX + "-animate"][0];
                lenAnimate = lenAnimate.substr(1, lenAnimate.length - 2);
                html.push(" " + PREFIX + "-animate=\"" + lenAnimate + "\"");
            }
            html.push(">");
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value")) {
                var textValue = vDom[PREFIX][PREFIX + "-value"];
                if (vDom.localName !== "input") {
                    html.push(qclib.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-change")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-change"];
                if (vDom.localName !== "input") {
                    html.push(qclib.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
            if (vDom[PREFIX].hasOwnProperty(PREFIX + "-value-blur")) {
                var textValue = vDom[PREFIX][PREFIX + "-value-blur"];
                if (vDom.localName !== "input") {
                    html.push(qclib.expEval(vm, textValue, uuid, "value,textarea"));
                }
            }
        }
        var arr = vDom[PREFIX][PREFIX + "-each"];
        if (arr !== undefined) {
            arr = arr[0];
            arr = arr.substr(1, arr.length - 2);
            var arrList = arr.split(".");
            var $parent, $prop;
            if (arrList.length > 1) {
                $prop = arrList.pop();
                $parent = qclib.valuePro(vm, "{" + arrList.join(".") + "}");
            } else {
                $parent = vm;
                $prop = arr;
            }
            var list = $parent[$prop];
            if (list === undefined) {
                $parent[$prop] = [];
                list = $parent[$prop];
            }
            var addAnimate = function (index) {
                var divObject = $parent["$" + PREFIX + "-each-" + $prop];
                for (var k = divObject.length - 1; k >= 0; k--) {
                    var newDom = document.querySelector("[" + PREFIX + "-id='" + divObject[k].uuid + "']");
                    try {
                        var childNodes = newDom.childNodes;
                        newDom = childNodes[index];
                        if (newDom.hasAttribute(PREFIX + "-animate")) {
                            var veAnimate = newDom.getAttribute(PREFIX + "-animate");
                            if (qc.animate.hasOwnProperty(veAnimate) && typeof qc.animate[veAnimate] == "function") {
                                qc.animate[veAnimate].call(newDom, "enter");//显示
                            }
                        }
                    } catch (e) {
                    }
                }
            }
            var removeAnimate = function (index, callback) {
                var divObject = $parent["$" + PREFIX + "-each-" + $prop];
                var isCall = true;
                for (var k = divObject.length - 1; k >= 0; k--) {
                    try {
                        var newDom = document.querySelector("[" + PREFIX + "-id='" + divObject[k].uuid + "']");
                        var childNodes = newDom.childNodes;
                        newDom = childNodes[index];
                        if (newDom.hasAttribute(PREFIX + "-animate")) {
                            var veAnimate = newDom.getAttribute(PREFIX + "-animate");
                            if (qc.animate.hasOwnProperty(veAnimate) && typeof qc.animate[veAnimate] == "function") {
                                qc.animate[veAnimate].call(newDom, "leave", callback);
                                isCall = false;
                            }
                        }
                    } catch (e) {
                        //
                    }
                }
                if (isCall) {
                    callback();
                }
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
                                    var _tagName = s.tagName.toLocaleLowerCase();
                                    if (_tagName == "table" || _tagName == "tr" || _tagName == "tbody") {
                                        qclib.setTBodyAppendHtml(s, divText.join(""));
                                    } else {
                                        var newDiv = document.createElement("div");
                                        newDiv.innerHTML = divText.join("");
                                        s.appendChild(newDiv.children[0]);
                                    }
                                } catch (e) {
                                    qclib.setTBodyAppendHtml(s, divText.join(""));
                                }
                                qclib.load();

                            }
                        }
                        addAnimate(list.length - 1);
                        //更新数组长度绑定
                        render($parent["$map"][$prop]);
                    }
                    $parent[$prop + "pop"] = function () {
                        var list = qc.getModel($parent[$prop]);
                        var remove = function () {
                            list.pop();
                            $parent.setValue($prop, list);
                        }
                        removeAnimate(list.length - 1, remove);
                    }
                    $parent[$prop + "splice"] = function () {
                        var k = 0;
                        var args = arguments;
                        var list = qc.getModel($parent[$prop]);
                        var remove = function () {
                            k--;
                            if (k < 0) {
                                list.splice.apply(list, args);
                                $parent.setValue($prop, list);
                            }
                        }
                        if (arguments.length == 2) {
                            for (var index = args[0]; index < args[0] + args[1]; index++) {
                                k++;
                                removeAnimate(index, remove);
                            }
                            remove();
                        } else {
                            remove();
                        }

                    }
                    $parent[$prop + "shift"] = function () {
                        var list = qc.getModel($parent[$prop]);
                        var remove = function () {
                            list.shift();
                            $parent.setValue($prop, list)
                        }
                        removeAnimate(0, remove);
                    }
                    $parent[$prop + "unshift"] = function (value) {
                        var list = qc.getModel($parent[$prop]);
                        list.unshift(value);
                        $parent.setValue($prop, list);
                        addAnimate(0);
                    }
                    $parent[$prop + "concat"] = function (value) {
                        var divObject = $parent["$" + PREFIX + "-each-" + $prop];
                        var list = $parent[$prop];
                        var start = list.length;
                        $parent[$prop] = list.concat(value);
                        list = $parent[$prop];
                        var end = list.length - 1;
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
                                    var _tagName = s.tagName.toLocaleLowerCase();
                                    if (_tagName == "table" || _tagName == "tr" || _tagName == "tbody") {
                                        qclib.setTBodyAppendHtml(s, divText.join(""));
                                    } else {
                                        var newDiv = document.createElement("div");
                                        newDiv.innerHTML = divText.join("");
                                        while (newDiv.children.length > 0) {
                                            s.appendChild(newDiv.children[0]);
                                        }
                                    }
                                } catch (e) {
                                    qclib.setTBodyAppendHtml(s, divText.join(""));
                                }
                                qclib.load();
                            }
                        }
                        for (var index = start; index <= end; index++) {
                            addAnimate(index);
                        }
                        //更新数组长度绑定
                        render($parent["$map"][$prop]);

                    }
                    break;
                }

            }
        }
        else {
            if (show) {
                if (vDom[PREFIX].hasOwnProperty(PREFIX + "-text")) {//绑定text
                    var text = vDom[PREFIX][PREFIX + "-text"];
                    var bindText = qclib.expEval(vm, text, uuid, "text");
                    html.push(qclib.innerText(bindText));
                } else if (vDom[PREFIX].hasOwnProperty(PREFIX + "-html")) {
                    var text = vDom[PREFIX][PREFIX + "-html"];
                    var bindText = qclib.expEval(vm, text, uuid, "html");
                    html.push(bindText);
                } else if (vDom[PREFIX].hasOwnProperty(PREFIX + "-dhtml")) {
                    var text = vDom[PREFIX][PREFIX + "-dhtml"];
                    var bindText = qclib.expEval(vm, text, uuid, "dhtml");
                    html.push(bindText);
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

    qclib.bindData = bindData;
    if (!window.qclib) {
        window.qclib = {};
    }
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * sweep.js
 */
;(function (qc) {
    var PREFIX = qc.PREFIX;
    var bindEvent = function (newDom, _this, vmName, vType, event, rec) {
        function getTarget(_this) {
            if (_this == null || _this == undefined) {
                return;//ie修复
            }
            var veType
            try {
                veType = _this.getAttribute(PREFIX + "-vetype");
            } catch (e) {
                return;//ie问题修复
            }
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
                            return function (action) {
                                qc.vms[vmName].$ve[veName].call(_this, vm, event, action);//action 用于扩展组合事件
                            }
                        })(vmName, veName, _this, vm, event);
                        if (veType === vType) {
                            run();
                        } else {
                            var extend = qc.ve[veType];
                            if (extend.hasOwnProperty(vType) && typeof extend[vType] === "function") {
                                extend[vType].call(extend, run, event, _this);
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

    var isMobile = function () {
        if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
            return true;
        }
        else {
            return false;
        }
    }
//---------------扫描事件----------------//
    var sweep = function (_vm) {
        var dom = document.querySelector("[" + PREFIX + "-view='" + _vm + "']");
        if (dom !== null) {
            var VDom = qclib.htmlToObj(dom);
            qc.vms[_vm].$path = _vm + "";
            var outerHtml = qclib.bindData(qc.vms[_vm], VDom);
            dom.outerHTML = outerHtml;
            qclib.load();
            //绑定事件
            var newDom = document.querySelector("[" + PREFIX + "-view='" + _vm + "']");
            newDom.removeAttribute(PREFIX + "-view");
            newDom.setAttribute(PREFIX + "-id", _vm);
            var isIn = function (dom) {
                var _flag;
                try {
                    _flag = dom.getAttribute(PREFIX + "-id");
                    if (_flag !== undefined && _flag !== null) {
                        return false;
                    } else {
                        if (dom.parentNode !== undefined && dom.parentNode !== null) {
                            return isIn(dom.parentNode)
                        } else {
                            return true;
                        }
                    }
                } catch (e) {
                    return true;
                }
                return true;
            }
            var isTemp = true;
            if (newDom.parentNode !== undefined && dom.parentNode !== null) {
                isTemp = isIn(dom.parentNode);
            }
            if (!isTemp) {//如果在容器内部 就不比绑定事件了
                return;
            }
            newDom.onclick = function (e) {
                var event = window.event || e;
                event.target = event.target ? event.target : event.srcElement;//兼容IE
                bindEvent(this, event.target, _vm, "click", event);
            }
            newDom.ondblclick = function (e) {
                var event = window.event || e;
                event.target = event.target ? event.target : event.srcElement;
                bindEvent(this, event.target, _vm, "dblclick", event);

            }
            newDom.onkeydown = function (e) {
                var event = window.event || e;
                event.target = event.target ? event.target : event.srcElement;
                bindEvent(this, event.target, _vm, "keydown", event);
            }
            newDom.onkeyup = function (e) {
                var event = window.event || e;
                event.target = event.target ? event.target : event.srcElement;
                bindEvent(this, event.target, _vm, "keyup", event);
            }
            if (isMobile()) {//移动
                newDom.addEventListener("touchstart", function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "touchstart", event);
                })
                newDom.addEventListener("touchmove", function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "touchmove", event);
                })
                newDom.addEventListener("touchend", function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "touchend", event);

                })
                newDom.addEventListener("touchcancel", function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "touchcancel", event);

                })

            } else {//pc
                newDom.onmousedown = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "mousedown", event);

                }
                newDom.onmouseup = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "mouseup", event);
                }
                newDom.onmousemove = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "mousemove", event);
                }
                newDom.onmouseout = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "mouseout", event);
                    bindEvent(this, event.target, _vm, "mouseleave", event, true);
                }
                newDom.onmouseover = function (e) {
                    var event = window.event || e;
                    event.target = event.target ? event.target : event.srcElement;
                    bindEvent(this, event.target, _vm, "mouseover", event);
                    bindEvent(this, event.target, _vm, "mouseenter", event, true);
                }
            }
        }
    }
    qc.widget = {};//控件扩展
    qc.ve = {};//事件扩展
    qc.vms = {};//储存vm所有对象
    qc.vms = [];
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
        sweep(name);
        return qc.vms[name];
    }
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * dbevent.js
 */
;
(function (qc) {
    var PREFIX = qc.PREFIX;
    var getValue = function (path) {
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
    qc.bindText = function (path, obj) {
        var v = getValue(path);
        v.vm.setValue(v.pro, obj.value, obj);
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
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * extent.js
 */
;
(function (qc) {
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
                qclib.setTBodyInnerHTML(dom, implement.templete);
            }
            dom = dom.children[0];
            implement.vDom = qclib.htmlToObj(dom);
        }

        qc.widget[name] = implement;
    }

    qc.extendEvent = function () {
        var ars = arguments;
        for (var i = 0; i < ars.length; i++) {
            qc.ve[ars[i].name] = ars[i];
        }
    }
})(qc)
/**
 * Created by zhangyan on 2016/4/5.
 * ajax.js
 */
;
/*
 * 来自https://github.com/ForbesLindesay/ajax/blob/master/index.js
 * */
;
(function (qc) {
    var type = function (t) {
        return typeof(t);
    }
    var jsonpID = 0,
        document = window.document,
        key,
        name,
        rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        scriptTypeRE = /^(?:text|application)\/javascript/i,
        xmlTypeRE = /^(?:text|application)\/xml/i,
        jsonType = 'application/json',
        htmlType = 'text/html',
        blankRE = /^\s*$/

    var ajax = function (options) {
        var settings = extend({}, options || {})
        for (key in ajax.settings) if (settings[key] === undefined) settings[key] = ajax.settings[key]

        ajaxStart(settings)

        if (!settings.crossDomain) settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) &&
            RegExp.$2 != window.location.host

        var dataType = settings.dataType, hasPlaceholder = /=\?/.test(settings.url)
        if (dataType == 'jsonp' || hasPlaceholder) {
            if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?')
            return ajax.JSONP(settings)
        }

        if (!settings.url) settings.url = window.location.toString()
        serializeData(settings)

        var mime = settings.accepts[dataType],
            baseHeaders = {},
            protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : window.location.protocol,
            xhr = ajax.settings.xhr(), abortTimeout

        if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest'
        if (mime) {
            baseHeaders['Accept'] = mime
            if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0]
            xhr.overrideMimeType && xhr.overrideMimeType(mime)
        }
        if (settings.contentType || (settings.data && settings.type.toUpperCase() != 'GET'))
            baseHeaders['Content-Type'] = (settings.contentType || 'application/x-www-form-urlencoded')
        settings.headers = extend(baseHeaders, settings.headers || {})

        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                clearTimeout(abortTimeout)
                var result, error = false
                if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304 || (xhr.status == 0 && protocol == 'file:')) {
                    dataType = dataType || mimeToDataType(xhr.getResponseHeader('content-type'))
                    result = xhr.responseText

                    try {
                        //if (dataType == 'script')    (1, eval)(result)
                        if (dataType == 'script')result = xhr.responseText;
                        else if (dataType == 'xml')  result = xhr.responseXML;
                        else if (dataType == 'json') result = blankRE.test(result) ? null : JSON.parse(result)
                    } catch (e) {
                        error = e
                    }

                    if (error) ajaxError(error, 'parsererror', xhr, settings)
                    else ajaxSuccess(result, xhr, settings)
                } else {
                    ajaxError(null, 'error', xhr, settings)
                }
            }
        }

        var async = 'async' in settings ? settings.async : true
        xhr.open(settings.type, settings.url, async)

        for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name])

        if (ajaxBeforeSend(xhr, settings) === false) {
            xhr.abort()
            return false
        }

        if (settings.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.onreadystatechange = empty
            xhr.abort()
            ajaxError(null, 'timeout', xhr, settings)
        }, settings.timeout)

        // avoid sending empty string (#319)
        xhr.send(settings.data ? settings.data : null)
        return xhr
    }


// trigger a custom event and return false if it was cancelled
    function triggerAndReturn(context, eventName, data) {
        //todo: Fire off some events
        //var event = $.Event(eventName)
        //$(context).trigger(event, data)
        return true;//!event.defaultPrevented
    }

// trigger an Ajax "global" event
    function triggerGlobal(settings, context, eventName, data) {
        if (settings.global) return triggerAndReturn(context || document, eventName, data)
    }

// Number of active Ajax requests
    ajax.active = 0

    function ajaxStart(settings) {
        if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart')
    }

    function ajaxStop(settings) {
        if (settings.global && !(--ajax.active)) triggerGlobal(settings, null, 'ajaxStop')
    }

// triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable
    function ajaxBeforeSend(xhr, settings) {
        var context = settings.context
        if (settings.beforeSend.call(context, xhr, settings) === false ||
            triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false)
            return false

        triggerGlobal(settings, context, 'ajaxSend', [xhr, settings])
    }

    function ajaxSuccess(data, xhr, settings) {
        var context = settings.context, status = 'success'
        settings.success.call(context, data, status, xhr)
        triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data])
        ajaxComplete(status, xhr, settings)
    }

// type: "timeout", "error", "abort", "parsererror"
    function ajaxError(error, type, xhr, settings) {
        var context = settings.context
        settings.error.call(context, xhr, type, error)
        triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error])
        ajaxComplete(type, xhr, settings)
    }

// status: "success", "notmodified", "error", "timeout", "abort", "parsererror"
    function ajaxComplete(status, xhr, settings) {
        var context = settings.context
        settings.complete.call(context, xhr, status)
        triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings])
        ajaxStop(settings)
    }

// Empty function, used as default callback
    function empty() {
    }

    ajax.JSONP = function (options) {
        if (!('type' in options)) return ajax(options)

        var callbackName = 'jsonp' + (++jsonpID),
            script = document.createElement('script'),
            abort = function () {
                //todo: remove script
                //$(script).remove()
                if (callbackName in window) window[callbackName] = empty
                ajaxComplete('abort', xhr, options)
            },
            xhr = {abort: abort}, abortTimeout,
            head = document.getElementsByTagName("head")[0]
                || document.documentElement

        if (options.error) script.onerror = function () {
            xhr.abort()
            options.error()
        }

        window[callbackName] = function (data) {
            clearTimeout(abortTimeout)
            //todo: remove script
            //$(script).remove()
            delete window[callbackName]
            ajaxSuccess(data, xhr, options)
        }

        serializeData(options)
        script.src = options.url.replace(/=\?/, '=' + callbackName)

        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        // This arises when a base node is used (see jQuery bugs #2709 and #4378).
        head.insertBefore(script, head.firstChild);

        if (options.timeout > 0) abortTimeout = setTimeout(function () {
            xhr.abort()
            ajaxComplete('timeout', xhr, options)
        }, options.timeout)

        return xhr
    }

    ajax.settings = {
        // Default type of request
        type: 'GET',
        // Callback that is executed before request
        beforeSend: empty,
        // Callback that is executed if the request succeeds
        success: empty,
        // Callback that is executed the the server drops error
        error: empty,
        // Callback that is executed on request complete (both: error and success)
        complete: empty,
        // The context for the callbacks
        context: null,
        // Whether to trigger "global" Ajax events
        global: true,
        // Transport
        xhr: function () {
            return new window.XMLHttpRequest()
        },
        // MIME types mapping
        accepts: {
            script: 'text/javascript, application/javascript',
            json: jsonType,
            xml: 'application/xml, text/xml',
            html: htmlType,
            text: 'text/plain'
        },
        // Whether the request is to another domain
        crossDomain: false,
        // Default timeout
        timeout: 0
    }

    function mimeToDataType(mime) {
        return mime && ( mime == htmlType ? 'html' :
                mime == jsonType ? 'json' :
                    scriptTypeRE.test(mime) ? 'script' :
                    xmlTypeRE.test(mime) && 'xml' ) || 'text'
    }

    function appendQuery(url, query) {
        return (url + '&' + query).replace(/[&?]{1,2}/, '?')
    }

// serialize payload and append it to the URL for GET requests
    function serializeData(options) {
        if (type(options.data) === 'object') options.data = param(options.data)
        if (options.data && (!options.type || options.type.toUpperCase() == 'GET'))
            options.url = appendQuery(options.url, options.data)
    }

    ajax.get = function (url, success) {
        return ajax({url: url, success: success})
    }

    ajax.post = function (url, data, success, dataType) {
        if (type(data) === 'function') dataType = dataType || success, success = data, data = null
        return ajax({type: 'POST', url: url, data: data, success: success, dataType: dataType})
    }

    ajax.getJSON = function (url, success) {
        return ajax({url: url, success: success, dataType: 'json'})
    }

    var escape = encodeURIComponent

    function serialize(params, obj, traditional, scope) {
        var array = type(obj) === 'array';
        for (var key in obj) {
            var value = obj[key];

            if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
            // handle data in serializeArray() format
            if (!scope && array) params.add(value.name, value.value)
            // recurse into nested objects
            else if (traditional ? (type(value) === 'array') : (type(value) === 'object'))
                serialize(params, value, traditional, key)
            else params.add(key, value)
        }
    }

    function param(obj, traditional) {
        var params = []
        params.add = function (k, v) {
            this.push(escape(k) + '=' + escape(v))
        }
        serialize(params, obj, traditional)
        return params.join('&').replace('%20', '+')
    }

    function extend(target) {
        var slice = Array.prototype.slice;
        var list = slice.call(arguments, 1);
        for (var i = 0; i < list.length; i++) {
            var source = list[i];
            for (key in source) {
                if (source[key] !== undefined) {
                    target[key] = source[key];
                }
            }
        }
        return target
    }

    qc.ajax = ajax;
    qc.get = ajax.get;
    qc.post = ajax.post;
    qc.getJSON = ajax.getJSON;
    qc.async = function (callback) {
        setTimeout(function () {
            callback();
        }, 16)
    }
})(qc);
/**
 * Created by zhangyan on 2016/4/5.
 * commonjs.js
 */

;(function (qc) {
    if(!qc.ajax){
        window.console&&window.console("找不到ajax模块");
    }
    //---------------commonjs规范----------------//
    var tmpTag = document.location.protocol + "//";
    var _absUrl = (function () {
        var a;
        return function (url) {
            if (!a) a = document.createElement('a');
            a.href = url;
            return a.href;
        };
    })();
    var _require = function (parent, path) {
        var _model;
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
        qc.ajax({
            "url": _myUrl + "?r=" + (new Date() - 1),
            async: false,
            "error": function () {
                window.console && console.log(_myUrl + "加载失败");
            },
            "success": function (data) {
                _model = data;
            }
        });

        if (_type == "js") { //js预编译
            var _script = "(function(exports){\n";
            _script += "var $parent = \"" + _basePath + "\";\n";
            _script += _model.replace(/require\(/g, "_require($parent,");
            _script += "\n return exports;\n";
            _script += "})({});" + "//@ sourceURL=" + _myUrl;
            _model = eval(_script);
        }
        return _model;
    }
    window.require = function (path) {
        return _require("", path);
    };
})( qc);
/**
 * Created by zhangyan on 2016/4/5.
 * component.js
 */

/*UIComponent需要依赖*/
;(function (qc) {
    if(!window.require){
        window.console&&window.console("找不到commonjs模块");
    }
    //创建组件
    qc.UIComponent = function (config) {
        var url = config.url;
        var id = config.id;
        var data = config.data;
        var element = document.getElementById(id);
        element.setAttribute(qc.PREFIX + "-view", id);
        return require(url)(document.getElementById(id), id, data);
    }
})(qc);

/**
 * Created by 张岩 on 2016/3/31.
 * 动画模块
 * animate.js
 */

;(function () {
    /*
     * requestAnimationFrame兼容写法
     * */
    var _requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 16)
            };
    })();
    /*
     * 获取运行时样式
     * */
    var _getComputedStyle = function (obj, unit) {
        if (unit !== undefined) {
            return window.getComputedStyle(obj, null)[unit];
        } else {
            return window.getComputedStyle(obj, null);
        }
    }

    /*
     * 简单动画函数实现
     * */
    var animate = function (obj, config, callback) {
        var name = config.name;
        var unit = config.unit;
        var start = (_getComputedStyle(obj, name) + "").replace(unit, "") * 1;
        var end = config.value * 1;
        var easeOut = function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
        var t = 1;
        var animate = function () {
            if (name.indexOf("scroll") === 0) {
                obj[name] = easeOut(t, start, end - start, 20);
            } else {
                obj.style[name] = easeOut(t, start, end - start, 20) + unit;
            }
            t++;
            if (t <= 20) {
                _requestAnimationFrame(animate);
            } else {
                if (typeof callback === "function") {
                    callback();
                }
            }
        }
        _requestAnimationFrame(animate);
    }

    var hasClass = function (obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    var addClass = function (obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }

    var removeClass = function (obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

    /*淡入淡出*/
    qc.animate.fade = function (action, run) {
        if (action == "enter") {
            this.style.opacity = 0;
            animate(this, {
                name: "opacity",
                value: 1,
                unit: ""
            })
        } else if (action == "leave") {
            this.style.opacity = 1;
            animate(this, {
                name: "opacity",
                value: 0,
                unit: ""
            }, run);
        }
    }
    qc.animate.fadeIn = function (action, run) {
        if (action == "enter") {
            this.style.opacity = 0;
            animate(this, {
                name: "opacity",
                value: 1,
                unit: ""
            })
        } else {
            run();
        }
    }
    qc.animate.fadeOut = function (action, run) {
        if (action == "leave") {
            this.style.opacity = 1;
            animate(this, {
                name: "opacity",
                value: 0,
                unit: ""
            }, run);
        }
    }
    /*上拉下拉*/
    qc.animate.slide = function (action, run) {
        var overflow = this.style.overflow;
        var height = _getComputedStyle(this, "height").replace("px", "") * 1;
        this.style.overflow = "hidden";
        var _this = this;
        if (action == "enter") {
            this.style.height = "0px";
            animate(this, {
                name: "height",
                value: height,
                unit: "px"
            }, function () {
                _this.style.overflow = overflow;
                _this.style.height = "";
            })
        } else if (action == "leave") {
            animate(this, {
                name: "height",
                value: 0,
                unit: "px"
            }, run);
        }
    }
    qc.animate.slideUp = function (action, run) {
        var overflow = this.style.overflow;
        var height = _getComputedStyle(this, "height");
        this.style.overflow = "hidden";
        var _this = this;
        if (action == "enter") {
            this.style.height = "0px";
            animate(this, {
                name: "height",
                value: height,
                unit: "px"
            }, function () {
                _this.style.overflow = overflow;
                _this.style.height = "";
            })
        } else {
            run();
        }
    }
    qc.animate.slideDown = function (action, run) {
        if (action == "leave") {
            var height = _getComputedStyle(this, "height");
            this.style.opacity = 1;
            animate(this, {
                name: "height",
                value: 0,
                unit: "px"
            }, run);
        }
    }
})()
/*移动端事件扩展
 * 2016-3-30
 * event.js
 * */
;(function (qc) {
    function hasClass(obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }

    function removeClass(obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

    /*点击事件*/
    qc.extendEvent({
        name: "tap",
        touchstart: function (run, event, element) {
            this.y = event.touches[0].pageY;
            this.x = event.touches[0].pageX;
            addClass(element, "active");
            this.run = true;
        },
        touchmove: function (run, event, element) {
            if (this.run) {
                if (Math.abs(event.touches[0].pageY - this.y) > 12 || Math.abs(event.touches[0].pageX - this.x) > 12) {
                    this.run = false;
                    removeClass(element, "active");
                } else {
                    event.preventDefault();//修复touchend不执行bug\
                }
            }
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            if (this.run) {
                run();
            }
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
        }
    });
    /*长按事件
     * 说明:因为长按时间要屏蔽掉系统的默认事件，
     * 所以在需要系统默认事件(比如滚动)的时候，不能使用长按时间
     * */
    qc.extendEvent({
        name: "longtap",
        touchstart: function (run, event, element) {
            event.preventDefault();//修复touchend不执行bug
            addClass(element, "active");
            this.timer = setTimeout(function () {
                run();
            }, 750)
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            clearTimeout(run);
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
            clearTimeout(run);
        }
    });
    /*滑动事件
     * 只有左滑(action=left)右滑(action=right)和点击(action=tap)
     * 和点击
     * */
    qc.extendEvent({
        name: "tapswipe",
        touchstart: function (run, event, element) {
            this.y = event.touches[0].pageY;
            this.x = event.touches[0].pageX;
            this.endX = event.touches[0].pageX;
            addClass(element, "active");
            this.run = true;
        },
        touchmove: function (run, event, element) {
            if (this.run) {
                if (Math.abs(event.touches[0].pageY - this.y) <= 12) {
                    event.preventDefault();//修复touchend不执行bug
                    this.endX = event.touches[0].pageX;
                } else {
                    this.run = false;
                    removeClass(element, "active");
                }
            }
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            if (this.run) {
                if (this.endX - this.x > 12) {
                    run("right");
                } else if (this.endX - this.x < -12) {
                    run("left");
                } else {
                    run("tap");
                }
            }
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
        }
    });
})(qc)
