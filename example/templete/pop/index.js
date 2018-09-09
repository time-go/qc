out = function (element,data,callback) {
    $(element).html(need("$url:index.html!text"))
    var m = qc.view("pop", function (vm, ve) {
        vm.email=data.email;
        vm.date=data.date;
        ve.save=function(){
            callback("hello!!!");
            closeModel();
        }
        ve.cancel=function(){
            closeModel();
        }
    })
}