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