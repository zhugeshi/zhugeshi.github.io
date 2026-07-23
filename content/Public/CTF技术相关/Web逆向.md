
最近老是遇到一些web逆向相关的知识，但是苦于不会html这些内容，所以看起来很吃力。所以写一篇文章来总结一下相关的知识点
# 寻找程序的入口点
通常这一类题目会是让你输入用户名或者别的东西，然后点击登录或者校验按钮来触发校验。这个时候我们就需要确认程序会从哪里开始处理逻辑。
## EventTarget.addEvenListener()
- *EventTarget.addEventListener()* 方法将指定的监听器注册到 EventTarget 上，当该对象触发指定的事件时，指定的回调函数就会被执行。事件目标可以是一个文档上的元素 Element、Document 和 Window，也可以是任何支持事件的对象（比如 XMLHttpRequest）。用通俗的话讲，就是这个事件会监听处理别的地方触发的特定事件。

- 语法：

```js
addEventListener(type, listener);
```

*type通常指监听的类型，而listener就是处理函数*。下面是一些常见的监听操作

```js
// html生命周期
window.addEventListener('load', fn)

// 窗口变化
window.addEventListener('resize', fn)
window.addEventListener('scroll', fn)

// 键盘操作
window.addEventListener('keydown', fn)
window.addEventListener('keyup', fn)

......
```

那么假如我要监听一个button的触发事件，会怎么样呢？HTML中通常会存在这样的代码：

```html
<button id="myBtn">Click me</button>
```

那么在js中，如果我们要监听，就要通过以下的方法：

```js
const btn = document.getElemetnById('myBtn');
btn.addEventListener('click', function (event) {
	...
})

```

所以function里面就是我们想要的处理逻辑了。所以我们在进行分析的时候，可以先找到对应的元素，然后再通过getElementById找到对象，就可以分析了。
## 表单
- HTML 表单用于收集用户的输入信息。
- HTML 表单表示文档中的一个区域，此区域包含交互控件，将用户收集到的信息发送到 Web 服务器。
- HTML 表单通常包含各种输入字段、复选框、单选按钮、下拉列表等元素。

以下是一个简单的HTML表单的例子：
- `<form>` 元素用于创建表单，`action` 属性定义了表单数据提交的目标 URL，`method` 属性定义了提交数据的 HTTP 方法（这里使用的是 "post"）。
- `<label>` 元素用于为表单元素添加标签，提高可访问性。
- `<input>` 元素是最常用的表单元素之一，它可以创建文本输入框、密码框、单选按钮、复选框等。`type` 属性定义了输入框的类型，`id` 属性用于关联 `<label>` 元素，`name` 属性用于标识表单字段。
- `<select>` 元素用于创建下拉列表，而 `<option>` 元素用于定义下拉列表中的选项。

这里是一个表单的例子：

```html
<form action="/" method="post">
    <!-- 文本输入框 -->
    <label for="name">用户名:</label>
    <input type="text" id="name" name="name" required>

    <br>

    <!-- 密码输入框 -->
    <label for="password">密码:</label>
    <input type="password" id="password" name="password" required>

    <br>

    <!-- 单选按钮 -->
    <label>性别:</label>
    <input type="radio" id="male" name="gender" value="male" checked>
    <label for="male">男</label>
    <input type="radio" id="female" name="gender" value="female">
    <label for="female">女</label>

    <br>

    <!-- 复选框 -->
    <input type="checkbox" id="subscribe" name="subscribe" checked>
    <label for="subscribe">订阅推送信息</label>

    <br>

    <!-- 下拉列表 -->
    <label for="country">国家:</label>
    <select id="country" name="country">
        <option value="cn">CN</option>
        <option value="usa">USA</option>
        <option value="uk">UK</option>
    </select>

    <br>

    <!-- 提交按钮 -->
    <input type="submit" value="提交">
</form>
```

通常来说，用户名、密码等需要上传的数据都会在表单中定义。这样我们又有了一种查找关键数据的地方。

```html
<button 
  type="submit" 
  id="login-btn"
  class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 px-4 rounded-lg btn-hover flex items-center justify-center"
  >
```

如果button存在这样的属性*type = "submit"*, 那么js中可能就会有这样处理表单的逻辑。

```js
loginForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  // ...登录逻辑
});
```