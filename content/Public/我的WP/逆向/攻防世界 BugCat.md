---
profileName: zhugeshi8@gmail.com
postId: "26"
postType: post
categories:
  - 1
---
# 程序分析
首先查一下壳

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015145429.png)

显示有类似upx的壳,所以我们第一步先用xdbg打开分析一下

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015145707.png)

可以在开头看到很明显的pushad标志,所以我们接下来尝试通过esp脱壳法脱壳
我们先单步运行一步,然后记录当前的esp的值

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015145910.png)

接着在指令中输入`bph esp, r, 4`打下硬件断点,然后运行程序
但是我们很快发现触发了异常,我们接着运行,发现程序一直断在这个异常的地方.
又因为我们正常运行程序是没有问题的,所以怀疑是存在反调试触发了异常.

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015150633.png)

我们回到开始的地方,开始一步步往下跟踪,跳过所有向上跳转的地方,一直来到这个位置.
根据旁边的注释信息,很容易发现这里是获取了Kernel32.dll的模块基址,开始遍历导入名称表动态获得API的位置.
但是我们接着运行的时候,就发现异常再次触发了.

可是至今为止,我们都没有发现任何反调试api,那么问题一定就出现在main函数之前了,猜测是TLS回调函数中使用了反调试的手段.

我们打开ida定位,果不其然发现了TLS回调函数.
同时还发现了很多花指令混淆,我们先动调分析.

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015151229.png)

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251015151320.png)

分析一下动调后得到的汇编.

```c
CAT1:0040A1FD                 cmp     byte ptr [eax], 0CCh
CAT1:0040A200                 jmp     short loc_40A204 ; 如果没有检测到断点,跳转
CAT1:0040A202 ; ---------------------------------------------------------------------------
CAT1:0040A202 ; ; patched 0x2
CAT1:0040A202                 nop
CAT1:0040A203                 nop
CAT1:0040A204
CAT1:0040A204 loc_40A204:                             ; CODE XREF: CAT1:0040A200↑j
CAT1:0040A204                 jnz     short locret_40A22E ; Keypatch modified this from:
CAT1:0040A204                                         ;   jnz short locret_40A22E
CAT1:0040A206 ; ---------------------------------------------------------------------------
CAT1:0040A206                 call    $+5
CAT1:0040A20B                 clc
CAT1:0040A20C                 jnb     short loc_40A211
```

结合上下文,可以发现这个函数会获得pe的头部并且检测是否存在0xcc(int3断点)
如果存在,就会触发一段函数向代码段写入数据,自然就会触发异常了.

```c
CAT1:0040A204                 jnz     short locret_40A22E ; Keypatch modified this from:
```

所以我们直接将这里的jnz patch成jmp就可以绕过这个反调试了.
但是我们接下来动调的时候又进到沟槽的反调试了,网上的一篇博客说没有遇到反调试,我估计是开了反调试插件忘关了(雾