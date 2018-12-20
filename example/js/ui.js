/*通用弹出框*/
(function () {
    var $css3Transform = function (element, attribute, value) {
        var arrPriex = ["O", "Ms", "Moz", "Webkit", ""], length = arrPriex.length;
        for (var i = 0; i < length; i += 1) {
            element.css(arrPriex[i] + attribute, value);
        }
    }
    var layer = 12;
    var model = {};
    model.stack = [];//弹出框对象
    window.openModel = function (url,data,callback) {
        var pop = $("<div class='pop-container no-select'></div>");
        $("#pop-bg").css("zIndex", model.stack.length * 2 + layer);
        var body = $("body");
        body.append(pop);
        if (model.stack.length == 0) {
            body.append("<div id='pop-bg' class='pop-bg no-select'></div>");
        }
        var zPop = model.stack.length * 2 + layer + 1;
        pop.css("zIndex", zPop);
        model.stack.push(pop);
        need(url)(pop,data,callback);
        (function(){
            var w = pop.width();
            var h = pop.height();
            var wScreen = $(window).width();
            var hScreen = $(window).height();
            if (w > wScreen) {
                pop.width(wScreen);
                w = wScreen;
            }
            if (h > hScreen) {
                pop.height(hScreen);
                h = hScreen;
            }
            var x = (wScreen - w) / 2;
            var y = (hScreen - h) / 2;
            pop.css("left", x + "px");
            pop.css("top", y + "px");
        })()
        var move = pop.find(".drag").css("cursor", "move");
        if(move){
            move.bind("mousedown", function (event) {
                var x0 = event.pageX;
                var y0 = event.pageY;
                var ex0 = pop.css("left").replace("px", "") * 1;
                var ey0 = pop.css("top").replace("px", "") * 1;
                move.bind("mousemove", function (e) {
                    var x1 = e.pageX;
                    var y1 = e.pageY;
                    var mx = x1 - x0;
                    var my = y1 - y0;
                    var ex1 = ex0 + mx;
                    var ey1 = ey0 + my;
                    pop.css("left", ex1 + "px");
                    pop.css("top", ey1 + "px");

                });
            });
            move.bind("mouseup", function () {
                move.unbind("mousemove");
            });
            move.bind("mouseleave", function () {
                move.unbind("mousemove");
            });
        }
    };
    window.closeModel = function () {
        var pop = model.stack.pop();
        if (model.stack.length == 0) {
            $("#pop-bg").remove();
        } else {
            $("#pop-bg").css("zIndex", model.stack.length * 2 + layer);
        }
        pop.remove();
    }

})()
/*日历组件*/
;(function () {   
    var calendar = {
        curDate: value = "",//当前的date对象
        secDate: value = "" ,//当前的date对象
        // 增加月 可以是负数
        addMouth: function (n) {
            this.curDate.setMonth((this.curDate.getMonth() + n));
        },
        //获取当前月是星期几
        getWeek: function () {
            return new Date(this.curDate.getFullYear(), this.curDate.getMonth(), 1).getDay();
        },
        //获取当前月最大天数
        getMaxDays: function () {
            return new Date(this.curDate.getFullYear(), this.curDate.getMonth() + 1, 0).getDate();
        },
        render: function (days,month) {
            var week = this.getWeek();
            var maxDay = this.getMaxDays();
            var start = week === 0 ? 7 : week;
            var end = start + maxDay;
            var _html = "";
            for (var i = 0; i < 42; i++) {
                var myd = new Date(this.curDate.getFullYear(), this.curDate.getMonth(), (i - start + 1));
                var day = myd.getDate();
                if (i >= start && i < end) {
                    if (day === this.secDate.getDate() && myd.getFullYear() === this.secDate.getFullYear() && myd.getMonth() === this.secDate.getMonth()) {
                        _html += "<span class='other active' data-value='" + myd.getTime() + "'>" + day + "</span>";
                    } else {
                        _html += "<span class='other' data-value='" + myd.getTime() + "'>" + day + "</span>";
                    }
                } else {
                    _html += "<span class='nomonth' data-value='" + myd.getTime() + "'>" + day + "</span>";
                }
            }
            days.html(_html);
            month.html(this.curDate.getFullYear() + "年" + (this.curDate.getMonth() + 1) + "月");
        }
    }
    qc.createWidget("date-time",{
        templete:["<div class=\"calendar\"><div class=\"input-group\">",
            "    <input type=\"text\" readonly class=\"input input-auto\" size=\"30\"/>",
            "    <span class=\"addon icon-calendar\"></span>",
            "</div>",
            "<div class=\"dialog\">",
            "    <div class=\"line\">",
            "        <span q-click=\"prv\" class=\"x2 icon-arrow-left text-center\"></span>",
            "        <strong class=\"x8 text-center mouth\"></strong>",
            "        <span q-click=\"next\" class=\"x2 icon-arrow-right text-center\"></span>",
            "    </div>",
            "    <div class=\"line weeks padding-top\">",
            "        <span>日</span>",
            "        <span>一</span>",
            "        <span>二</span>",
            "        <span>三</span>",
            "        <span>四</span>",
            "        <span>五</span>",
            "        <span>六</span>",
            "    </div>",
            "    <div class=\"line days\">",
            "        <span></span>",
            "    </div>",
            "    <div class=\"line btns\">",
            "        <span class=\"button button-small bg-sub float-right submit\">确定</span>",
            "        <span class=\"button button-small bg-blue-light float-right today\">今天</span>",
            "        <span class=\"button button-small float-right cancel\">取消</span>",
            "    </div>",
            "</div></div>"].join(""),
        view: function (vm, ve) {
            
        },
        load: function () {
            var $this=this;
            function dclick(e) {
                dialog.fadeOut("fast");
                $(document).off("click", dclick);
            }
            var element=$(this.getElement());
            element.find("input").val(this.props.value);
            var dialog = $(element).find(".dialog");
            var days = $(element).find(".days");
            var month = $(element).find(".mouth");
            $(element).find("input").attr("placeholder", this.props.placeholder);
            
            $(element).find(".input-group").on("click", function (e) {
                e.stopPropagation();
                if (dialog.is(":hidden")) {                   
                    var value=$this.props.value;
                    var date;
                    if (value === ""){
                        date = new Date();
                    }else{
                        date = new Date(Date.parse(value.replace(/-/g,'/'))); 
                    }
                    calendar.curDate = new Date(date.getTime());//当前的date对象
                    calendar.secDate = new Date(date.getTime());//当前的date对象
                    calendar.render(days,month);
                    dialog.fadeIn("fast");
                } else {
                    dialog.fadeOut("fast");
                }
                $(document).on("click", dclick);
            });
            

            $(element).find(".icon-arrow-left").on("click", function (e) {
                e.stopPropagation();
                calendar.addMouth(-1);
                calendar.render(days,month);
            });
            $(element).find(".icon-arrow-right").on("click", function (e) {
                e.stopPropagation();
                calendar.addMouth(1);
                calendar.render(days,month);
            });
            $(element).find(".days").on("click", "span", function (e) {
                e.stopPropagation();
                var d = new Date($(this).attr("data-value") * 1);
                calendar.secDate = d;
                days.find("span").removeClass("active")
                $(this).addClass("active");
            });
            $(element).find(".submit").on("click", function (e) {
                var d = calendar.secDate;
                $this.updateParent("value",d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
                dialog.fadeOut("fast");
            });
            $(element).find(".today").on("click", function (e) {
                e.stopPropagation();
                var d = new Date();
                $this.updateParent("value",d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
                dialog.fadeOut("fast");
            });
            $(element).find(".cancel").on("click", function (e) {
                e.stopPropagation();
                dialog.fadeOut("fast")

            });
            $(element).find(".dialog").on("click", function (e) {
                e.stopPropagation();

            })

        },
        update: function (key, value) {
            var element=this.getElement();
            $(element).find("input").val(this.props.value);
        }
    })
})()
