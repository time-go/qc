(function (qc) {
    /*事件扩展*/
    qc.extendEvent({
        name: "tap",
        touchstart: function (run, event) {
            event.preventDefault();//修复touchend不执行bug
        },
        touchend: function (run, event) {
            run();
        }
    })
    qc.extendEvent({
        name: "longtap",
        touchstart: function (run, event) {
            event.preventDefault();//修复touchend不执行bug
            this.timer = setTimeout(function () {
                run();
            }, 500);
        },
        touchend: function (run, e) {
            clearTimeout(this.timer);
        }
    })
})(qc)
