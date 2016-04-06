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