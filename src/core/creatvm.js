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