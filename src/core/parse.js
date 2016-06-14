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