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

### 绑定数组

~~~ html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <script src="qc.min.js"></script>
</head>
<body>
<div q-view="myview">

    <div q-each="list">
        <div>
            索引:<span q-text="{$key}+1"></span>
            姓名:<span q-text="{name}"></span>
            性别:<span q-text="{sex}"></span>
        </div>
    </div>
</div>
</body>
</html>
<script>
    qc.view("myview", function (vm, ve) {
        vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];
    })
</script>
~~~
***q-each***
- q-each绑定数组
- 数组里的内容要放在一个***闭合的标签里***,下面代码是错误的
~~~ html
 <div q-each="list">
    索引:<span q-text="{$key}+1"></span>
    姓名:<span q-text="{name}"></span>
    性别:<span q-text="{sex}"></span>
</div>
~~~
- $key是数组的索引，是框架生成的
- 绑定数组没有“{}”，所以只能绑定单一属性，不能绑定表达式

### 绑定事件

~~~ html
<div q-view="myview">
    <span q-text="{say}+{person.name}"></span>
    <button q-click="alert">点击</button>
</div>

<script>
    qc.view("myview", function (vm, ve) {
        vm.say = "hello";
        vm.person = {
            name: "张三"
        }
        ve.alert = function () {
            alert("你好");
        }
    })
</script>
~~~
- q-click="alert"和ve.alert对应
- 事件需要绑定到参数ve上
- 系统事件
   - 通用：q-click q-dblclick
   - PC: q-mousedown q-mouseup q-mousemove q-mouseout q-mouseleave q-mouseover q-mouseenter
   - 移动: q-touchstart q-touchmove q-touchend q-touchcancel
  
 ### 更新视图
 
 ~~~ html
 <div q-view="myview">
     书名：<span q-text="{book.name}"></span><br>
     价格:<span q-text="{book.price}"></span>元<br>
     <button q-click="change">改变价格</button>
     <button q-click="changeAll">更换书籍</button>
     <br>
     <button q-click="add">更新数组</button>
     (<span q-text="{list.length}"></span>)
 
     <div q-each="list">
         <div>
             <span q-text="{$key}+1"></span>.
             姓名:<span q-text="{name}"></span>
             性别:<span q-text="{sex}"></span>
         </div>
     </div>
 </div>
 <script>
     qc.view("myview", function (vm, ve) {
         vm.book = {
             name: "QC源码分析",
             price: "36"
         }
         vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];
         ve.add = function () {
             vm.setValue("list", [{name: "王五", sex: "男"}, {name: "赵六", sex: "女"}])
         }
         ve.change = function () {
             vm.book.setValue("price", "40");
         }
         ve.changeAll = function () {
             vm.book.setValue({
                 name: "AngularJS权威教程",
                 price: 99
             });
         }
     })
 </script>
 ~~~
***setValue***
 - 每一个对象都有一个setValue
 - 可以更新单个属性
 - 可以更新整个对象和数组
 - 直接 ***vm.xxx=*** 值是不改变视图的

### form表单

~~~ html
 <div q-view="myview">
    <div>
        <input q-radio="name" type="radio" value="张三">
        <input q-radio="name" type="radio" value="李四">
        <input q-radio="name" type="radio" value="王五">
    </div>
    <div>
        <input q-check="check1" type="checkbox">check1
        <input q-check="check2" type="checkbox">check2
        <input q-check="check3" type="checkbox">check3
    </div>
    <div>
        <select q-select="name">
            <option value="张三">张三</option>
            <option value="李四">李四</option>
            <option value="王五">王五</option>
        </select>
    </div>
    <div>
        <input type="text" q-value-change="text"><span q-text="{text}"></span>
    </div>
</div>
<script>
    qc.view("myview", function (vm, ve) {
        vm.text="hello";
        vm.name = "李四";
        vm.check1 = false;
        vm.check2 = true;
        vm.check3 = false;

    })
</script>
~~~

|表单类型|指令|作用|
|--|--|--|
|input ,textarear|q-value-change,q-value-blur|第一个指令 但文本框变化同步到数据模型，第一个指令当文本框失去焦点同步到数据模型|
|radio|q-radio|当绑定的值和value值相等的时候 绑定|
|checkbox|q-check|当绑定值得为true的时候绑定|
|select|q-select|选中的值同步到数据模型|

***表单对属性的绑定没有“{}”，所以只能绑定单一属性，不能绑定表达式***

