---
profileName: zhugeshi8@gmail.com
postId: "40"
postType: post
categories:
  - 1
---
时隔这么久,终于断断续续的把这道题看完了.
不得不说浙大的✌水平还是太高了.做的那叫一个痛苦(也有可能是我太菜的原因:)

# 初见
怎么借助工具拿到汇编这里就不赘述了,网上许多WP都有写了
也可以参考阿里云CTF的一道题目

这里附上链接[阿里云CTF2025 Writeup - 星盟安全团队](https://blog.xmcve.com/2025/02/25/%E9%98%BF%E9%87%8C%E4%BA%91CTF2025-Writeup/#title-10)

```cpp
int __fastcall main(int argc, const char **argv, const char **envp)
{
  int v3; // ebx
  char v5[512]; // [rsp+0h] [rbp-8C0h] BYREF
  unsigned __int8 *v6; // [rsp+200h] [rbp-6C0h] BYREF
  unsigned __int8 *v7; // [rsp+208h] [rbp-6B8h] BYREF
  char v8[1024]; // [rsp+210h] [rbp-6B0h] BYREF
  char v9[4]; // [rsp+610h] [rbp-2B0h] BYREF
  int v10; // [rsp+614h] [rbp-2ACh]
  int v11; // [rsp+618h] [rbp-2A8h]
  __int16 v12; // [rsp+61Eh] [rbp-2A2h]
  int v13; // [rsp+620h] [rbp-2A0h]
  char v14[14]; // [rsp+642h] [rbp-27Eh] BYREF
  char v15[256]; // [rsp+650h] [rbp-270h] BYREF
  __int64 v16; // [rsp+750h] [rbp-170h] BYREF
  __int64 v17_blockdim_x; // [rsp+858h] [rbp-68h] BYREF
  unsigned int v18; // [rsp+860h] [rbp-60h]
  __int64 v19_griddim_x; // [rsp+864h] [rbp-5Ch] BYREF
  unsigned int v20; // [rsp+86Ch] [rbp-54h]
  __int64 v21; // [rsp+870h] [rbp-50h] BYREF
  unsigned int v22; // [rsp+878h] [rbp-48h]
  __int64 v23; // [rsp+87Ch] [rbp-44h] BYREF
  unsigned int v24; // [rsp+884h] [rbp-3Ch]
  __int64 v25; // [rsp+888h] [rbp-38h] BYREF
  unsigned int v26; // [rsp+890h] [rbp-30h]
  __int64 v27; // [rsp+894h] [rbp-2Ch] BYREF
  unsigned int v28; // [rsp+89Ch] [rbp-24h]
  char *v29; // [rsp+8A0h] [rbp-20h]
  void *ptr; // [rsp+8A8h] [rbp-18h]

  std::ifstream::basic_ifstream(v15, "flag.bmp", 4LL);// 读取名为 flag.bmp 的文件（二进制模式）
  if ( (unsigned __int8)std::ios::operator!(&v16) )
  {
    v3 = -1;
  }
  else
  {
    std::istream::read((std::istream *)v15, v14, 14LL);// 读取 BMP 文件的前 14 字节（文件头）和接下来的 40 字节（信息头）。
    std::istream::read((std::istream *)v15, v9, 40LL);
    if ( v10 == 256 )                           // 验证关键字段
    {
      if ( v11 == 256 )
      {
        if ( v12 == 8 )
        {
          if ( v13 )
          {
            v3 = -1;
          }
          else
          {
            std::istream::read((std::istream *)v15, v8, 1024LL);// // 读取调色板
            ptr = malloc(0x10000uLL);
            v29 = (char *)malloc(0x10000uLL);   // 
                                                // 
                                                // 
            cudaMemcpyToSymbol<unsigned char [256]>(&cuda_sbox, &sbox, 256LL, 0LL, 1LL);
            cudaMemcpyToSymbol<unsigned char [256]>(&cuda_tbox, &tbox, 256LL, 0LL, 1LL);
            cudaMemcpyToSymbol<float [256]>(&cuda_motion, &motion, 1024LL, 0LL, 1LL);// 
                                                // 
                                                // 
            cudaMalloc<unsigned char>(&v7, 0x10000LL);
            cudaMalloc<unsigned char>(&v6, 0x10000LL);// 
                                                // 
                                                // 
                                                // 
            std::istream::read((std::istream *)v15, (char *)ptr, 0x10000LL);// 读取图像像素数据
            std::ifstream::close(v15);
            cudaMemcpy(v7, ptr, 0x10000LL, 1LL);// 将图像数据传输到 GPU
                                                // 
                                                // 
                                                // 
            dim3::dim3((dim3 *)&v17_blockdim_x, 256, 1, 1);
            dim3::dim3((dim3 *)&v19_griddim_x, 256, 1, 1);
            if ( !(unsigned int)_cudaPushCallConfiguration(v19_griddim_x, v20, v17_blockdim_x, v18, 0LL, 0LL) )
              Layer1(v7, v6);                   // 前一个参数是输入，后一个参数是输出
            cudaDeviceSynchronize();
            dim3::dim3((dim3 *)&v21, 256, 1, 1);
            dim3::dim3((dim3 *)&v23, 256, 1, 1);// 
                                                // 
                                                // 
                                                // 
            if ( !(unsigned int)_cudaPushCallConfiguration(v23, v24, v21, v22, 0LL, 0LL) )
              Layer2(v6, v7);
            cudaDeviceSynchronize();
            dim3::dim3((dim3 *)&v25, 256, 1, 1);
            dim3::dim3((dim3 *)&v27, 256, 1, 1);// 
                                                // 
                                                // 
                                                // 
            if ( !(unsigned int)_cudaPushCallConfiguration(v27, v28, v25, v26, 0LL, 0LL) )
              Layer3(v7, v6);
            cudaDeviceSynchronize();
            cudaMemcpy(v29, v6, 0x10000LL, 2LL);// 保存结果
                                                // 
                                                // 
                                                // 
            std::ofstream::basic_ofstream(v5, "deep_flag.bmp", 4LL);// 生成新图片
            std::ostream::write((std::ostream *)v5, v14, 14LL);
            std::ostream::write((std::ostream *)v5, v9, 40LL);
            std::ostream::write((std::ostream *)v5, v8, 1024LL);
            std::ostream::write((std::ostream *)v5, v29, 0x10000LL);
            std::ofstream::close(v5);
            free(ptr);
            free(v29);
            cudaFree(v7);
            cudaFree(v6);
            v3 = 0;
            std::ofstream::~ofstream(v5);
          }
        }
        else
        {
          v3 = -1;
        }
      }
      else
      {
        v3 = -1;
      }
    }
    else
    {
      v3 = -1;
    }
  }
  std::ifstream::~ifstream(v15);
  return v3;
}
```

程序的逻辑比较简单,重要的是里面的3个Layer函数,使用工具dump出汇编代码并还原可以得到

```cpp
#include "cuda_runtime.h"
#include "device_launch_parameters.h"
#include <iostream>

__constant__ uint8_t cuda_sbox[256];
__constant__ uint8_t cuda_tbox[256];
__constant__ float cuda_motion[256];

__global__ void Layer1(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int bdim = blockDim.x;
    
    if (tid >= 241 || bid >= 241)
        return;

    float sum = 0.f;
    for (int i = 0; i < 16; i++)
    {
        for (int j = 0; j < 16; j++)
        {
            int Index = (i + bid) * bdim + (tid + j);
            sum += cuda_motion[240 - (i * 16) + j] * (float)(Input[Index]);
        }
    }

    Output[bid * bdim + tid] = (uint8_t)(sum);
}

__global__ void Layer2(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int bdim = 256;

    uint8_t Value = Input[bid * 256 + tid];
    int Index = 256 * cuda_sbox[tid] + cuda_sbox[bid];
    Output[Index] = Value;
}
/*
for block in range(256):
    for thread in range(256):
        output[sbox[thread] * 256 + sbox[block]] = input[block * 256 + thread]
*/

__global__ void Layer3(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x; //可以理解为列号
    int bid = blockIdx.x; //可以理解为行号
    int bdim = blockDim.x; //256

    int CurIndex = bdim * bid + tid; //当前索引

    Input[CurIndex] ^= tid | bid;

    __syncthreads(); //线程同步

    if ((CurIndex & 7) == 0) //每 8 个线程中的第一个线程执行这段代码（即 CurIndex 是 8 的倍数的线程）
    {
        uint32_t v0 = *(uint32_t*)(Input + CurIndex); //图片大小是256
        uint32_t sum = 1786956040;
        for (int i = 0; i < 3238567; i++)
        {
            v1 += ((v0 << 4) + 1386807340) ^ ((v0 >> 5) + 2007053320) ^ (v0 + sum);
            v0 -= ((v1 << 4) + 621668851) ^ ((v1 >> 5) - 862448841) ^ (v1 + sum);
            sum += -1708609273;
        }
        *(uint32_t*)(Input + CurIndex) = v0;
        *(uint32_t*)(Input + CurIndex + 4) = v1;
    }
    __syncthreads();

    Input[CurIndex] ^= bid & tid;

    __syncthreads();

    uint8_t tmp = cuda_sbox[tid]; //char
    uint16_t v = 0;

    for (int i = 0; i < 256; i++)
    {
        v += cuda_tbox[tmp] * Input[bid * bdim + i];
        tmp = tmp * 5 + 17; //tmp(char)也就是大小正好0-255，tmpᵢ₊₁ = tmpᵢ * 5 + 17 mod 256
    }
/*
    for block in range(256):
        for thread in range(256):
            tmp = sbox[thread] #也就是会有256个tmp的初始值
            v = 0
            for i in range(256):
                v += tbox[tmp] * b_dat[256 * block + i] 
                tmp = (tmp * 5 + 17) & 0xFF
*/
    
    for (int i = 8; i < 4137823; i++)
    {
        uint32_t tmp1 = (v << 3) | ((v & 224) >> 5);
        int tmp2 = tmp1 * 13 + (tid ^ bid);
        v = cuda_sbox[(cuda_tbox[i] ^ tmp2)];
    }
    /*
    for block in range(256):
    for thread in range(256):
        sbox = sbox_ori.copy()
        ttl = 0
        for rounds in range(256):
            ttl += tbox[sbox[thread]] * b_dat[256 * block + rounds]
            sbox[thread] = (sbox[thread] * 5 + 17) & 0xFF
        for cycle in range(8, 4137823):
            ttl = sbox[tbox[cycle & 0xFF] ^ ((((ttl & 224) >> 5) | (ttl << 3)) * 13 + (block ^ thread)) & 0xFF]
        final[block * 256 + thread] = ttl
    */

    Output[CurIndex] = (uint8_t)v;
}
```

# REVERSE
## Layer3部分
```cpp
__global__ void Layer3(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x; //可以理解为列号
    int bid = blockIdx.x; //可以理解为行号
    int bdim = blockDim.x; //256

    int CurIndex = bdim * bid + tid; //当前索引

    Input[CurIndex] ^= tid | bid;

    __syncthreads(); //线程同步

    if ((CurIndex & 7) == 0) //每 8 个线程中的第一个线程执行这段代码（即 CurIndex 是 8 的倍数的线程）
    {
        uint32_t v0 = *(uint32_t*)(Input + CurIndex); //图片大小是256
        uint32_t sum = 1786956040;
        for (int i = 0; i < 3238567; i++)
        {
            v1 += ((v0 << 4) + 1386807340) ^ ((v0 >> 5) + 2007053320) ^ (v0 + sum);
            v0 -= ((v1 << 4) + 621668851) ^ ((v1 >> 5) - 862448841) ^ (v1 + sum);
            sum += -1708609273;
        }
        *(uint32_t*)(Input + CurIndex) = v0;
        *(uint32_t*)(Input + CurIndex + 4) = v1;
    }
    __syncthreads();

    Input[CurIndex] ^= bid & tid;

    __syncthreads();

    uint8_t tmp = cuda_sbox[tid]; //char
    uint16_t v = 0;

    for (int i = 0; i < 256; i++)
    {
        v += cuda_tbox[tmp] * Input[bid * bdim + i];
        tmp = tmp * 5 + 17; //tmp(char)也就是大小正好0-255，tmpᵢ₊₁ = tmpᵢ * 5 + 17 mod 256
    }
/*
    for block in range(256):
        for thread in range(256):
            tmp = sbox[thread] #也就是会有256个tmp的初始值
            v = 0
            for i in range(256):
                v += tbox[tmp] * b_dat[256 * block + i] 
                tmp = (tmp * 5 + 17) & 0xFF
*/
    
    for (int i = 8; i < 4137823; i++)
    {
        uint32_t tmp1 = (v << 3) | ((v & 224) >> 5);
        int tmp2 = tmp1 * 13 + (tid ^ bid);
        v = cuda_sbox[(cuda_tbox[i] ^ tmp2)];
    }
    /*
    for block in range(256):
    for thread in range(256):
        sbox = sbox_ori.copy()
        ttl = 0
        for rounds in range(256):
            ttl += tbox[sbox[thread]] * b_dat[256 * block + rounds]
            sbox[thread] = (sbox[thread] * 5 + 17) & 0xFF
        for cycle in range(8, 4137823):
            ttl = sbox[tbox[cycle & 0xFF] ^ ((((ttl & 224) >> 5) | (ttl << 3)) * 13 + (block ^ thread)) & 0xFF]
        final[block * 256 + thread] = ttl
    */

    Output[CurIndex] = (uint8_t)v;
}
```

### Layer3_part1分析：
我们要求的过程
Output[CurIndex]-->v-->tmp2-->tmp1-->v 中间有很多次循环

cuda_sbox[a] = v
那我们对v求逆索引就是
cuda_invsbox[v] = a

a = cuda_tbox[i] ^ tmp2

现在v = cuda_tbox[i] ^ tmp2
得到tmp2 = v ^ cuda_tbox[i]

现在求tmp1
正向代码：tmp2 = tmp1 * 13 + (tid ^ bid);
逆向代码：tmp1 = ( tmp2 - (tid ^ bid) ) * 0xc5
注意：
由于这里是二进制乘除法，不能直接使用除法来求tmp1，必须乘上13的逆元，并且保留int大小才行
例如：
0x6b * 0xc5  	== 0x57
0x57 * 13     	== 0x6b


现在求v
正向代码：uint32_t tmp1 = (v << 3) | ((v & 224) >> 5);也就是交换前三个字节和后五个字节的位置
逆向代码：v = (tmp1 >> 3) | (tmp1 << 5);我们变回来就好了

最后我们能求得上一步得出的v

### Layer3_part2分析：
还原算法,通过约束求解,我们可以爆破得到原来的input

加密的算法:
```cpp
uint8_t tmp = cuda_sbox[tid]; //char
uint16_t v = 0;

for (int i = 0; i < 256; i++)
    {
        v += cuda_tbox[tmp] * Input[bid * bdim + i];
        tmp = tmp * 5 + 17; //tmp(char)也就是大小正好0-255，tmpᵢ₊₁ = tmpᵢ * 5 + 17 mod 256
    }
/*
for block in range(256):
    for thread in range(256):
        tmp = sbox[thread] #也就是会有256个tmp的初始     				v = 0
        for i in range(256):
            v += tbox[tmp] * b_dat[256 * block + i] 
            tmp = (tmp * 5 + 17) & 0xFF
*/
```
还原的算法:
```python
def solve_input(vArray,Size): # vArray 就是我们上一步求解出来的256*256的v数组
    s = Solver()

    Input = [[BitVec(f'input_{i}_{j}', 8) for j in range(256)] for i in range(Size)]

    for bid in range(Size):
        for tid in range(256):
            tmp = sbox[tid]
            sum = 0
            for i in range(256):
                sum += (tbox[tmp&0xff] * Input[bid][i])&0xffff
                tmp = (tmp*5+17)&0xff

            s.add(sum == vArray[bid*256+tid])

    if s.check() == sat: # 有解
        model = s.model()
        result = [[model.evaluate(Input[i][j]).as_long() 
                  for j in range(256)] 
                  for i in range(Size)] # 遍历模型,返回二维input数组
        return result
    else:
        return None
    
num = int(sys.argv[1]) # 这里是为了将原来的数据分为16块,通过多线程的方式加速求解

with open(r'Steg2' , 'rb') as f: # 读取原文件
    data = f.read(0x10000)

with open(r'Steg3_part'+str(num),'wb') as out_f: 
    start = num * 16 * 256
    print('Running...')
    for i in range(16):
        block = data[start + i * 256 : start + i * 256 + 256 * 1]
        In_ = [b for b in block]
        
        result = solve_input(In_, 1)

        if result:
            for row in result:
                out_f.write(bytes(row))
        
        print('Finished ' + str(i) + ' block')
    print('Finished all.')
```
### Layer3_part3分析:
这个就是一个简单的TEA算法,我们直接逆向就可以得到

## Layer2部分
加密算法:
```cpp
__global__ void Layer2(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int bdim = blockDim.x; //256

    uint8_t Value = Input[bid * bdim + tid];
    int Index = 256 * cuda_sbox[tid] + cuda_sbox[bid];
    Output[256 * cuda_sbox[tid] + cuda_sbox[bid]] = Value;
}
```

cuda_sbox[tid]可以视作tid
cuda_sbox[bid]可以视作bid
也就是
tid = cuda_sbox[tid]
bid = cuda_sbox[bid]

又由于cuda_invsbox[cuda_sbox[tid]] == tid
对Output的tid与bid求逆,可以得到原来的Input的tid和bid的值
我们再把数值放回原来的位置就可以了


解密算法:
```cpp
__global__ void Re_Layer2(uint8_t* Input, uint8_t* Output)
{
    int tid = threadIdx.x;
    int bid = blockIdx.x;
    int bdim = blockDim.x;

    int oTid = cuda_invsbox[bid]; //这里使用sbox逆索引表求出了
    int oBid = cuda_invsbox[tid];

    uint8_t Value = Input[bid * 256 + tid];

    Output[oBid * bdim + oTid] = Value;
}
```

## Layer1部分
到这一步,我们已经可以复原出大概模糊的图像了,接下来就是反卷积处理,可以通过代码重建近似输入就可以得到可以看清flag的图像了.

# 补充
## 什么是卷积
卷积就是把[卷积核](https://so.csdn.net/so/search?q=%E5%8D%B7%E7%A7%AF%E6%A0%B8&spm=1001.2101.3001.7020)放在输入上进行滑窗，将当前卷积核覆盖范围内的输入与卷积核相乘，值进行累加，得到当前位置的输出，其本质在于融合多个像素值的信息输出一个像素值，本质上是下采样的，所以输出的大小必然小于输入的大小，如下图所示：

![](https://pic1.imgdb.cn/item/68317aee58cb8da5c80b8e1d.png)
## 什么是反卷积
反卷积和转置卷积都是一个意思，所谓的反卷积，就是卷积的逆操作，我们将上图的卷积看成是输入通过卷积核的透视，那么反卷积就可以看成输出通过卷积核的透视，具体如下图所示：
![](https://pic1.imgdb.cn/item/68317b5a58cb8da5c80b8e45.png)

比如左上角的图，将输出的55按照绿色的线的逆方向投影回去，可以得到
`[[55,110,55],[110,55,110],[55,55,110]]的结果；`  
我们将得到的四张特征图进行叠加（重合的地方其值相加），可以得到下图：

![](https://pic1.imgdb.cn/item/68317b9658cb8da5c80b8e6d.png)

最终我们得到的特征图与卷积输入的特征图值的大小并不相同，说明卷积和反卷积并不是完全对等的可逆操作（因为采用相同的卷积核，卷积和反卷积得到的输入输出不同），也就是`反卷积只能恢复尺寸，不能恢复数值`所以我们用代码恢复的只是一个较为模糊的图像,并不能完全复原

![](https://pic1.imgdb.cn/item/68317c4558cb8da5c80b8ea2.png)