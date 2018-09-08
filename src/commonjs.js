/**
 * Created by zhangyan on 2016/4/5.
 * commonjs.js
 */

; (function () {
    var get = function (url) {
        // XMLHttpRequest对象用于在后台与服务器交换数据
        url = url + "?r=" + (new Date() - 1);
        var retStr = "";
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.onreadystatechange = function () {
            // readyState == 4说明请求已完成
            if (xhr.readyState == 4 && xhr.status == 200 || xhr.status == 304) {
                // 从服务器获得数据 
                retStr = xhr.responseText;
            } else {
                window.console && console.log(url + "加载失败");
            }
        };
        xhr.send();
        return retStr;
    }
    //---------------commonjs规范----------------//;
    window.$need = function (parent, path) {
        var _model;
        var _type = "js";
        var _basePath;
        if (path.substr(0, 1) == "/") {
            _basePath = path;
        } else {
            _basePath = parent + path;
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
        _model = get(_path);
        if (_type == "js") { //js预编译
            var _script = "(function(out){\n";
            _script += "var $parent = \"" + _basePath + "\";\n";
            _script += _model.replace(/need\(/g, "$need($parent,");
            _script += "\n return out;\n";
            _script += "})({});" + "//@ sourceURL=" + _path;
            _model = eval(_script);
        }
        return _model;
    }
    var getPath = function () {
        var jsPath = document.currentScript ? document.currentScript.src : function () {
            var js = document.scripts
                , last = js.length - 1
                , src;
            for (var i = last; i > 0; i--) {
                if (js[i].readyState === 'interactive') {
                    src = js[i].src;
                    break;
                }
            }
            return src || js[last].src;
        }();
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }
    window.need = function (path) {
        return $need(getPath(), path);
    };
})();