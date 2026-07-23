---
profileName: zhugeshi8@gmail.com
postId: "48"
postType: post
categories:
  - 1
---
# 相关博客
[python逆向总结-先知社区](https://xz.aliyun.com/news/12245)

# python运行原理
Python是解释型语言，没有严格意义上的编译和汇编过程。但是一般可以认为编写好的python源文件，由python解释器翻译成以.pyc为结尾的字节码文件。pyc文件是二进制文件，可以由python虚拟机直接运行。

# python代码运行机制
1. Python.exe调用XX.py(源码)，解释并运行。
2. Python.exe调用XX.pyc(字节码)，解释并运行。
3. Python.exe调用XX.pyd(机器码)，调用运行。
4. 如果有依赖的库，根据上面三种情况调用运行。

# .pyc
.pyc：python编译后的二进制文件，是.py文件经过编译产生的字节码，pyc文件是可以由python虚拟机直接执行的程序（PyCodeObject对象在硬盘上的保存形式）。
pyc文件**仅**在由另一个.py文件或模块导入时从.py文件创建（**import**）。触发 pyc 文件生成不仅可以通过 import，还可以通过 py_compile 模块手动生成。
pyc文件会加快程序的**加载速度**，而不会加快程序的实际执行速度。

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20250917190601.png)

pyc文件一般由3个部分组成:
1. Magic num：标识此pyc的版本信息, 不同的版本的 Magic 都在 `Python/import.c` 内定义
2. 文件创建时间：UNIX时间戳（从1970.1.1开始计数秒数）
3. 序列化了的 PyCodeObject：此结构在 `Include/code.h` 内定义，序列化方法在 `Python/marshal.c` 内定义

# .pyd
.pyd文件类型是特定于Windows操作系统类平台的，是一个动态链接库，它包含一个或一组Python模块，由其他Python代码调用。要创建.pyd文件，需要创建一个名为example.pyd的模块。在这个模块中，需要创建一个名为PyInit_example()的函数。当程序调用这个库时，它们需要调用import foo, PyInit_example()函数将运行。

该文件可以直接用ida进行静态逆向分析.

# .pyc反编译
## uncompyle6
适用于python 1.0 - 3.8 版本.建议创建conda虚拟环境之后使用
使用方法:
```bash
uncompyle6 -o test.py test.pyc
```

## pycdc
适用于python 3.9以及更高版本
同时存在的pycdas.exe是用于显示python字节码的工具.当pycdc本体无法使用的时候可以使用这个.

## pylingual
目前最新的反编译的一个在线网站

# python反编译

## PyInstaller
用于将.py编译成.exe

## pyinstxtractor
用于解包打包的.exe文件,可能需要对应的python版本才行

# 常用op_code指令
## 常用基本指令

| 指令               | 作用            | 示例/说明             |
| ---------------- | ------------- | ----------------- |
| **LOAD_CONST**   | 将常量压入栈顶       | `x = 10` 会加载 `10` |
| **LOAD_FAST**    | 加载局部变量到栈顶     | 在函数中访问变量          |
| **STORE_FAST**   | 将栈顶值保存到局部变量   | `a = 5`           |
| **STORE_SUBSCR** | 储存索引          | `s[i] = s[j]`     |
| **LOAD_GLOBAL**  | 从全局或内建作用域加载变量 | `print(x)`        |
| **STORE_GLOBAL** | 将值保存为全局变量     | 修改模块级变量           |
| **LOAD_NAME**    | 从当前作用域加载名称    | 模块级变量、函数          |
| **STORE_NAME**   | 保存值到当前作用域     | `y = 20`          |
## 算数与逻辑
| K指令                      | 作用   | 示例/说明                  |
| ------------------------ | ---- | ---------------------- |
| **KBINARY_ADD**          | 加法运算 | `a + b`                |
| **KKKKBINARY_SUBTRACT**  | 减法运算 | `a - b`                |
| **KKBINARY_MULTIPLY**    | 乘法运算 | `a * b`                |
| **KKBINARY_TRUE_DIVIDE** | 真除法  | `a / b`                |
| **KBINARY_FLOOR_DIVIDE** | 地板除  | `a // b`               |
| **BINARY_MODULO**        | 取模运算 | `a % b`                |
| **BINARY_SUBSCR**        | 取索引  | `a[b]`                 |
| **BINARY_POWER**         | 幂运算  | `a ** b`               |
| **INPLACE_ADD**          | 加法运算 | `a += b`               |
| **UNARY_NEGATIVE**       | 取负数  | `-x`                   |
| **UNARY_NOT**            | 布尔取反 | `not x`                |
| **COMPARE_OP**           | 比较操作 | `<, >, ==, !=, in, is` |
## 控制流
| 指令                    | 作用            | 示例/说明       |
| --------------------- | ------------- | ----------- |
| **POP_JUMP_IF_FALSE** | 若栈顶为 False，跳转 | `if not x:` |
| **POP_JUMP_IF_TRUE**  | 若栈顶为 True，跳转  | `if x:`     |
| **JUMP_FORWARD**      | 无条件向前跳转       | 循环跳转        |
| **JUMP_ABSOLUTE**     | 无条件绝对跳转       | 跳到指定指令      |
| **RETURN_VALUE**      | 返回栈顶值并结束函数    | `return x`  |
## 函数与调用
| 指令                | 作用       | 示例/说明         |
| ----------------- | -------- | ------------- |
| **CALL_FUNCTION** | 调用函数     | `f(a, b)`     |
| **CALL_METHOD**   | 调用对象方法   | `obj.m()`     |
| **MAKE_FUNCTION** | 创建函数对象   | 定义 `def f():` |
| **LOAD_CLOSURE**  | 加载闭包变量   | 内嵌函数          |
| **MAKE_CLOSURE**  | 创建带闭包的函数 | lambda / 内部函数 |
## 栈操作
| 指令            | 作用       | 示例/说明     |
| ------------- | -------- | --------- |
| **POP_TOP**   | 弹出栈顶丢弃   | 语句末尾不返回   |
| **DUP_TOP**   | 复制栈顶元素   | 栈操作优化     |
| **ROT_TWO**   | 交换栈顶两个元素 | (a, b) 互换 |
| **ROT_THREE** | 旋转栈顶三个元素 | 栈指令优化     |
## 循环与迭代
| 指令           | 作用     | 示例/说明            |
| ------------ | ------ | ---------------- |
| **GET_ITER** | 获取迭代器  | `for x in y:`    |
| **FOR_ITER** | 从迭代器取值 | `next(iterator)` |
## 模块导入
| 指令              | 作用    | 示例/说明                   |
| --------------- | ----- | ----------------------- |
| **IMPORT_NAME** | 导入模块  | `import math`           |
| **IMPORT_FROM** | 从模块导入 | `from math import sqrt` |
## 对象与属性
| 指令              | 作用               | 示例/说明       |
| --------------- | ---------------- | ----------- |
| **LOAD_ATTR**   | 加载对象属性           | `obj.x`     |
| **STORE_ATTR**  | 设置对象属性           | `obj.x = 1` |
| **DELETE_ATTR** | 删除对象属性           | `del obj.x` |
| **BUILD_LIST**  | 创建列表             | `[1, 2]`    |
| **BUILD_TUPLE** | 创建元组             | `(1, 2)`    |
| **BUILD_SET**   | 创建集合             | `{1, 2}`    |
| **BUILD_MAP**   | 创建字典             | `{'a': 1}`  |
| **LOAD_METHOD** | 加载方法（Python3.7+） | `obj.m()`   |
# 待补充
- python虚拟环境的搭建
- Conda or UV ?
