out = function (element) {
    $(element).html(need("$url:index.html!text"))
    var m = qc.view("list", function (vm, ve) {
        vm.list = [{
            img: "images/peter-avatar.jpg",
            sex: "0",
            sexState: false,
            info: "Following the popularity of Kim Yeo-hui, a Google Android mobile phone accompaniment was used to show the best singing performance.",
            infoState: false
        }];
        ve.upSex = function ($self) {
            $self.$set("sexState", true)
        }
        ve.submitSex = function ($self) {
            $self.$set("sexState", false);
        }
        ve.upInfo = function ($self) {
            $self.$set("infoState", true);
        }
        ve.submitInfo = function ($self) {
            $self.$set("infoState", false)
        }
        ve.remove = function ($self) {
            vm.listsplice($self.$index, 1);
        }
        ve.add=function(){
            vm.listpush({
                img: "images/peter-avatar.jpg",
                sex: "0",
                sexState: false,
                info: "Following the popularity of Kim Yeo-hui, a Google Android mobile phone accompaniment was used to show the best singing performance.",
                infoState: false
            })  
        }
        ve.pop=function(){
            window.openModel("$url:../pop/index",{email:"time-go@163.com",date:"2018-9-7"},function(info){
                console.log(info);
            })
        }

        ve.$watch("list.sex", function (newVlue, oldValue) {
            console.log('newVlue:' + newVlue, 'oldValue:' + oldValue);
        })
    })
}
