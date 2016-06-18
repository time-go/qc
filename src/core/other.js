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