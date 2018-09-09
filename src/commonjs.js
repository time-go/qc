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
	window.needStack=[];
    window.need = function (path) {
        var model;
        var type = "js";
		if(path.indexOf('$url:')==0){
			var parent=getPath();
			path=path.replace('$url:','');
			if(path.substr(0, 1) != "/"){
				path=getPath()+path;
			}
		}
        var basePath = path.substr(0, path.lastIndexOf("/") + 1);
        if (path.lastIndexOf("!") > -1) {
            type = path.substr(path.lastIndexOf("!") + 1);
            path = path.substr(0, path.lastIndexOf("!"));
        } else {
            if (path.lastIndexOf(".js") < 0) {
                path = path + ".js";
            }
        }	
        model = get(path);
        if (type == "js") { //js预编译
            var script = "(function(out){\n";
            script += model.replace(/\$url:\//g,'\/').replace(/\$url:/g,basePath);
            script += "\n return out;\n";
            script += "})({});" + "//@ sourceURL=" + path;
            model = eval(script);
        }
        return model;
    }
})();