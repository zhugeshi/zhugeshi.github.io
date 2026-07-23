# Cache 的工作原理
![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105184546.png)

实际上cache集成在cpu中，用SRAM实现，具有极快的读速度，但是具有较高的成本。

**两个概念**：
*空间局部性*：在最近的未来要用到的信息(指令和数据)，很可能与现在正在使用的信息在存储空间上是邻近的
*时间局部性*：在最近的未来要用到的信息，很可能是现在正在使用的信息

基于局部性原理，不难想到，可以把CPU目前访问的地址“周围”的部分数据放到Cache中
# 性能分析
![image.png|400](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105185016.png)

- 同时访问Cach和主存
- 先访问Cache再访问主存

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105185311.png)

可以通过代码页的方式讲储存空间分块，便于数据拷贝和划分。通常大小为1KB

**注意**：每次被访问的主存块，定会被立即调入Cache
# Cache 和主存的映射方式
- 全相联映射
- 直接映射
- 组相联映射
## 全相联映射
![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105191914.png)

- 有效位
- cache标记位：标记住映射的主存块号
- 行长表示Cache和主存的每一行对应的大小
## 直接映射
![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105192550.png)

相当于只取主存块的末尾几位
例子：
- Cache格数为$2^3$，则取主存块号的后三位

- 标记只保存块号的前19位，后三位由Cache的编号转成
## 组相联映射
![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20260105193053.png)

标记根据分组决定
# Cache 替换算法
## 随机算法（RAND）
随机选择一块替换
## 先进先出算法（FIFO, First In First Out）
存在抖动现象
## 近期最少使用算法（LRU，Least Recently Used）