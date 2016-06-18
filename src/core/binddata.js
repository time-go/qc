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
                        if (k === "html") {
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
                        } else if (k === "html") {
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
                                    var newDiv = document.createElement("div");
                                    newDiv.innerHTML = divText.join("");
                                    s.appendChild(newDiv.children[0]);
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
                                    var newDiv = document.createElement("div");
                                    newDiv.innerHTML = divText.join("");
                                    while (newDiv.children.length > 0) {
                                        s.appendChild(newDiv.children[0]);
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