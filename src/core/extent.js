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