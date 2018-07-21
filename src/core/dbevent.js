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
            var qtrue = obj.getAttribute("qtrue");
            var qfalse = obj.getAttribute("qfalse");
            if (qtrue == undefined || qtrue == null) {
                if (obj.checked) {
                    v.vm.setValue(v.pro, true);
                } else {
                    v.vm.setValue(v.pro, false);
                }
            } else {
                if (obj.checked) {
                    v.vm.setValue(v.pro, qtrue);
                } else {
                    v.vm.setValue(v.pro, qfalse);
                }
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