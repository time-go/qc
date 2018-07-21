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
- [hello word](#hello-word-返回目录)
- [绑定数组](#绑定数组-返回目录)
- [绑定事件](#绑定事件-返回目录)
- [更新视图](#更新视图-返回目录)
- [form表单](#form表单-返回目录)
- [属性绑定](#属性绑定-返回目录)
- [数组操作](#数组操作-返回目录)
- [绑定父元素](#绑定父元素-返回目录)
- [表达式与函数调用](#表达式与函数调用-返回目录)
- [外面更新视图](#外面更新视图-返回目录)
- [键盘事件](#键盘事件-返回目录)
- [事件参数](#事件参数-返回目录)
- [量监控](#量监控-返回目录)
- [自定义动画](#自定义动画-返回目录)
- [自定义事件](#自定义事件-返回目录)
- [自定义控件](#自定义控件-返回目录)
- [系统常用API](#系统常用API-返回目录)

### hello word [返回目录](#使用文档)

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
- q-view="**myview**"和javascript里面的 qc.view(" **myview** ",是对应的，大家可以叫别的名字，只要相同就可以了
- 变量是可以进行运算的

### 绑定数组 [返回目录](#使用文档)

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
**q-each**
- q-each绑定数组
- 数组里的内容要放在一个**闭合的标签里**,下面代码是错误的
~~~ html
 <div q-each="list">
    索引:<span q-text="{$key}+1"></span>
    姓名:<span q-text="{name}"></span>
    性别:<span q-text="{sex}"></span>
</div>
~~~
- $key是数组的索引，是框架生成的
- 绑定数组没有“{}”，所以只能绑定单一属性，不能绑定表达式

### 绑定事件 [返回目录](#使用文档)

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
  
 ### 更新视图 [返回目录](#使用文档)
 
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
**setValue**
 - 每一个对象都有一个setValue
 - 可以更新单个属性
 - 可以更新整个对象和数组
 - 直接 **vm.xxx=** 值是不改变视图的

### form表单 [返回目录](#使用文档)

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
        <input q-check="check4" qtrue="Y" qfalse="N" type="checkbox">
        <span q-text="{check4}"></span>
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
        vm.check4 = "Y";

    })
</script>
~~~

|表单类型|指令|作用|
|--|--|--|
|input ,textarear|q-value-change,q-value-blur|第一个指令 但文本框变化同步到数据模型，第一个指令当文本框失去焦点同步到数据模型|
|radio|q-radio|当绑定的值和value值相等的时候 绑定|
|checkbox|q-check|1.没有qtrue和qfalse时：  当绑定值得为true的时候选中<br /> 2.有有qtrue和qfalse时： 绑定值为qtrue的值是选中|
|select|q-select|选中的值同步到数据模型|

**备注：表单对属性的绑定没有“{}”，所以只能绑定单一属性，不能绑定表达式**

### 属性绑定 [返回目录](#使用文档)
~~~ html
<style>
    .back0 {
        background-color: coral;
    }

    .back1 {
        background-color: forestgreen;
    }
</style>
<div q-view="myview">
    <div q-css="color:{c}">你好</div>
    <input q-attr="id:'view'+{uid}" type="text" q-value-change="say">
    <span q-text="{uid}+':说'+{say}"></span>
    <input type="text" q-prop="disabled:{uid}=='123'" value="q-prop" />
    <div>
        <ul q-each="list">
            <li q-class="back0:{$key} % 2 ==0;back1:{$index} % 2==1">
                <span q-text="{$key}+1"></span>
                <span>姓名:</span><span q-text="{name}"></span>---
                <span>性别:</span><span q-text="{sex}"></span>
            </li>
        </ul>
    </div>
</div>

<script>
    qc.view("myview", function (vm, ve) {
        vm.list = [
            {"name": "张三", "sex": "男"}
            ,
            {"name": "李四", "sex": "男"}
            ,
            {"name": "王五", "sex": "男"}
        ];
        vm.uid = "123";
        vm.say = "word";
        vm.c = "red"
    })
</script>
~~~
|指令|作用|
|--|--|
|q-text|绑定的时候特殊字符会被转义，比如html片段会被转义
|q-html|原始数据是什么样就会输出什么样，可能是html片段
|q-css|绑定style，可绑定多个q-css="color:{xx}+{xx};top:表达式;..."
|q-attr|绑定属性 用法同q-css
|q-class|绑定样式q-css="class1:{xx}+{xx};class2:表达式;..."， 当表达式值为true即绑定改样式，为false移除该样式
|q-prop|用法同q-calss,用于绑定 readonly disabled等
|q-visible|q-visible="{xx}+{xx}"当绑定的值为true时元素显示，为false是元素隐藏

### 数组操作 [返回目录](#使用文档)
~~~ html
<div q-view="myview">
    <div q-each="list">
        <div>
            索引:<span q-text="{$key}+1"></span>
            姓名:<span q-text="{name}"></span>
            性别:<span q-text="{sex}"></span>
        </div>
    </div>

    <input q-click="mypush" type="button" value="push">
    <input q-click="mypop" type="button" value="pop">
    <input q-click="mysplice" type="button" value="splice">
    <input q-click="myshift" type="button" value="shift">
    <input q-click="myunshift" type="button" value="unshift">
    <input q-click="myconcat" type="button" value="concat">
</div>
<script>
    qc.view("myview", function (vm, ve) {
        vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];
        ve.mypush=function(){
            vm.listpush({name: "王五", sex: "男"})
        }
        ve.mypop=function(){
            
        }
        ve.mysplice=function(){

        }
        ve.myunshift=function(){

        }
        ve.myconcat=function(){

        }

    })
</script>
~~~
- 数组操作就是 **属性名+方法** 像示一样，方法的参数和原生数组方法相同
- 还有个整体更新数组的方法setValue，在“更新视图”哪一章

### 绑定父元素 [返回目录](#使用文档)
~~~ html
<div q-view="myview">
    <div q-each="list">
        <div>
            索引:<span q-text="{$key}+1"></span>
            姓名:<span q-text="{$p.home}+':'+{name}"></span>
            性别:<span q-text="{sex}"></span>
        </div>
    </div>
</div>
<script>
    qc.view("myview", function (vm, ve) {
        vm.home = "深圳";
        vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];

    })
</script>
~~~
- **$p.xxx** 绑定父元素，当有多级数字 **$p.$p.xxx** 可以无限级向上传递

### 表达式与函数调用 [返回目录](#使用文档)

~~~ html
<div q-view="myview">
    <div>
        <ul q-each="list">
            <li>
                <span>职位:</span><span q-text="{name}==['张三','李四']?['元帅','将军','其他']"></span>--
                <span>姓名:</span><span q-text="{name}"></span>---
                <span>性别:</span><span q-text="sex({sex})"></span>
            </li>
        </ul>
    </div>
</div>
<script>
    qc.fun.sex = function (v) {
        if (v == "0") {
            return "男";
        } else {
            return "女";
        }
    }
    qc.view("myview", function (vm, ve) {
        vm.list = [
            {"name": "张三", "sex": "0"}
            ,
            {"name": "李四", "sex": "0"}
            ,
            {"name": "王五", "sex": "1"}
        ];
    })
</script>
~~~
- 表达式支持示例上的“多目”运算
- **qc.fun** 是定义调用函数的位置

### 外面更新视图 [返回目录](#使用文档)
~~~ html
<div q-view="myview">
    <div q-each="list">
        <div>
            索引:<span q-text="{$key}+1"></span>
            姓名:<span q-text="{$p.home}+':'+{name}"></span>
            性别:<span q-text="{sex}"></span>
        </div>
    </div>
</div>
<button onclick="update()">更新</button>
<script>
    var m = qc.view("myview", function (vm, ve) {
        vm.home = "深圳";
        vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];

    })
    function update() {
        m.setValue("home","广东")
    }
</script>
~~~

### 键盘事件 [返回目录](#使用文档)

~~~ html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title></title>
    <script src="qc.min.js"></script>
</head>
<body>
<div q-view="myview">
    <input type="text" q-keyup="mykey" q-value-change="say">
</div>
</body>
</html>
<script>
    qc.view("myview", function (vm, ve) {
        vm.say = "hello";
        ve.mykey = function ($self, event) {
            window.console && console.log(event);
        }
    })
</script>
~~~
- q-keyup
- q-keydown

### 事件参数 [返回目录](#index)

~~~ html
<div q-view="myview">
    <div q-each="list">
        <div>
            索引:<span q-text="{$key}+1"></span>
            姓名:<span q-text="{name}"></span>
            性别:<span q-text="{sex}"></span>
            <input q-click="mysplice" type="button" value="splice">
        </div>
    </div>

    <input q-click="mypush" type="button" value="push">
</div>
<script>
    qc.view("myview", function (vm, ve) {
        vm.list = [{name: "张三", sex: "男"}, {name: "李四", sex: "女"}];
        ve.mypush = function () {
            vm.listpush({name: "王五", sex: "男"})
        }
        ve.mysplice = function ($self, event, action) {
            vm.listsplice($self.$key,1);
            window.console&&window.console.log(this)
        }

    })
</script>
~~~
- **$self** 为当前事件所在的vm,数组通过$key这个系统属性可以取到数组索引
- **event** 为普通事件参数里面包含了事件发生的各种状态
- **action** 自定义组合事件用到
- **this** 当前事件发生的element对象

### 变量监控 [返回目录](#使用文档)
~~~ html
   <div q-view="myview">
    <input type="text" q-value-change="say">
    <span q-text="{say}+{person.name}"></span>
</div>

<script>
    qc.view("myview", function (vm, ve) {
        vm.say = "hello";
        vm.person = {
            name: "张三"
        }
        ve.$watch("say", function (newValue, oldValue, $self) {
            window.console && console.log(newValue, oldValue);
            window.console && console.log($self)
        })
    })
</script>
~~~
- 如果要监控person里面的 **name**， **$watch("person.name"**
- 监控数组里面的变量，**$watch("list.xxx",list** 是数组,xxx数组里面对象属性
- **newValue** , **oldValue** , **$self** 三个参数,新值、旧值、监控的属性所在的vm

### 自定义动画 [返回目录](#使用文档)
~~~ html
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>动画</title>
    <style>
        .rect {
            width: 200px;
            height: 200px;
            background: red;
        }
    </style>
    <script src="jquery-1.11.2.min.js"></script>
    <script src="qc.min.js"></script>
</head>
<body>
<div q-view="myview">
    <div q-visible="{show}" q-animate="testAnimate" class="rect"></div>
    <input q-click="veAnimate" type="button" value="动画">
    <br>
    <ul q-each="list">
        <li q-animate="testAnimate"><span q-text="{text}"></span></li>
    </ul>
    <input q-click="add" type="button" value="添加一行">
    <input q-click="remove" type="button" value="删除第一行">
</div>
</body>
</html>
<script>
    /*
    *
     *1.这里需要引用jquery模块，因为动画demo是基于jquery做的为代码简介
     * 2.系统内置动画是不需要jquery的
    * */
    /*//自定义动画 这里action 有两个值
     *action 为enter 显示状态的动画 leave隐藏状态的动画
     * run 在action为leave的时候 执行完动画要调用callback
     * */
    qc.animate.testAnimate = function (action, run) {
        if (action == "enter") {
            $(this).hide();
            $(this).slideDown();
        } else if (action == "leave") {
            $(this).slideUp(function () {
                run();
            })
        }
    }
    qc.view("myview", function (vm, ve) {
        vm.show = true;
        vm.list = [{text: "动画测试" + qc.getRandom()}];
        ve.veAnimate = function () {
            vm.setValue("show", !vm.show);
        }
        ve.add = function () {
            //vm.listpush({text: "动画测试" + qc.getRandom()})
            vm.listconcat([{text: "动画测试" + qc.getRandom()}, {text: "动画测试" + qc.getRandom()}])
            //vm.listunshift({text: "动画测试" + qc.getRandom()});
        }
        ve.remove = function () {
            vm.listsplice(0, 1);
            //vm.listpop();
            //vm.listshift()
        }
    })
</script>
~~~
**说明**
- q-animate="动画名称"绑定动画指令
- 动画必须定义在qc.animate下面
- enter元素插入到页面，leave元素从页面移走
- run定移除动画是，动画执行完要调用这个函数，这个函数作用是改变数据模型，shift数据模型和当前视图对应

**支持动画的指令**
- q-visible
- 数组的相关操作方法

### 自定义事件 [返回目录](#使用文档)
~~~ javascript
    /*点击事件*/
    qc.extendEvent({
        name: "tap",
        touchstart: function (run, event, element) {
            this.data = "张三";
            //省略
            //event 事件参数
            //element 事件发生的element对应
            //run 指定绑定的事件可以带参数 比如run("xxx");
            /*
             * <span q-tap="myenent"></span>
             * ve.mtevent=function($self,event,action){
             * action值为xxx
             *
             * }
             * */
        },
        touchmove: function (run, event, element) {
            //省略
            window.console && console.log(this.data);
            /*要传递的参数可以放在this传递*/
        },
        touchend: function (run, event, element) {
            //省略
        },
        touchcancel: function (run, event, element) {
            //省略
        }
    });
   ~~~
   **说明**
   - pc端的定义就是和mouse有关即 mousedown mouseup mousemove mouseout mouseleave mouseover mouseenter
   
   **自定义事件q-tapswipe用法（源码event.js有这个自定义事件）**
   ~~~ html
    <ul q-each="list" class="ui-list ui-list-link ui-border-tb">
       <li q-tapswipe="action" q-animate="slide" class="ui-border-t">
           <div class="ui-list-img">
               <img width="100" height="68" src="img/mp.jpeg"/>
           </div>
           <div class="ui-list-info">
               <h4 class="ui-nowrap" q-text="{title}"></h4>
               <p class="ui-nowrap" q-text="{descript}"></p>
           </div>
       </li>
   </ul>
   <script>
       //省略...
       ve.action = function ($self, event, action) {
           if (action === "tap") {
               mobile.loadPage("two");
           } else if (action == "right") {
               mobile.dialog("确认要删除吗？", function () {
                   vm.listsplice($self.$key, 1);
               })
           }
       }
       //省略...
   </script>
   ~~~
   
  ### 自定义控件 [返回目录](#使用文档)
  ~~~ html
  <demo bind:name="person.name" sex="男"></demo>
  <!--"bind:"开头的值 是绑定父元素的值
  没有"bind:"的值 不绑定数据-->
  <script>
      //创建控件
      qc.createWidget("demo", {
          templete: "<div><span q-text='{name}'></span></div>",
          view: function (vm, ve) {
              vm.name = "hello"
              window.console && console.log(this.props);
              var _this = this;
              setTimeout(function () {
                  _this.updateParent("name", "张三");//更新父元素"name" 对应data-name 的name，此处
                  //父元素person.name的值变为张三
              }, 3000)
          },
          load: function () {
              window.console && console.log("控件加载完毕...");
              this.getElement()//获取控件的element元素
          },
          update: function (key, value) {
              //此控件绑定了 父元素 person.name,当  person.name 变化时
              //此函数被调用
              window.console && console.log(this.props);
              //this.props//获取父元素 属性上绑定的值 即从父元素传来的值
              //this.viewModel//控件的vm对象
              //this.getElement 获取控件element对象
  
          }
      });
  ~~~
  **createWidget** 第一个参数是控件名称
  
  ### 系统常用API [返回目录](#使用文档)
  |api|作用|
  |-|-|
  |qc.getModel()|把vm对象转换为json 去掉系统生成的的属性|
  |qc.collection()|手动回收垃圾，一般做单页面应用会用到|