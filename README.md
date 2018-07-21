# 轻量级前端框架-QC
+ QC是一个前端MVVM框架，适合用来构建复杂的业务逻辑
+ 作者邮箱:time-go@163.com
+ QQ群:330603020

### 特点:
+ 1.良好的浏览器兼容性(兼容IE8)
+ 2.组件化支持
+ 3.性能优异
+ 4.数据智能补齐
+ 5.自定义事件
+ 6.自动特殊字符转义
+ 7.动画模块和动画自定义接口

### 源码目录结构
- build
    - qc.js 合并后的文件
    - qc.min.js 合并编译后的文件
    - qc.js.JSCompress 打包配置文件
- demo 一些简单的应用事例
- src 代码文件
    + core 核心代码目录
    - animate.js 自定义一个动画
    - commonjs.js 自定义的模块加载器
    - event.js 扩展的一个移动端事件
- test 开发调式的一些测试文件
- qc设计概要.doc 设计的中关键点

### 感谢名单
+ QQ5759125(发现q-html指令bug)

# 使用文档

### hello word

~~~ html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <script src="qc.min.js"></script>
</head>
<body>
<div q-view="myview">
    <span q-text="{say}+{person.name}"></span>
</div>
</body>
</html>
<script>
    qc.view("myview", function (vm) {
        vm.say = "hello";
        vm.person = {
            name: "张三"
        }
    })
</script>
~~~
- 在qc里面绑定变量用“{}”里面是变量名称
- 如果是对象，那我们就是{xxx.xxx}
- vm上放外面的数据
- q-view="***myview***"和javascript里面的 qc.view("***myview***",是对应的，大家可以叫别的名字，只要相同就可以了
- 变量是可以进行运算的
