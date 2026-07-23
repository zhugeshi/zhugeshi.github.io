---
profileName: zhugeshi8@gmail.com
postId: "54"
postType: post
categories:
  - 1
---
# 修改UPX头 
标准的upx头在010editor中可以看到是

![image.png|700](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251105191245.png)
## 参考例题
- 浙江省第七届省赛Midre: Windows中的特征码.

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251105191446.png)

原来的程序修改了UPX的特征为DAS,修改回去就可以直接脱壳了(也可以直接通过esp手脱,如果没有加上反调试的话)

- uuppxx: Linux中的特征码,在程序的末尾

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251105203611.png)

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251105203642.png)

修改后就可以直接脱壳了
### 补充
还有一些别的修改,感觉太逆天了没什么意思就不放上来了.
可以参考链接: https://www.cnblogs.com/Un1corn/p/18442445 这个师傅总结的非常详细
# 手脱 Linux 下的 UPX 壳
参考链接: https://airrcat.github.io/2024/08/30/UPX-Linux-手动动态脱壳（含一魔改壳实例）%2f