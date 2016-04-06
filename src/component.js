/**
 * Created by zhangyan on 2016/4/5.
 * component.js
 */

/*UIComponent需要依赖*/
;(function (qc) {
    if(!window.require){
        window.console&&window.console("找不到commonjs模块");
    }
    //创建组件
    qc.UIComponent = function (config) {
        var url = config.url;
        var id = config.id;
        var data = config.data;
        var element = document.getElementById(id);
        element.setAttribute(qc.PREFIX + "-view", id);
        return require(url)(document.getElementById(id), id, data);
    }
})(qc);
