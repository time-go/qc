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