(function () {
    //创建控件
    qc.createWidget("demo", {
        templete: "<div><span q-text='{name}'></span></div>",
        view: function (vm, ve) {
            vm.name = "hello"
            window.console && console.log(this.props);
            var _this = this;
            setTimeout(function () {
                _this.updateParent("name", "张三");
            }, 3000)
        },
        load: function () {
            window.console && console.log("控件加载完毕...");
        },
        update: function () {
            window.console && console.log(this.props);
        }
    });
})()
