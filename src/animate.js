/**
 * Created by 张岩 on 2016/3/31.
 * 动画模块
 * animate.js
 */

;(function () {
    /*
     * requestAnimationFrame兼容写法
     * */
    var _requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 16)
            };
    })();
    /*
     * 获取运行时样式
     * */
    var _getComputedStyle = function (obj, unit) {
        if (unit !== undefined) {
            return window.getComputedStyle(obj, null)[unit];
        } else {
            return window.getComputedStyle(obj, null);
        }
    }

    /*
     * 简单动画函数实现
     * */
    var animate = function (obj, config, callback) {
        var name = config.name;
        var unit = config.unit;
        var start = (_getComputedStyle(obj, name) + "").replace(unit, "") * 1;
        var end = config.value * 1;
        var easeOut = function (t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        }
        var t = 1;
        var animate = function () {
            if (name.indexOf("scroll") === 0) {
                obj[name] = easeOut(t, start, end - start, 20);
            } else {
                obj.style[name] = easeOut(t, start, end - start, 20) + unit;
            }
            t++;
            if (t <= 20) {
                _requestAnimationFrame(animate);
            } else {
                if (typeof callback === "function") {
                    callback();
                }
            }
        }
        _requestAnimationFrame(animate);
    }

    var hasClass = function (obj, cls) {
        return obj.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
    }

    var addClass = function (obj, cls) {
        if (!hasClass(obj, cls)) obj.className += " " + cls;
    }

    var removeClass = function (obj, cls) {
        if (hasClass(obj, cls)) {
            var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
            obj.className = obj.className.replace(reg, ' ');
        }
    }

    /*淡入淡出*/
    qc.animate.fade = function (action, run) {
        if (action == "enter") {
            this.style.opacity = 0;
            animate(this, {
                name: "opacity",
                value: 1,
                unit: ""
            })
        } else if (action == "leave") {
            this.style.opacity = 1;
            animate(this, {
                name: "opacity",
                value: 0,
                unit: ""
            }, run);
        }
    }
    qc.animate.fadeIn = function (action, run) {
        if (action == "enter") {
            this.style.opacity = 0;
            animate(this, {
                name: "opacity",
                value: 1,
                unit: ""
            })
        } else {
            run();
        }
    }
    qc.animate.fadeOut = function (action, run) {
        if (action == "leave") {
            this.style.opacity = 1;
            animate(this, {
                name: "opacity",
                value: 0,
                unit: ""
            }, run);
        }
    }
    /*上拉下拉*/
    qc.animate.slide = function (action, run) {
        var overflow = this.style.overflow;
        var height = _getComputedStyle(this, "height").replace("px", "") * 1;
        this.style.overflow = "hidden";
        var _this = this;
        if (action == "enter") {
            this.style.height = "0px";
            animate(this, {
                name: "height",
                value: height,
                unit: "px"
            }, function () {
                _this.style.overflow = overflow;
            })
        } else if (action == "leave") {
            animate(this, {
                name: "height",
                value: 0,
                unit: "px"
            }, run);
        }
    }
    qc.animate.slideUp = function (action, run) {
        var overflow = this.style.overflow;
        var height = _getComputedStyle(this, "height");
        this.style.overflow = "hidden";
        var _this = this;
        if (action == "enter") {
            this.style.height = "0px";
            animate(this, {
                name: "height",
                value: height,
                unit: "px"
            }, function () {
                _this.style.overflow = overflow;
            })
        } else {
            run();
        }
    }
    qc.animate.slideDown = function (action, run) {
        if (action == "leave") {
            var height = _getComputedStyle(this, "height");
            this.style.opacity = 1;
            animate(this, {
                name: "height",
                value: 0,
                unit: "px"
            }, run);
        }
    }
})()