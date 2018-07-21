/**
 * Created by zhangyan on 2016/4/5.
 * commonjs.js
 */

;(function () {
    if((!$)||(!$.ajax)){
        window.console&&window.console("找不到ajax模块");
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
        $.ajax({
            "url": _path + "?r=" + (new Date() - 1),
            async: false,
            "error": function () {
                window.console && console.log(_path + "加载失败");
            },
            "success": function (data) {
                _model = data;
            }
        });

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
    var getPath = function(){
        var jsPath = document.currentScript ? document.currentScript.src : function(){
            var js = document.scripts
                ,last = js.length - 1
                ,src;
            for(var i = last; i > 0; i--){
                if(js[i].readyState === 'interactive'){
                    src = js[i].src;
                    break;
                }
            }
            return src || js[last].src;
        }();
        return jsPath.substring(0, jsPath.lastIndexOf('/') + 1);
    }
    window.need = function (path) {
        console.log(path)
        return $need(getPath(), path);
    };
})();