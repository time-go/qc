/*移动端事件扩展
 * 2016-3-30
 * */
(function (qc) {
    function hasClass(obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    function addClass(obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }

    function removeClass(obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

    /*点击事件*/
    qc.extendEvent({
        name: "tap",
        touchstart: function (run, event, element) {
            this.y = event.touches[0].pageY;
            this.x = event.touches[0].pageX;
            addClass(element, "active");
            this.run = true;
        },
        touchmove: function (run, event, element) {
            if (this.run) {
                if (Math.abs(event.touches[0].pageY - this.y) > 12 || Math.abs(event.touches[0].pageX - this.x) > 12) {
                    this.run = false;
                    removeClass(element, "active");
                } else {
                    event.preventDefault();//修复touchend不执行bug\
                }
            }
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            if (this.run) {
                run();
            }
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
        }
    });
    /*长按事件
     * 说明:因为长按时间要屏蔽掉系统的默认事件，
     * 所以在需要系统默认事件(比如滚动)的时候，不能使用长按时间
     * */
    qc.extendEvent({
        name: "longtap",
        touchstart: function (run, event, element) {
            event.preventDefault();//修复touchend不执行bug
            addClass(element, "active");
            this.timer = setTimeout(function () {
                run();
            }, 750)
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            clearTimeout(run);
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
            clearTimeout(run);
        }
    });
    /*滑动事件
     * 只有左滑(action=left)右滑(action=right)和点击(action=tap)
     * 和点击
     * */
    qc.extendEvent({
        name: "tapswipe",
        touchstart: function (run, event, element) {
            this.y = event.touches[0].pageY;
            this.x = event.touches[0].pageX;
            this.endX = event.touches[0].pageX;
            addClass(element, "active");
            this.run = true;
        },
        touchmove: function (run, event, element) {
            if (this.run) {
                if (Math.abs(event.touches[0].pageY - this.y) <= 12) {
                    event.preventDefault();//修复touchend不执行bug
                    this.endX = event.touches[0].pageX;
                } else {
                    this.run = false;
                    removeClass(element, "active");
                }
            }
        },
        touchend: function (run, event, element) {
            removeClass(element, "active");
            if (this.run) {
                if (this.endX - this.x > 12) {
                    run("right");
                } else if (this.endX - this.x < -12) {
                    run("left");
                } else {
                    run("tap");
                }
            }
        },
        touchcancel: function (run, event, element) {
            removeClass(element, "active");
        }
    });
})(qc)
