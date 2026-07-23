---
profileName: zhugeshi8@gmail.com
postId: "50"
postType: post
categories:
  - 1
---
# 碎碎念
最近越发觉得对常用加密算法的研究比较粗糙,借着完善社团文档的机会,再继续修改一下我的文章.
# 一些前置小知识
# 为什么需要加密模式
像 RC6 这样的分组加密算法，是固定长度加密的：
- RC6-32/20/16 每次只能加密 **128 bit（16 字节）** 数据块
- 如果明文超过 16 字节，就必须把数据切成块，然后用一定的“模式（mode）”来处理多块数据
- 不同模式会影响安全性和加密结果的可预测
常见的几种模式：ECB, CBC, CFB, OFB, CTR ...  
我们现主在主要看 **ECB** 和 **CBC** 两种主要的加密方式
## 二、ECB 模式
- 把明文分成一个个 16 字节的独立块
- 每个块**单独用对应的加密**（互不影响）
- 解密时也是每块独立解密
## 三、CBC 模式
**工作原理**
1. 第一个明文块 `P1` 先与一个 **初始化向量 IV（随机）** 异或，再加密
2. 每个后续块 `Pi` 在加密前先与**前一个密文块 Ci-1** 进行异或，然后再加密
3. 解密时反过来：先解密，再异或前一块密文或 IV

```cpp
加密:  C1 = E( P1 ⊕ IV )
	   Ci = E( Pi ⊕ Ci-1 )

解密:  P1 = D( C1 ) ⊕ IV
       Pi = D( Ci ) ⊕ Ci-1
```
## 四、PKCS#7 自动补齐
### 为什么要补齐
- 分组加密算法需要固定块大小，比如 RC6 一次只能加密 16 字节
- 如果明文不是 16 字节的整数倍，就需要补齐到整块大小
- 即使刚好对齐，也要补一块，以防止解密时无法判断填充长度
### PKCS#7 规则
- 假设要补 k 个字节，就用 **k** 作为填充字节的值
- 每个填充字节都相同
- 最少补 1 个字节，最多补 16 个字节

**举例**  
块大小 16 字节，明文长度 13 字节：
```cpp
明文:    [41 42 43 44 45 46 47 48 49 4A 4B 4C 4D]
填充:    [03 03 03]  ←（3 个字节，值为 03）
明文:    [41 42 43 44 45 46 47 48 49 4A 4B 4C 4D 03 03 03]
总长度:  16 字节
```
### 代码实现
```cpp
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <cstddef>
#include <cstring>

/**
 * 参数：
 *   data         - 指向原始数据的指针（不修改该指针内容）
 *   data_len     - 原始数据长度（字节）
 *   block_size   - 块大小（字节），例如 AES 为 16
 *   padded_data  - 输出参数：返回分配的填充后数据指针 （调用者负责 free）
 *   padded_len   - 输出参数：返回填充后数据的长度（字节）
 */
void pkcs7_pad(uint8_t *data, size_t data_len, size_t block_size, uint8_t **padded_data, size_t *padded_len) {
    size_t pad_len = block_size - (data_len % block_size); // 计算需要填充的字节

    *padded_len = data_len + pad_len; // 计算填充后的总长度,是16的倍数
    *padded_data = (uint8_t *)malloc(*padded_len); // 分配新的内存

    if (*padded_data == NULL) {
        fprintf(stderr, "Memory allocation failed\n");
        exit(1);
    }
    memcpy(*padded_data, data, data_len);
    for (size_t i = 0; i < pad_len; i++) {
        (*padded_data)[data_len + i] = (uint8_t)pad_len;
    }
}

int main(void) {
    uint8_t data[] = { 0x01, 0x02, 0x03, 0x04, 0x05 }; // 原始数据
    size_t block_size = 16; // 块大小
    uint8_t *padded_data = NULL;
    size_t padded_len = 0;

    pkcs7_pad(data, sizeof(data), block_size, &padded_data, &padded_len);

    printf("Original data length: %zu\n", sizeof(data));
    printf("Padded data length: %zu\n\n", padded_len);

    printf("No padded data: ");
    for (size_t i = 0; i < sizeof(data); i++) {
        printf("%02X ", data[i]);
    }
    puts("\n");

    printf("Padded data: ");
    for (size_t i = 0; i < padded_len; i++) {
        printf("%02X ", padded_data[i]);
    }

	free(padded_data);
	return 0;
}

/*
Original data length: 5
Padded data length: 16

No padded data: 01 02 03 04 05

Padded data: 01 02 03 04 05 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B 0B
*/
```
# 主要的算法介绍
## Tea/XTea/XXTea/IDEA/RC4/RC5/RC6/AES/DES/IDEA/MD5/SHA256/SHA1等加密算法

#  TEA系列算法
## 参数解析
一种简单的小型加密方式,标准轮数为32轮

- 分组大小: 64位 (8字节)
- 密钥大小: 128位 (16字节)

[https://www.cnblogs.com/zpchcbd/p/15974293.html](https://www.cnblogs.com/zpchcbd/p/15974293.html)
可以参照这篇博客，写的比较详细
## 流程分析
![image.png|300](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251102173601.png)

(红圆形十字为异或, 绿色方形十字为加)

根据算法流程图可以看出
- 将输入分成两块,称为v[0],v[1]
- 对v[1]进行三次处理(位移运算与和运算)后三者异或得到中间值
- v[0]加上中间值得到新v[0]
- 对v[1]进行相同的处理得到新v[1]
- 重复32轮

注意: 图中的Delta表示每一轮的sum值加上Delta
## 标准TEA
```cpp
#include <stdio.h>
#include <stdint.h>
#include <cstring>
//加密函数

void encrypt (uint32_t* value, uint32_t* key) {

    uint32_t v0=value[0], v1=value[1], sum=0, i;           /* set up */
    uint32_t delta=0x9e3779b9;                
    uint32_t k0=key[0], k1=key[1], k2=key[2], k3=key[3];   /* cache key */

    for (i=0; i < 32; i++) {                       /* basic cycle start */
        sum += delta;
        v0 += ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        v1 += ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
    }                                              /* end cycle */
    value[0]=v0; value[1]=v1;
}

//解密函数

void decrypt (uint32_t* value, uint32_t* key) {

    uint32_t v0=value[0], v1=value[1], sum=0xC6EF3720, i; 
    uint32_t delta=0x9e3779b9;                     
    uint32_t k0=key[0], k1=key[1], k2=key[2], k3=key[3]; 

    for (i=0; i<32; i++) {                     
        v1 -= ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
        v0 -= ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        sum -= delta;
    }                                      
    value[0]=v0; value[1]=v1;
}

int main()
{
    uint32_t key[4]={2,2,3,4};
    const char* plaintext="HelloWorld_Welcome_to_encode_!!!"; //明文

    int plaintext_len = strlen(plaintext);
    uint32_t tmp[8];

    memcpy(tmp, plaintext, 32);
    printf("Plaintext: %s\n", plaintext);

    for (int i = 0; i < 8; i += 2) {
        encrypt(&tmp[i], key);
    }

    printf("After encryption:\n");
    for (int i = 0; i < 8; i++) {
        printf("%08x ", tmp[i]);
    }

    printf("\nAfter decryption:\n");
    for (int i = 0; i < 8; i += 2) {
        decrypt(&tmp[i], key);
    }
    printf("%s\n", (char*)tmp);
    // v为要加密的数据是两个32位无符号整数(四个字节)
    // k为加密解密密钥，为4个32位无符号整数，即密钥长度为128位
    return 0;

}
/* shell output ->

Plaintext: HelloWorld_Welcome_to_encode_!!!
After encryption:
ea99cb31 4a00a721 f12d7a1a 166346d9 71d37571 78b3a20a 8143ce11 c85e323c
After decryption:
HelloWorld_Welcome_to_encode_!!!

*/
```
## XTEA算法
TEA算法的升级版,加入了更多的处理机制和操作.
### 算法解析
<img src="https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251102174853.png" width="30%">

- 同理按照左右分块
- 对右块进行一系列处理得到中间值并与左块相加
- 对左块进行相同处理
- 循环

```cpp
#include <stdint.h>
#include <stdio.h>

/* take 64 bits of data in v[0] and v[1] and 128 bits of key[0] - key[3] */

void encipher(unsigned int num_rounds, uint32_t v[2], uint32_t const key[4]) {
    unsigned int i;
    uint32_t v0 = v[0], v1 = v[1], sum = 0, delta = 0x9E3779B9;
    for (i = 0; i < num_rounds; i++) {
        v0 += (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + key[sum & 3]);
        sum += delta;
        v1 += (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + key[(sum >> 11) & 3]);
    }
    v[0] = v0;
    v[1] = v1;
}

void decipher(unsigned int num_rounds, uint32_t v[2], uint32_t const key[4]) {
    unsigned int i;
    uint32_t v0 = v[0], v1 = v[1], delta = 0x9E3779B9, sum = delta * num_rounds;  // 现在是中文
    for (i = 0; i < num_rounds; i++) {
        v1 -= (((v0 << 4) ^ (v0 >> 5)) + v0) ^ (sum + key[(sum >> 11) & 3]);
        sum -= delta;
        v0 -= (((v1 << 4) ^ (v1 >> 5)) + v1) ^ (sum + key[sum & 3]);
    }
    v[0] = v0;
    v[1] = v1;
}

int main() {
    uint32_t v[2] = {1, 2};
    uint32_t const k[4] = {2, 2, 3, 4};
    unsigned int r = 32;  // num_rounds建议取值为32
    // v为要加密的数据是两个32位无符号整数中文
    // k为加密解密密钥，为4个32位无符号整数，即密钥长度为128位
    printf("加密前原始数据：%u %u\n", v[0], v[1]);
    encipher(r, v, k);
    printf("加密后的数据：%u %u\n", v[0], v[1]);
    decipher(r, v, k);
    printf("解密后的数据：%u %u\n", v[0], v[1]);
    // 现在使用中文注释
    return 0;
}
```

## XXTEA算法
### 算法解析
![image.png|700](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251102181648.png)

```cpp
#include <stdio.h>
#include <stdint.h>
#define DELTA 0x9e3779b9
#define MX (((z>>5^y<<2) + (y>>3^z<<4)) ^ ((sum^y) + (key[(idx&3)^e] ^ z)))

/* Block TEA 加密/解密函数
 * 参数：
 *   plain_text: 待处理的数据数组
 *   length: 数组长度（32位字的个数）
 *   key: 128位密钥（4个32位字）
 */
void btea(uint32_t *plain_text, int length, uint32_t const key[4])
{
    uint32_t y, z, sum;        /* y,z: 相邻数据块; sum: 轮常量累加值 */
    unsigned idx, rounds, e;      /* p: 位置计数器; rounds: 加密轮数; e: 轮密钥选择因子 */

    /* 加密过程（至少需要2个32位字） */
    if (length > 1)
    {
        /* 计算加密轮数：基础6轮 + 根据数据长度动态调整的轮数 */
        rounds = 6 + 52/length;
        sum = 0;               /* 初始化轮常量累加值 */
        z = plain_text[length-1];  /* 获取最后一个数据块 */
        do
        {
            sum += DELTA; // sum累加
            e = (sum >> 2) & 3; // 计算e
            for (idx=0; idx<length-1; idx++)
            {
                y = plain_text[idx+1]; // 获取下一个数据块
                z = plain_text[idx] += MX; // 更新当前数据块
            }
            y = plain_text[0];
            z = plain_text[length-1] += MX;
        }
        while (--rounds);
    }
    else if (length < -1)      /* Decoding Part */
    {
        length = -length;
        rounds = 6 + 52/length;
        sum = rounds*DELTA;
        y = plain_text[0];
        do
        {
            e = (sum >> 2) & 3;
            for (idx=length-1; idx>0; idx--)
            {
                z = plain_text[idx-1];
                y = plain_text[idx] -= MX;
            }
            z = plain_text[length-1];
            y = plain_text[0] -= MX;
            sum -= DELTA;
        }
        while (--rounds);
    }
}

/* 测试主函数
 * 演示 Block TEA (XXTEA) 算法的加密和解密过程
 */
int main()
{
    /* 测试数据初始化
     * v: 待加密数据，2个32位整数
     * k: 128位密钥，4个32位整数
     * n: 数据长度参数
     *    - |n| 表示数据长度（32位字的个数）
     *    - n > 0 表示加密
     *    - n < 0 表示解密
     */
    uint32_t v[2] = {1, 2};           /* 测试数据 */
    uint32_t const k[4] = {2,2,3,4};  /* 测试密钥 */
    int n = 2;                         /* 正值表示加密 */

    printf("加密前原始数据：%u %u\n", v[0], v[1]);
    
    /* 加密过程：使用正数长度参数 */
    btea(v, n, k);
    printf("加密后的数据：%u %u\n", v[0], v[1]);
    
    /* 解密过程：使用负数长度参数 */
    btea(v, -n, k);
    printf("解密后的数据：%u %u\n", v[0], v[1]);
    
    return 0;
}
```
# RC4算法
**RC4算法是一种对称加密算法**

-  密钥大小: 可变,通过KSA拓展展得到一个256字节的状态数组
-  PRGA: 用 S 生成一个伪随机字节流，全程与密钥有关.
-  明文和生成的密钥按位异或,得到密文,解密时再异或一次即可恢复原文

```python
def KSA(key):
    """ KSA 密钥拓展 """
    S = list(range(256))
    j = 0
    for i in range(256):
        j = (j + S[i] + key[i % len(key)]) % 256
        S[i], S[j] = S[j], S[i]
    return S
 
def PRGA(S):
    """ PRGA """
    i, j = 0, 0
    while True:
        i = (i + 1) % 256
        j = (j + S[i]) % 256
        S[i], S[j] = S[j], S[i]
        K = S[(S[i] + S[j]) % 256]
        yield K
 
def RC4(key, text):
    """ RC4 加密流程 """
    S = KSA(key)
    keystream = PRGA(S)
    res = []
    for char in text:
        res.append(char ^ next(keystream))
    return bytes(res)

def main():
    # 测试
    key = b"HelloRc4!"
    plaintext = b"This is a secret message."
    print("Plaintext:", plaintext)

    # 加密
    cipher = RC4(key, plaintext)
    print("Ciphertext (hex):", cipher.hex(), end="\n")

    # 解密
    print("Decrypting...")
    decrypted = RC4(key, cipher)
    try: 
        print("Decrypted text:", decrypted.decode("utf-8"))
    except UnicodeDecodeError:
        print("Decrypted text (bytes):", decrypted)

if __name__ == "__main__":
    main()
```

```cpp
#include <stdio.h>
#include <string.h>

// RC4密钥调度算法 (KSA)
void RC4_KSA(unsigned char *key, int keyLength, unsigned char *S) {
    int i, j = 0;
    unsigned char temp;
    
    for (i = 0; i < 256; i++) {
        S[i] = i;
    }
    
    for (i = 0; i < 256; i++) {
        j = (j + S[i] + key[i % keyLength]) % 256;
        
        // 交换 S[i] 和 S[j]
        temp = S[i];
        S[i] = S[j];
        S[j] = temp;
    }
}

// RC4伪随机生成算法 (PRGA)
void RC4_PRGA(unsigned char *S, unsigned char *data, int dataLength) {
    int i = 0, j = 0, k;
    unsigned char temp;
    
    for (k = 0; k < dataLength; k++) {
        i = (i + 1) % 256;
        j = (j + S[i]) % 256;
        
        // 交换 S[i] 和 S[j]
        temp = S[i];
        S[i] = S[j];
        S[j] = temp;
        
        // 获取伪随机字节并与数据进行异或
        data[k] ^= S[(S[i] + S[j]) % 256];
    }
}

int main() {
    unsigned char key[] = "Key";  // 密钥
    unsigned char data[] = "Plaintext";  // 明文数据
    
    int keyLength = strlen((char *)key);
    int dataLength = strlen((char *)data);
    
    unsigned char S[256];  // 状态向量

    // 密钥调度算法 (KSA)
    RC4_KSA(key, keyLength, S);
    
    // 伪随机生成算法 (PRGA) 用于加密数据
    RC4_PRGA(S, data, dataLength);

    printf("Encrypted text: ");
    for (int i = 0; i < dataLength; i++) {
        printf("%02X ", data[i]);
    }
    printf("\n");

    // 解密时，直接使用相同的加密过程
    RC4_KSA(key, keyLength, S);
    RC4_PRGA(S, data, dataLength);

    printf("Decrypted text: %s\n", data);
    
    return 0;
}

```
# RC5算法
**一种分组对称加密算法**
## 参数解析
1. RC5有三个主要参数: 

```cpp
RC5-W/R/B
```

- **w**：字长（word size），常用 32（位）、也可以是 16、64
- **r**：加密轮数（rounds），常用 12 或 20
- **b**：密钥长度（bytes），取值 0~255 字节，常用 16 字节（128 位）
2. 分组大小
- **数据块大小** = `2 × w` 位
    - 如果 w = 32，则数据块大小为 **64 位（8 字节）**
    - 如果 w = 64，则数据块大小为 **128 位（16 字节）**
2. 密钥大小
- 密钥长度 **b** 可以从 0 到 255 字节可变
- 常用设置:
    - **128 位密钥（16 字节）**
    - 192 位（24 字节）
    - 256 位（32 字节）
## 算法实现
```cpp
#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>
#include <string.h>

#define WORD uint32_t
#define w 32              // 字长
#define r 12              // 轮数
#define b 16              // 密钥字节数
#define c (b / 4)         // 密钥字的个数
#define t (2 * (r + 1))   // 子密钥表的大小

#define P32 0xB7E15163
#define Q32 0x9E3779B9

WORD S[t];                // 子密钥表

// 左循环
WORD ROTL(WORD x, WORD y) {
    return (x << (y & (w - 1))) | (x >> (w - (y & (w - 1))));
}

// 右循环
WORD ROTR(WORD x, WORD y) {
    return (x >> (y & (w - 1))) | (x << (w - (y & (w - 1))));
}

// 密钥扩展
void RC5_KeySchedule(const uint8_t *key) {
    WORD L[c];
    memset(L, 0, sizeof(L));

    // 将密钥转换为 L 数组
    for (int i = b - 1; i >= 0; i--) {
        L[i / 4] = (L[i / 4] << 8) + key[i];
    }

    // 初始化 S 表
    S[0] = P32;
    for (int i = 1; i < t; i++) {
        S[i] = S[i - 1] + Q32;
    }

    // 混合 S 和 L
    WORD A = 0, B = 0;
    int i = 0, j = 0;
    for (int k = 0; k < 3 * ((t > c) ? t : c); k++) {
        A = S[i] = ROTL(S[i] + A + B, 3);
        B = L[j] = ROTL(L[j] + A + B, A + B);
        i = (i + 1) % t;
        j = (j + 1) % c;
    }
}

// 加密 64 位明文（两个 32 位字）
void RC5_Encrypt(WORD *pt, WORD *ct) {
    WORD A = pt[0] + S[0];
    WORD B = pt[1] + S[1];
    for (int i = 1; i <= r; i++) {
        A = ROTL(A ^ B, B) + S[2 * i];
        B = ROTL(B ^ A, A) + S[2 * i + 1];
    }
    ct[0] = A;
    ct[1] = B;
}

// 解密
void RC5_Decrypt(WORD *ct, WORD *pt) {
    WORD B = ct[1];
    WORD A = ct[0];
    for (int i = r; i >= 1; i--) {
        B = ROTR(B - S[2 * i + 1], A) ^ A; 
        A = ROTR(A - S[2 * i], B) ^ B;
    }
    pt[1] = B - S[1];
    pt[0] = A - S[0];
}

// 十六进制打印
void print_hex(const char *label, WORD *data) {
    printf("%s: %08X %08X\n", label, data[0], data[1]);
}

// 示例主函数
int main() {
    // 16字节密钥
    uint8_t key[b] = {
        0x91, 0x5F, 0x46, 0x19, 0xBE, 0x41, 0xB2, 0x51,
        0x63, 0x55, 0xA5, 0x01, 0x10, 0xA9, 0xCE, 0x91
    };

    WORD plaintext[2]  = { 0x12345678, 0x9ABCDEF0 };
    WORD ciphertext[2] = { 0, 0 }; // 加密缓冲区
    WORD decrypted[2]  = { 0, 0 }; // 解密缓冲区

    RC5_KeySchedule(key); // 密钥拓展,生成子密钥数组
    RC5_Encrypt(plaintext, ciphertext); // RC5加密
    RC5_Decrypt(ciphertext, decrypted); // RC5解密

    print_hex("Plaintext", plaintext);
    print_hex("Ciphertext", ciphertext);
    print_hex("Decrypted", decrypted);

    return 0;
}

```
# RC6算法
**一种分组对称加密算法**
是RC5的改进版

## 参数分析
1. RC6用一下参数表示
```cpp
RC6-w/r/b
```
- **w**：字长（word size），常用 **32 位**
- **r**：轮数（rounds），AES 竞赛版本使用 **20 轮**
- **b**：密钥长度（bytes），支持 0~255 字节
2. AES 竞赛推荐参数：
```cpp
RC6-32/20/16
```
- **w = 32 位**（每个数据字占 4 字节）
- **分组大小** = 4 × w = **128 位（16 字节）**
- **轮数 r = 20**
- **密钥长度** = 16 字节（128 位）

## 算法实现
```cpp
#include <stdio.h>
#include <stdint.h>

#define w 32                // 字长
#define r 20                // 轮数
#define b 16                // 密钥长度
#define Pw 0xB7E15163        // Magic constants for key schedule (for w=32)
#define Qw 0x9E3779B9        // Magic constants for key schedule (for w=32)

// 轮位移实现
#define ROTL(x, y) (((x) << ((y) & (w - 1))) | ((x) >> (w - ((y) & (w - 1)))))
#define ROTR(x, y) (((x) >> ((y) & (w - 1))) | ((x) << (w - ((y) & (w - 1)))))

// 子密钥数组
uint32_t S[2 * r + 4];

//--------------------------------------
// 密钥扩展函数（b字节用户密钥 -> S[] 子密钥）
//--------------------------------------
void RC6_key_schedule(uint8_t *K) {
    int i, j, s, v;
    uint32_t L[(b + 3) / 4]; // 将字节密钥转换为字数组
    uint32_t A, B;

    // Step 1: 把用户密钥K[]装入L[]，低位优先
    for (i = b - 1, L[(b + 3) / 4 - 1] = 0; i != -1; i--)
        L[i / 4] = (L[i / 4] << 8) + K[i];

    // Step 2: 初始化子密钥S[]
    S[0] = Pw;
    for (i = 1; i < 2 * r + 4; i++)
        S[i] = S[i - 1] + Qw;

    // Step 3: 混合操作
    A = B = i = j = 0;
    v = 3 * ((b + 3) / 4 > 2 * r + 4 ? (b + 3) / 4 : 2 * r + 4);
    for (s = 0; s < v; s++) {
        A = S[i] = ROTL(S[i] + A + B, 3);
        B = L[j] = ROTL(L[j] + A + B, (A + B));
        i = (i + 1) % (2 * r + 4);
        j = (j + 1) % ((b + 3) / 4);
    }
}

//--------------------------------------
// 加密函数
//--------------------------------------
void RC6_encrypt(uint32_t *pt, uint32_t *ct) {
    uint32_t A = pt[0], B = pt[1], C = pt[2], D = pt[3];
    uint32_t t, u;
    int i;

    B += S[0];
    D += S[1];
    for (i = 1; i <= r; i++) {
        t = ROTL(B * (2 * B + 1), 5);
        u = ROTL(D * (2 * D + 1), 5);
        A = ROTL(A ^ t, u) + S[2 * i];
        C = ROTL(C ^ u, t) + S[2 * i + 1];
        // Rotate registers
        {
            uint32_t tmp = A;
            A = B; B = C; C = D; D = tmp;
        }
    }
    A += S[2 * r + 2];
    C += S[2 * r + 3];
    ct[0] = A; ct[1] = B; ct[2] = C; ct[3] = D;
}

//--------------------------------------
// 解密函数
//--------------------------------------
void RC6_decrypt(uint32_t *ct, uint32_t *pt) {
    uint32_t A = ct[0], B = ct[1], C = ct[2], D = ct[3];
    uint32_t t, u;
    int i;

    C -= S[2 * r + 3];
    A -= S[2 * r + 2];
    for (i = r; i >= 1; i--) {
        // Rotate registers backward
        {
            uint32_t tmp = D;
            D = C; C = B; B = A; A = tmp;
        }
        t = ROTL(B * (2 * B + 1), 5);
        u = ROTL(D * (2 * D + 1), 5);
        C = ROTR(C - S[2 * i + 1], t) ^ u;
        A = ROTR(A - S[2 * i], u) ^ t;
    }
    D -= S[1];
    B -= S[0];
    pt[0] = A; pt[1] = B; pt[2] = C; pt[3] = D;
}

//--------------------------------------
// 测试
//--------------------------------------
int main() {
    uint8_t key[b] = {0x00,0x01,0x02,0x03,
                      0x04,0x05,0x06,0x07,
                      0x08,0x09,0x0A,0x0B,
                      0x0C,0x0D,0x0E,0x0F};
    uint32_t plaintext[4]  = {0x01234567, 0x89ABCDEF, 0xFEDCBA98, 0x76543210};
    uint32_t ciphertext[4], decrypted[4];

    RC6_key_schedule(key); // 密钥拓展
    RC6_encrypt(plaintext, ciphertext);
    RC6_decrypt(ciphertext, decrypted);

    printf("Plaintext:  %08X %08X %08X %08X\n", plaintext[0], plaintext[1], plaintext[2], plaintext[3]);
    printf("Ciphertext: %08X %08X %08X %08X\n", ciphertext[0], ciphertext[1], ciphertext[2], ciphertext[3]);
    printf("Decrypted:  %08X %08X %08X %08X\n", decrypted[0], decrypted[1], decrypted[2], decrypted[3]);

    return 0;
}

```

# AES算法
**一种对称分组加密算法**
## 参数分析
密钥长度决定了加密的回合数（rounds）。对于不同长度的密钥，回合数如下：
- 128 比特密钥：10 回合
- 192 比特密钥：12 回合
- 256 比特密钥：14 回合

参考连接: 
[高级加密标准 - 维基百科，自由的百科全书](https://zh.wikipedia.org/wiki/%E9%AB%98%E7%BA%A7%E5%8A%A0%E5%AF%86%E6%A0%87%E5%87%86)
[【AES加密算法】| AES加密过程详解| 对称加密| Rijndael-128| 密码学| 信息安全_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1i341187fK/?spm_id_from=333.337.search-card.all.click&vd_source=3fbe06963450d79eb92b1fe509cd4c79)
## 主加密流程分析
![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101173710.png)

(注意图片中的aes-128的示范)
总体流程可以总结为:
明文->初始变换(AddRoundKey)->指定轮数循环运算->最终轮变换(没有列混合)->密文

循环运算又可以分为
1. 字节代换
2. 行移位
3. 列混合
4. 轮密钥加
### 初始变换
![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101172548.png)

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101172823.png)

- 首先会读入十六个字节的数据组成4x4的矩阵
- 再和子密钥矩阵进行异或计算可以得到初始变换后的16个字节
### 字节代换
![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101173030.png)

在这个步骤中,会将上一步的16个字节通过查`sbox表得到混淆后的16个字节`
### 行移位
![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101173330.png)

对得到的4x4的矩阵,每一行进行循环位移
0行: 不移动
1行: 向左循环位移1位
2行: 向左循环位移2位
3行: 向左循环位移3位
### 列混合
注意: 是在GF($2^8$)有限域中的矩阵乘法.
对上一步的结果左乘一个`固定的矩阵`

通常固定的矩阵是:

$$
\begin{bmatrix}
02& 03 & 01 & 01 \\
01 & 02&03&01\\
01&01&02&03\\
03&01&01&02
\end{bmatrix} 
\oplus
\begin{bmatrix}
a0\\
a1\\
a2\\
a3
\end{bmatrix} 
$$
### 轮密钥加
对上一步得到的结果与一个`子密钥矩阵`异或
## 密钥拓展的流程
在aes-128中,密钥拓展会得到10个子密钥矩阵用于主要加密流程中的加密

- 如果i不是4的倍数

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101174326.png)

- 如果i是4的倍数,$W[i] = W[i-4] \oplus T(W[i-1])$
### T函数流程
1. 字循环

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101174856.png)

2. 字节代换

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101174948.png)

3. 轮常量异或,将上一轮得到的结果和Rcon[j]异或,j是轮数

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251101175704.png)

## 比赛中的魔改
	1. 修改SBOX
	2. 修改RCON轮常量
	3. 修改位移逻辑,应该不常见

## 代码实现
```cpp
/*
 * AES (Advanced Encryption Standard) 算法详解：
 * - 分组密码算法，分组长度固定为128位(16字节)
 * - 密钥长度支持128位(10轮)、192位(12轮)、256位(14轮)
 * - 每轮包含4个变换：SubBytes、ShiftRows、MixColumns、AddRoundKey
 * - 采用SPN (Substitution-Permutation Network) 结构
 *
 * 数学基础：
 * - 在GF(2^8)有限域上运算
 * - 使用不可约多项式 m(x) = x^8 + x^4 + x^3 + x + 1 (0x11B)
 * - S-box基于有限域逆元和仿射变换构造
 *
 * Build: gcc -O2 -std=c99 aes.c -o aes
 */
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <stdio.h>

/*==================== 常量表：S-box & Rcon ====================*/
/*
 * AES S-Box（FIPS-197，表4）
 * 作用：非线性替换表，提供算法的混淆特性
 * 构造原理：
 *   - 对每个字节求GF(2^8)上的乘法逆元（0x00映射到自身）
 *   - 应用仿射变换：y = A·x⁻¹ + b
 *   - 其中A是8×8矩阵，b是常数向量
 * 特性：严格雪崩效应、非线性度高等
 * ========用于密钥拓展=======
 */
static const uint8_t sbox[256] = {
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
};

/*
 * 轮常量 Rcon（只需到 14 即可）
 * 作用：在密钥扩展过程中提供非线性常数
 * 构造：Rcon[i] = x^(i-1) mod m(x)，其中m(x)=0x11B
 * 即：Rcon[1]=0x01, Rcon[2]=0x02, Rcon[3]=0x04, ...
 * 注意：Rcon[0]未使用，索引从1开始
 * ========用于密钥拓展========
 */
static const uint8_t Rcon[15] = {
  0x00, /* unused */
  0x01,0x02,0x04,0x08,0x10,0x20,0x40,0x80,0x1B,0x36,
  0x6C,0xD8,0xAB,0x4D
};

/*==================== 工具宏与上下文 ====================*/

/* AES 算法上下文结构体
 * - round_keys: 存储轮密钥的数组
 *   - 每轮需要16字节密钥
 *   - 最多需要15轮，因此总长度为 15*16=240 字节
 *   - 按轮顺序连续存储，每轮占用连续的16字节
 * - Nr: 加密轮数，取决于密钥长度
 *   - AES-128：10轮
 *   - AES-192：12轮
 *   - AES-256：14轮
 */
typedef struct {
    uint8_t round_keys[240];  /* 轮密钥数组，每轮16字节，最多15轮 */
    int Nr;                   /* 加密轮数：128位密钥=10轮, 192位=12轮, 256位=14轮 */
} aes_ctx;

/*
 * GF(2^8) 上的 xtime：乘以 2
 * 作用：在GF(2^8)有限域上计算 x * 2
 * 原理：
 *   - 左移1位相当于乘以2
 *   - 如果最高位为1（x & 0x80），需要模约减：异或不可约多项式0x1B
 *   - 否则直接返回左移结果
 * 数学：x * 2 = (x << 1) ⊕ (x₇ ? 0x1B : 0x00)
 */
static inline uint8_t xtime(uint8_t x) {
    return (uint8_t)((x << 1) ^ ((x & 0x80) ? 0x1B : 0x00));
}

/*==================== 核心变换：SubBytes / ShiftRows / MixColumns / AddRoundKey ====================*/

/* 对 state 的 16 字节逐字节过 S-box */
static inline void SubBytes(uint8_t st[16]) {
    for (int i = 0; i < 16; ++i) st[i] = sbox[st[i]];
}

/* AES 的行移位变换
 * 功能：对状态矩阵的每一行进行循环左移
 * 参数：
 *   - st[16]: 状态矩阵，按列优先顺序存储（索引 = 4*列 + 行）
 * 变换规则：
 *   - 第0行（row 0）：不移动
 *   - 第1行（row 1）：循环左移1位
 *   - 第2行（row 2）：循环左移2位
 *   - 第3行（row 3）：循环左移3位
 * 注意：这是AES加密中的关键步骤之一，用于提供扩散性
 */
static inline void ShiftRows(uint8_t st[16]) {
    uint8_t t;

    /* 第1行：1字节循环左移：索引 1,5,9,13 */
    t = st[1];
    st[1]  = st[5];
    st[5]  = st[9];
    st[9]  = st[13];
    st[13] = t;

    /* 第2行：2字节循环左移：索引 2,6,10,14 */
    t = st[2];
    st[2]  = st[10];
    st[10] = t;
    t = st[6];
    st[6]  = st[14];
    st[14] = t;

    /* 第3行：3字节循环左移：索引 3,7,11,15 */
    t = st[3];
    st[3]  = st[15];
    st[15] = st[11];
    st[11] = st[7];
    st[7]  = t;
}

/*
 * 列混淆：对每一列做 GF(2^8) 线性变换
 * 作用：在列上应用线性变换，提供算法的扩散特性
 * 数学原理：每列乘以固定矩阵 M：
 *   [02 03 01 01]   [a0]
 *   [01 02 03 01] × [a1]
 *   [01 01 02 03]   [a2]
 *   [03 01 01 02]   [a3]
 * 优化实现：使用xtime和异或运算高效计算
 * 算法步骤：
 *   1. 计算列中所有字节的异或：t = a0 ⊕ a1 ⊕ a2 ⊕ a3
 *   2. 对每字节应用：b_i = a_i ⊕ t ⊕ xtime(a_i ⊕ a_{i+1})
 *   3. 其中a4 = a0（循环）
 */
static inline void MixColumns(uint8_t st[16]) {
    for (int c = 0; c < 4; ++c) {
        uint8_t *col = &st[4*c];
        uint8_t a0 = col[0], a1 = col[1], a2 = col[2], a3 = col[3];
        uint8_t t  = (uint8_t)(a0 ^ a1 ^ a2 ^ a3);
        uint8_t u0 = a0;

        col[0] ^= t ^ xtime((uint8_t)(a0 ^ a1));
        col[1] ^= t ^ xtime((uint8_t)(a1 ^ a2));
        col[2] ^= t ^ xtime((uint8_t)(a2 ^ a3));
        col[3] ^= t ^ xtime((uint8_t)(a3 ^ u0));
    }
}

/* 加轮密钥：st[i] ^= rk[i] */
static inline void AddRoundKey(uint8_t st[16], const uint8_t *rk) {
    for (int i = 0; i < 16; ++i) st[i] ^= rk[i];
}

/*==================== Key Schedule（密钥扩展） ====================*/

/* 旋转 4 字节：a0 a1 a2 a3 -> a1 a2 a3 a0 */
static inline void RotWord(uint8_t w[4]) {
    uint8_t t = w[0];
    w[0] = w[1]; w[1] = w[2]; w[2] = w[3]; w[3] = t;
}

/* 4 字节逐字节 S-box */
static inline void SubWord(uint8_t w[4]) {
    w[0] = sbox[w[0]];
    w[1] = sbox[w[1]];
    w[2] = sbox[w[2]];
    w[3] = sbox[w[3]];
}

/* AES 密钥扩展函数 
 * 功能：根据原始密钥生成所有轮密钥
 * 参数：
 *   - ctx: AES 上下文结构体指针
 *   - key: 原始密钥数组
 *   - keybits: 密钥长度（支持128/192/256位）
 * 返回值：
 *   - 0: 成功
 *   - -1: 不支持的密钥长度
 * 说明：
 *   - 生成的轮密钥存储在 ctx->round_keys 中
 *   - 每轮需要 16 字节密钥
 *   - 密钥按轮顺序连续存储
 *   - 支持 AES-128/192/256 三种规格
 */
static int aes_init(aes_ctx *ctx, const uint8_t *key, int keybits) {
    int Nk, Nr;
    if (keybits == 128) { Nk = 4; Nr = 10; }
    else if (keybits == 192) { Nk = 6; Nr = 12; }
    else if (keybits == 256) { Nk = 8; Nr = 14; }
    else return -1;

    ctx->Nr = Nr;

    /* W 一共 Nb*(Nr+1) 个 32bit 词；Nb=4 -> 4*(Nr+1) 个词 -> (Nr+1)*16 字节 */
    const int Nb = 4;
    const int total_words = Nb * (Nr + 1);
    uint8_t *rk = ctx->round_keys;

    /* 先拷入初始密钥（Nk*4 字节） */
    for (int i = 0; i < Nk*4; ++i) rk[i] = key[i];

    int iword = Nk;          /* 已生成的词个数，从 Nk 开始 */
    int rconi = 1;           /* Rcon 索引，从 1 开始 */
    uint8_t temp[4];

    while (iword < total_words) {
        /* temp = W[i-1] */
        temp[0] = rk[4*(iword-1) + 0];
        temp[1] = rk[4*(iword-1) + 1];
        temp[2] = rk[4*(iword-1) + 2];
        temp[3] = rk[4*(iword-1) + 3];

        if (iword % Nk == 0) {
            RotWord(temp);
            SubWord(temp);
            temp[0] ^= Rcon[rconi++];
        } else if (Nk > 6 && (iword % Nk == 4)) {
            /* AES-256 额外子字节替换 */
            SubWord(temp);
        }

        /* W[i] = W[i-Nk] XOR temp */
        rk[4*iword + 0] = (uint8_t)(rk[4*(iword-Nk) + 0] ^ temp[0]);
        rk[4*iword + 1] = (uint8_t)(rk[4*(iword-Nk) + 1] ^ temp[1]);
        rk[4*iword + 2] = (uint8_t)(rk[4*(iword-Nk) + 2] ^ temp[2]);
        rk[4*iword + 3] = (uint8_t)(rk[4*(iword-Nk) + 3] ^ temp[3]);

        ++iword;
    }
    return 0;
}

/*==================== 单块加密（ECB 基元） ====================*/

/* AES 单块加密函数
 * 功能：对16字节明文块进行AES加密
 * 参数：
 *   - ctx: AES上下文结构体指针，包含轮密钥, 轮数等基本信息
 *   - in[16]: 输入明文块（16字节）
 *   - out[16]: 输出密文块（16字节）
 * 加密步骤：
 *   1. 轮0：只进行AddRoundKey
 *   2. 轮1~(Nr-1)：SubBytes、ShiftRows、MixColumns、AddRoundKey
 *   3. 最后一轮：SubBytes、ShiftRows、AddRoundKey（无MixColumns）
 * 注意：这是ECB模式的基本单元，实际使用建议采用更安全的CBC等模式
 */
static void aes_encrypt_block(const aes_ctx *ctx,
                              const uint8_t in[16],
                              uint8_t out[16]) {
    uint8_t st[16];
    memcpy(st, in, 16);

    const uint8_t *round_key = ctx->round_keys;

    /* 轮 0：AddRoundKey */
    AddRoundKey(st, round_key);
    round_key += 16;

    /* 轮 1..Nr-1 */
    for (int round = 1; round < ctx->Nr; ++round) {
        SubBytes(st);
        ShiftRows(st);
        MixColumns(st);
        AddRoundKey(st, round_key);
        round_key += 16;
    }

    /* 最后一轮：无 MixColumns */
    SubBytes(st);
    ShiftRows(st);
    AddRoundKey(st, round_key);

    memcpy(out, st, 16);
}

/*==================== CBC + PKCS#7 填充加密 ====================*/
/* AES-CBC 模式加密函数（带PKCS#7填充）
 * 功能：使用CBC模式对任意长度明文进行AES加密，并进行PKCS#7填充
 * 参数：
 *   - ctx: AES上下文结构体指针
 *   - in: 输入明文缓冲区
 *   - in_len: 明文长度（字节数）
 *   - iv_in: 初始化向量（16字节）
 *   - out: 输出密文缓冲区
 *   - out_len: 返回实际密文长度
 * 返回值：
 *   - 0: 成功
 * 说明：
 *   - CBC模式：每个明文块与前一个密文块异或后再加密
 *   - PKCS#7填充：不足16字节的部分填充为缺少的字节数
 *   - 输出缓冲区需预留足够空间：in_len + (16 - in_len%16)字节
 *   - 输出长度一定是16的倍数
 */
static int aes_cbc_encrypt_pkcs7(const aes_ctx *ctx,
                                 const uint8_t *in, size_t in_len,
                                 const uint8_t iv_in[16],
                                 uint8_t *out, size_t *out_len) {
    uint8_t iv[16];
    memcpy(iv, iv_in, 16);

    size_t pad = 16 - (in_len % 16);
    if (pad == 0) pad = 16; /* PKCS#7：整块也要补 16 个 0x10 */

    size_t total = in_len + pad;
    size_t nblocks = total / 16;

    size_t i = 0, b = 0;

    /* 处理整块部分 */
    for (; b < in_len / 16; ++b) {
        uint8_t buf[16];
        /* XOR 明文与 IV/上一块密文 */
        for (int j = 0; j < 16; ++j)
            buf[j] = (uint8_t)(in[i + j] ^ iv[j]);
        /* 加密 */
        aes_encrypt_block(ctx, buf, &out[i]);
        /* 更新 IV 为本块密文 */
        memcpy(iv, &out[i], 16);
        i += 16;
    }

    /* 处理尾块 + PKCS#7 填充 */
    {
        uint8_t last[16];
        size_t rem = in_len - i; /* 剩余字节数（0..15） */

        /* 拷入剩余字节 */
        for (size_t j = 0; j < rem; ++j)
            last[j] = in[i + j];
        /* 填充 pad 值 */
        for (size_t j = rem; j < 16; ++j)
            last[j] = (uint8_t)pad;

        /* CBC XOR */
        for (int j = 0; j < 16; ++j)
            last[j] ^= iv[j];

        aes_encrypt_block(ctx, last, &out[i]);
        i += 16;
    }

    *out_len = i;
    (void)nblocks; /* 未直接使用，仅注释用 */
    return 0;
}

/*==================== 可选：自测（FIPS-197 单块） ====================*/
#define AES_TEST
#ifdef AES_TEST
static void print_hex(const uint8_t *p, size_t n) {
    for (size_t i = 0; i < n; ++i) printf("%02x", p[i]);
    printf("\n");
}

int main(void) {
    /* FIPS-197 附录C：AES-128 单块测试 */
    const uint8_t key128[16] = {
        0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,
        0x08,0x09,0x0a,0x0b,0x0c,0x0d,0x0e,0x0f
    };
    const uint8_t pt[16] = {
        0x00,0x11,0x22,0x33,0x44,0x55,0x66,0x77,
        0x88,0x99,0xaa,0xbb,0xcc,0xdd,0xee,0xff
    };
    const uint8_t expect_ct[16] = {
        0x69,0xc4,0xe0,0xd8,0x6a,0x7b,0x04,0x30,
        0xd8,0xcd,0xb7,0x80,0x70,0xb4,0xc5,0x5a
    };

    aes_ctx ctx;
    if (aes_init(&ctx, key128, 128) != 0) {
        printf("init failed\n");
        return 1;
    }

    uint8_t ct[16];
    aes_encrypt_block(&ctx, pt, ct);

    printf("AES-128 block enc expect:\n");
    print_hex(expect_ct, 16);
    printf("result:\n");
    print_hex(ct, 16);

    /* 额外演示 CBC+PKCS#7 */
    const uint8_t iv[16] = {
        0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,
        0x08,0x09,0x0a,0x0b,0x0c,0x0d,0x0e,0x0f
    };
    const uint8_t msg[] = "Hello AES-CBC with PKCS7!";
    uint8_t out[128]; size_t outlen = 0;

    aes_cbc_encrypt_pkcs7(&ctx, msg, sizeof(msg)-1, iv, out, &outlen);
    printf("CBC+PKCS7 ciphertext (%zu bytes):\n", outlen);
    print_hex(out, outlen);

    return 0;
}
#endif

```

## 解密代码

```cpp
/* aes_decrypt.c - AES-ECB/CBC decryption (AES-128/192/256), no dependencies.
   Public domain / CC0-style. Use at your own risk.

   API:
     - enum AESKeyLen { AES128 = 16, AES192 = 24, AES256 = 32 };
     - struct AESCtx { uint32_t rk[60]; int Nr; };
     - void aes_init(struct AESCtx* ctx, const uint8_t* key, size_t keylen);
     - void aes_decrypt_block(const struct AESCtx* ctx, const uint8_t in[16], uint8_t out[16]);
     - void aes_ecb_decrypt(const struct AESCtx* ctx, const uint8_t* in, uint8_t* out, size_t len);
     - void aes_cbc_decrypt(const struct AESCtx* ctx, const uint8_t* in, uint8_t* out, size_t len, const uint8_t iv[16]);
     - int  pkcs7_unpad(uint8_t* buf, size_t* inout_len); // returns 0 on success, -1 on bad padding

   Minimal demo (not compiled by default):
     // struct AESCtx ctx; uint8_t key[16]={...}, iv[16]={...};
     // aes_init(&ctx, key, AES128);
     // aes_cbc_decrypt(&ctx, ciphertext, plaintext, clen, iv);
     // size_t plen = clen; if (pkcs7_unpad(plaintext, &plen)==0) { ...use plen... }
*/
#include <stdlib.h>
#include <stdint.h>
#include <stddef.h>
#include <stdio.h>
#include <string.h>

enum AESKeyLen { AES128 = 16, AES192 = 24, AES256 = 32 };

struct AESCtx {
    uint32_t rk[60]; /* round keys: up to 4*(Nr+1) words = 60 for AES-256 */
    int Nr;          /* number of rounds: 10/12/14 */
};

/* --------- Tables --------- */
static const uint8_t sbox[256] = {
  /* 0x00 */0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  /* 0x10 */0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  /* 0x20 */0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  /* 0x30 */0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  /* 0x40 */0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  /* 0x50 */0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  /* 0x60 */0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  /* 0x70 */0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  /* 0x80 */0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  /* 0x90 */0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  /* 0xA0 */0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  /* 0xB0 */0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  /* 0xC0 */0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  /* 0xD0 */0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  /* 0xE0 */0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  /* 0xF0 */0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16
};

static const uint8_t inv_sbox[256] = {
  /* 0x00 */0x52,0x09,0x6a,0xd5,0x30,0x36,0xa5,0x38,0xbf,0x40,0xa3,0x9e,0x81,0xf3,0xd7,0xfb,
  /* 0x10 */0x7c,0xe3,0x39,0x82,0x9b,0x2f,0xff,0x87,0x34,0x8e,0x43,0x44,0xc4,0xde,0xe9,0xcb,
  /* 0x20 */0x54,0x7b,0x94,0x32,0xa6,0xc2,0x23,0x3d,0xee,0x4c,0x95,0x0b,0x42,0xfa,0xc3,0x4e,
  /* 0x30 */0x08,0x2e,0xa1,0x66,0x28,0xd9,0x24,0xb2,0x76,0x5b,0xa2,0x49,0x6d,0x8b,0xd1,0x25,
  /* 0x40 */0x72,0xf8,0xf6,0x64,0x86,0x68,0x98,0x16,0xd4,0xa4,0x5c,0xcc,0x5d,0x65,0xb6,0x92,
  /* 0x50 */0x6c,0x70,0x48,0x50,0xfd,0xed,0xb9,0xda,0x5e,0x15,0x46,0x57,0xa7,0x8d,0x9d,0x84,
  /* 0x60 */0x90,0xd8,0xab,0x00,0x8c,0xbc,0xd3,0x0a,0xf7,0xe4,0x58,0x05,0xb8,0xb3,0x45,0x06,
  /* 0x70 */0xd0,0x2c,0x1e,0x8f,0xca,0x3f,0x0f,0x02,0xc1,0xaf,0xbd,0x03,0x01,0x13,0x8a,0x6b,
  /* 0x80 */0x3a,0x91,0x11,0x41,0x4f,0x67,0xdc,0xea,0x97,0xf2,0xcf,0xce,0xf0,0xb4,0xe6,0x73,
  /* 0x90 */0x96,0xac,0x74,0x22,0xe7,0xad,0x35,0x85,0xe2,0xf9,0x37,0xe8,0x1c,0x75,0xdf,0x6e,
  /* 0xA0 */0x47,0xf1,0x1a,0x71,0x1d,0x29,0xc5,0x89,0x6f,0xb7,0x62,0x0e,0xaa,0x18,0xbe,0x1b,
  /* 0xB0 */0xfc,0x56,0x3e,0x4b,0xc6,0xd2,0x79,0x20,0x9a,0xdb,0xc0,0xfe,0x78,0xcd,0x5a,0xf4,
  /* 0xC0 */0x1f,0xdd,0xa8,0x33,0x88,0x07,0xc7,0x31,0xb1,0x12,0x10,0x59,0x27,0x80,0xec,0x5f,
  /* 0xD0 */0x60,0x51,0x7f,0xa9,0x19,0xb5,0x4a,0x0d,0x2d,0xe5,0x7a,0x9f,0x93,0xc9,0x9c,0xef,
  /* 0xE0 */0xa0,0xe0,0x3b,0x4d,0xae,0x2a,0xf5,0xb0,0xc8,0xeb,0xbb,0x3c,0x83,0x53,0x99,0x61,
  /* 0xF0 */0x17,0x2b,0x04,0x7e,0xba,0x77,0xd6,0x26,0xe1,0x69,0x14,0x63,0x55,0x21,0x0c,0x7d
};

static const uint32_t Rcon[10] = {
    0x01000000U,0x02000000U,0x04000000U,0x08000000U,0x10000000U,
    0x20000000U,0x40000000U,0x80000000U,0x1B000000U,0x36000000U
};

/* --------- Helpers --------- */
static inline uint32_t ROTL8(uint32_t x){ return (x<<8)|(x>>24); }
static inline uint8_t xtime(uint8_t x){ return (uint8_t)((x<<1) ^ ((x&0x80)?0x1b:0x00)); }

static uint8_t gmul(uint8_t a, uint8_t b){
    /* multiply in GF(2^8) */
    uint8_t p = 0;
    for (int i=0;i<8;i++){
        if (b & 1) p ^= a;
        uint8_t hi = a & 0x80;
        a <<= 1;
        if (hi) a ^= 0x1b;
        b >>= 1;
    }
    return p;
}

static uint32_t pack_be(const uint8_t b[4]){
    return ((uint32_t)b[0]<<24)|((uint32_t)b[1]<<16)|((uint32_t)b[2]<<8)|((uint32_t)b[3]);
}
static void unpack_be(uint32_t w, uint8_t b[4]){
    b[0]=(uint8_t)(w>>24); b[1]=(uint8_t)(w>>16); b[2]=(uint8_t)(w>>8); b[3]=(uint8_t)w;
}

/* SubWord (forward sbox) used in key expansion */
static uint32_t SubWord(uint32_t w){
    uint8_t b[4]; unpack_be(w,b);
    b[0]=sbox[b[0]]; b[1]=sbox[b[1]]; b[2]=sbox[b[2]]; b[3]=sbox[b[3]];
    return pack_be(b);
}

/* --------- Key Expansion --------- */
void aes_init(struct AESCtx* ctx, const uint8_t* key, size_t keylen){
    int Nk, Nr;
    if (keylen == AES128){ Nk=4; Nr=10; }
    else if (keylen == AES192){ Nk=6; Nr=12; }
    else if (keylen == AES256){ Nk=8; Nr=14; }
    else { /* default: treat as 128 */
        Nk=4; Nr=10;
    }
    ctx->Nr = Nr;

    /* copy initial key words */
    for (int i=0;i<Nk;i++){
        ctx->rk[i] = pack_be(key + 4*i);
    }
    int i = Nk;
    for (int rcon_idx=0; i < 4*(Nr+1); i++){
        uint32_t temp = ctx->rk[i-1];
        if (i % Nk == 0){
            temp = SubWord(ROTL8(temp)) ^ Rcon[rcon_idx++];
        } else if (Nk > 6 && (i % Nk) == 4){
            temp = SubWord(temp);
        }
        ctx->rk[i] = ctx->rk[i-Nk] ^ temp;
    }
}

/* --------- Inverse cipher (one block) --------- */

static void AddRoundKey(uint8_t state[16], const uint32_t* rk){
    for (int c=0;c<4;c++){
        uint8_t t[4];
        unpack_be(rk[c], t);
        state[4*c+0] ^= t[0];
        state[4*c+1] ^= t[1];
        state[4*c+2] ^= t[2];
        state[4*c+3] ^= t[3];
    }
}

static void InvSubBytes(uint8_t s[16]){
    for (int i=0;i<16;i++) s[i] = inv_sbox[s[i]];
}

static void InvShiftRows(uint8_t s[16]){
    uint8_t t;

    /* Row1: shift right by 1 */
    t = s[13]; s[13]=s[9]; s[9]=s[5]; s[5]=s[1]; s[1]=t;
    /* Row2: shift right by 2 */
    t = s[2]; s[2]=s[10]; s[10]=t; t=s[6]; s[6]=s[14]; s[14]=t;
    /* Row3: shift right by 3 (left by 1) */
    t = s[3]; s[3]=s[7]; s[7]=s[11]; s[11]=s[15]; s[15]=t;
}

static void InvMixColumns(uint8_t s[16]){
    for (int c=0;c<4;c++){
        uint8_t *col = &s[4*c];
        uint8_t a0=col[0], a1=col[1], a2=col[2], a3=col[3];
        col[0] = (uint8_t)( gmul(a0,0x0e) ^ gmul(a1,0x0b) ^ gmul(a2,0x0d) ^ gmul(a3,0x09) );
        col[1] = (uint8_t)( gmul(a0,0x09) ^ gmul(a1,0x0e) ^ gmul(a2,0x0b) ^ gmul(a3,0x0d) );
        col[2] = (uint8_t)( gmul(a0,0x0d) ^ gmul(a1,0x09) ^ gmul(a2,0x0e) ^ gmul(a3,0x0b) );
        col[3] = (uint8_t)( gmul(a0,0x0b) ^ gmul(a1,0x0d) ^ gmul(a2,0x09) ^ gmul(a3,0x0e) );
    }
}

void aes_decrypt_block(const struct AESCtx* ctx, const uint8_t in[16], uint8_t out[16]){
    uint8_t s[16];
    memcpy(s, in, 16);

    /* initial AddRoundKey with last round key */
    AddRoundKey(s, &ctx->rk[4*ctx->Nr]);

    for (int round = ctx->Nr - 1; round >= 1; round--){
        InvShiftRows(s);
        InvSubBytes(s);
        AddRoundKey(s, &ctx->rk[4*round]);
        InvMixColumns(s);
    }
    /* final round without InvMixColumns */
    InvShiftRows(s);
    InvSubBytes(s);
    AddRoundKey(s, &ctx->rk[0]);

    memcpy(out, s, 16);
}

/* --------- Modes --------- */

void aes_ecb_decrypt(const struct AESCtx* ctx, const uint8_t* in, uint8_t* out, size_t len){
    /* len must be multiple of 16 */
    size_t blocks = len / 16;
    for (size_t i=0;i<blocks;i++){
        aes_decrypt_block(ctx, in + 16*i, out + 16*i);
    }
}

static void xor16(uint8_t* dst, const uint8_t* a, const uint8_t* b){
    for (int i=0;i<16;i++) dst[i] = (uint8_t)(a[i] ^ b[i]);
}

void aes_cbc_decrypt(const struct AESCtx* ctx, const uint8_t* in, uint8_t* out, size_t len, const uint8_t iv[16]){
    /* len must be multiple of 16 */
    uint8_t prev[16];
    memcpy(prev, iv, 16);
    size_t blocks = len / 16;

    for (size_t i=0;i<blocks;i++){
        uint8_t tmp[16];
        aes_decrypt_block(ctx, in + 16*i, tmp);
        xor16(out + 16*i, tmp, prev);
        memcpy(prev, in + 16*i, 16);
    }
}

/* --------- Optional: PKCS#7 unpad --------- */
/* buf must hold entire plaintext; inout_len is updated to the unpadded length.
   Returns 0 on success, -1 on bad padding. */
int pkcs7_unpad(uint8_t* buf, size_t* inout_len){
    if (*inout_len == 0) return -1;
    uint8_t pad = buf[*inout_len - 1];
    if (pad == 0 || pad > 16) return -1;
    if (*inout_len < pad) return -1;
    size_t start = *inout_len - pad;
    for (size_t i=start; i<*inout_len; i++){
        if (buf[i] != pad) return -1;
    }
    *inout_len = start;
    return 0;
}

int main(void) {
    /* 你提供的 key 和 iv */
    const uint8_t key[16] = {
        0x35, 0x38, 0x35, 0x35, 0x65, 0x61, 0x62, 0x35,
        0x33, 0x61, 0x32, 0x32, 0x37, 0x35, 0x64, 0x33
    };
    const uint8_t iv[16]  = {
        0x62, 0x30, 0x35, 0x31, 0x61, 0x35, 0x37, 0x64,
        0x36, 0x64, 0x30, 0x35, 0x62, 0x33, 0x39, 0x33
    };

    /* 你提供的密文 (32 字节) */
    uint8_t ciphertext[32] = {
        0x52,0x06,0xC4,0x9D,0x28,0x71,0x26,0x04,
        0xBA,0x98,0x4D,0x20,0x03,0x81,0x39,0x39,
        0x8C,0x6E,0x14,0x8C,0x7E,0xBF,0x44,0x5A,
        0x67,0xF5,0x0A,0x7F,0x61,0x7F,0xCE,0x72
    };
    size_t clen = sizeof(ciphertext);

    /* 输出缓冲区 */
    uint8_t* plaintext = (uint8_t*)malloc(clen);
    if (!plaintext) {
        fprintf(stderr, "malloc failed\n");
        return 1;
    }

    /* 初始化 AES 上下文并解密 */
    struct AESCtx ctx;
    aes_init(&ctx, key, AES128);
    aes_cbc_decrypt(&ctx, ciphertext, plaintext, clen, iv);

    /* 去掉 PKCS#7 填充 */
    size_t plen = clen;
    if (pkcs7_unpad(plaintext, &plen) != 0) {
        fprintf(stderr, "Warning: bad PKCS#7 padding, 原始长度保持 %zu\n", plen);
    }

    /* 打印结果 (十六进制 + ASCII) */
    printf("Plaintext (hex): ");
    char *key_2 = "what's this";
    for (size_t i=0; i<plen; i++) {
        printf("%02X ", plaintext[i] ^ key_2[i % strlen(key_2)]);
    }
    printf("\n");

    printf("Plaintext (char): ");
    for (size_t i=0; i<plen; i++) {
        printf("%c", plaintext[i] ^ key_2[i % strlen(key_2)]);
    }
    printf("\n");

    printf("Plaintext (ASCII): ");
    for (size_t i=0; i<plen; i++) {
        unsigned char c = plaintext[i];
        if (c >= 32 && c <= 126) {
            putchar(c);
        } else {
            printf("\\x%02X", c);
        }
    }
    printf("\n");

    free(plaintext);
    return 0;
}
```

# SM4
## 参数分析
- **输入**：128位密文（16字节），128位密钥（16字节）
- **输出**：128位明文（16字节）
- **轮数**：32轮
- **结构**：非线性S盒 + 线性变换（扩散）+ 轮密钥
## 代码实现
```cpp
#include <stdint.h>
#include <string.h>
#include <stdio.h>

static const uint8_t SBOX[256] = {
    // 标准 S-Box 表，共256字节
    0xD1, 0x90, 0xE9, 0xFE, 0xCC, 0xE1, 0x3D, 0xB7, 0x16, 0xB6, 0x14, 0xC2, 0x28, 0xFB, 0x2C, 0x05,
    0x2B, 0x67, 0x9A, 0x76, 0x2A, 0xBE, 0x04, 0xC3, 0xAA, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
    0x9C, 0x42, 0x50, 0xF4, 0x91, 0xEF, 0x98, 0x7A, 0x33, 0x54, 0x0B, 0x43, 0xED, 0xCF, 0xAC, 0x62,
    0xE4, 0xB3, 0x17, 0xA9, 0x1C, 0x08, 0xE8, 0x95, 0x80, 0xDF, 0x94, 0xFA, 0x75, 0x8F, 0x3F, 0xA6,
    0x47, 0x07, 0xA7, 0x4F, 0xF3, 0x73, 0x71, 0xBA, 0x83, 0x59, 0x3C, 0x19, 0xE6, 0x85, 0xD6, 0xA8,
    0x68, 0x6B, 0x81, 0xB2, 0xFC, 0x64, 0xDA, 0x8B, 0xF8, 0xEB, 0x0F, 0x4B, 0x70, 0x56, 0x9D, 0x35,
    0x1E, 0x24, 0x0E, 0x78, 0x63, 0x58, 0x9F, 0xA2, 0x25, 0x22, 0x7C, 0x3B, 0x01, 0x21, 0xC9, 0x87,
    0xD4, 0x00, 0x46, 0x57, 0x5E, 0xD3, 0x27, 0x52, 0x4C, 0x36, 0x02, 0xE7, 0xA0, 0xC4, 0xC8, 0x9E,
    0xEA, 0xBF, 0x8A, 0xD2, 0x40, 0xC7, 0x38, 0xB5, 0xA3, 0xF7, 0xF2, 0xCE, 0xF9, 0x61, 0x15, 0xA1,
    0xE0, 0xAE, 0x5D, 0xA4, 0x9B, 0x34, 0x1A, 0x55, 0xAD, 0x93, 0x32, 0x30, 0xF5, 0x8C, 0xB1, 0xE3,
    0x1D, 0xF6, 0xE2, 0x2E, 0x82, 0x66, 0xCA, 0x60, 0xC0, 0x29, 0x23, 0xAB, 0x0D, 0x53, 0x4E, 0x6F,
    0xD5, 0xDB, 0x37, 0x45, 0xDE, 0xFD, 0x8E, 0x2F, 0x03, 0xFF, 0x6A, 0x72, 0x6D, 0x6C, 0x5B, 0x51,
    0x8D, 0x1B, 0xAF, 0x92, 0xBB, 0xDD, 0xBC, 0x7F, 0x11, 0xD9, 0x5C, 0x41, 0x1F, 0x10, 0x5A, 0xD8,
    0x0A, 0xC1, 0x31, 0x88, 0xA5, 0xCD, 0x7B, 0xBD, 0x2D, 0x74, 0xD0, 0x12, 0xB8, 0xE5, 0xB4, 0xB0,
    0x89, 0x69, 0x97, 0x4A, 0x0C, 0x96, 0x77, 0x7E, 0x65, 0xB9, 0xF1, 0x09, 0xC5, 0x6E, 0xC6, 0x84,
    0x18, 0xF0, 0x7D, 0xEC, 0x3A, 0xDC, 0x4D, 0x20, 0x79, 0xEE, 0x5F, 0x3E, 0xD7, 0xCB, 0x39, 0x48
};

static const uint32_t FK[4] = { 0xA3B1BAC6, 0x56AA3350, 0x677D9197, 0xB27022DC };
static const uint32_t CK[32] = {
    0x00070E15, 0x1C232A31, 0x383F464D, 0x545B6269, 0x70777E85, 0x8C939AA1, 0xA8AFB6BD, 0xC4CBD2D9,
    0xE0E7EEF5, 0xFC030A11, 0x181F262D, 0x343B4249, 0x50575E65, 0x6C737A81, 0x888F969D, 0xA4ABB2B9,
    0xC0C7CED5, 0xDCE3EAF1, 0xF8FF060D, 0x141B2229, 0x30373E45, 0x4C535A61, 0x686F767D, 0x848B9299,
    0xA0A7AEB5, 0xBCC3CAD1, 0xD8DFE6ED, 0xF4FB0209, 0x10171E25, 0x2C333A41, 0x484F565D, 0x646B7279
};

// 字节替代 + 线性变换
uint32_t sm4_t(uint32_t x)
{
    uint8_t a[4];
    a[0] = SBOX[(x >> 24) & 0xFF];
    a[1] = SBOX[(x >> 16) & 0xFF];
    a[2] = SBOX[(x >> 8) & 0xFF];
    a[3] = SBOX[x & 0xFF];
    uint32_t t = (a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3];
    return t ^ (t << 2 | t >> 30) ^ (t << 10 | t >> 22) ^ (t << 18 | t >> 14) ^ (t << 24 | t >> 8);
}

// 用于密钥扩展的T函数
uint32_t sm4_key_t(uint32_t x)
{
    uint8_t a[4];
    a[0] = SBOX[(x >> 24) & 0xFF];
    a[1] = SBOX[(x >> 16) & 0xFF];
    a[2] = SBOX[(x >> 8) & 0xFF];
    a[3] = SBOX[x & 0xFF];
    uint32_t t = (a[0] << 24) | (a[1] << 16) | (a[2] << 8) | a[3];
    return t ^ (t << 13 | t >> 19) ^ (t << 23 | t >> 9);
}

// 密钥扩展，生成32轮密钥 rk[]
void sm4_key_schedule(const uint8_t key[16], uint32_t rk[32])
{
    uint32_t K[36];
    for (int i = 0; i < 4; ++i)
        K[i] = ((uint32_t)key[4*i] << 24) | ((uint32_t)key[4*i+1] << 16) | ((uint32_t)key[4*i+2] << 8) | key[4*i+3];
    for (int i = 0; i < 4; ++i)
        K[i] ^= FK[i];
    for (int i = 0; i < 32; ++i) {
        K[i+4] = K[i] ^ sm4_key_t(K[i+1] ^ K[i+2] ^ K[i+3] ^ CK[i]);
        rk[i] = K[i+4];
    }
}

// 解密函数
void sm4_decrypt(const uint8_t input[16], const uint8_t key[16], uint8_t output[16])
{
    uint32_t rk[32], X[36];
    sm4_key_schedule(key, rk);

    // 反转轮密钥顺序
    for (int i = 0; i < 16; ++i) {
        uint32_t tmp = rk[i];
        rk[i] = rk[31 - i];
        rk[31 - i] = tmp;
    }

    // 加载明文
    for (int i = 0; i < 4; ++i)
        X[i] = ((uint32_t)input[4*i] << 24) | ((uint32_t)input[4*i+1] << 16) | ((uint32_t)input[4*i+2] << 8) | input[4*i+3];

    // 32轮加密
    for (int i = 0; i < 32; ++i)
        X[i+4] = X[i] ^ sm4_t(X[i+1] ^ X[i+2] ^ X[i+3] ^ rk[i]);

    // 输出（倒序）
    for (int i = 0; i < 4; ++i) {
        output[4*i]   = (X[35 - i] >> 24) & 0xFF;
        output[4*i+1] = (X[35 - i] >> 16) & 0xFF;
        output[4*i+2] = (X[35 - i] >> 8) & 0xFF;
        output[4*i+3] = X[35 - i] & 0xFF;
    }
}

int main()
{
    uint8_t key[17] = "NCTF24nctfNCTF24";

    uint8_t cipher[32] = {
      0xFB, 0x97, 0x3C, 0x3B, 0xF1, 0x99, 0x12, 0xDF, 0x13, 0x30, 0xF7, 0xD8, 0x7F, 0xEB, 0xA0, 0x6C,
      0x14, 0x5B, 0xA6, 0x2A, 0xA8, 0x05, 0xA5, 0xF3, 0x76, 0xBE, 0xC9, 0x01, 0xF9, 0x36, 0x7B, 0x46
    };

    uint8_t plain[32];
    sm4_decrypt(cipher, key, plain);
    sm4_decrypt(cipher+16, key, plain+16);

    printf("Decrypted: ");
    for (int i = 0; i < 32; ++i)
        printf("%c", plain[i]);
    printf("\n");

    return 0;
}
```


# BASE64编码
Base64 是一种 **把二进制数据安全塞进文本** 的编码方式，规则是 **3字节变4字符，6位一组查表，`=`补齐**。

## 代码实现
```cpp
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>

// Base64字符表
static const char base64_chars[] =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    "abcdefghijklmnopqrstuvwxyz"
    "0123456789+/";

// 是否是合法Base64字符
static inline int is_base64(unsigned char c) {
    return (c >= 'A' && c <= 'Z') ||
           (c >= 'a' && c <= 'z') ||
           (c >= '0' && c <= '9') ||
           (c == '+') || (c == '/');
}

// Base64编码
char *base64_encode(const unsigned char *data, size_t input_length, size_t *output_length) {
    size_t i, j;
    *output_length = 4 * ((input_length + 2) / 3);
    char *encoded_data = (char *)malloc(*output_length + 1);
    if (encoded_data == NULL) return NULL;

    for (i = 0, j = 0; i < input_length;) {
        uint32_t octet_a = i < input_length ? data[i++] : 0;
        uint32_t octet_b = i < input_length ? data[i++] : 0;
        uint32_t octet_c = i < input_length ? data[i++] : 0;

        uint32_t triple = (octet_a << 16) | (octet_b << 8) | octet_c;

        encoded_data[j++] = base64_chars[(triple >> 18) & 0x3F];
        encoded_data[j++] = base64_chars[(triple >> 12) & 0x3F];
        encoded_data[j++] = (i - 1 > input_length + 1) ? '=' : base64_chars[(triple >> 6) & 0x3F];
        encoded_data[j++] = (i > input_length) ? '=' : base64_chars[triple & 0x3F];
    }
    encoded_data[*output_length] = '\0';
    return encoded_data;
}

// Base64解码
unsigned char *base64_decode(const char *data, size_t input_length, size_t *output_length) {
    if (input_length % 4 != 0) return NULL;

    size_t alloc_len = input_length / 4 * 3;
    if (data[input_length - 1] == '=') alloc_len--;
    if (data[input_length - 2] == '=') alloc_len--;

    unsigned char *decoded_data = (unsigned char *)malloc(alloc_len);
    if (decoded_data == NULL) return NULL;

    int decoding_table[256];
    memset(decoding_table, -1, 256 * sizeof(int));
    for (int i = 0; i < 64; i++) {
        decoding_table[(unsigned char)base64_chars[i]] = i;
    }

    size_t i, j;
    for (i = 0, j = 0; i < input_length;) {
        uint32_t sextet_a = data[i] == '=' ? 0 & i++ : decoding_table[(unsigned char)data[i++]];
        uint32_t sextet_b = data[i] == '=' ? 0 & i++ : decoding_table[(unsigned char)data[i++]];
        uint32_t sextet_c = data[i] == '=' ? 0 & i++ : decoding_table[(unsigned char)data[i++]];
        uint32_t sextet_d = data[i] == '=' ? 0 & i++ : decoding_table[(unsigned char)data[i++]];

        uint32_t triple = (sextet_a << 18) + (sextet_b << 12) + (sextet_c << 6) + sextet_d;

        if (j < alloc_len) decoded_data[j++] = (triple >> 16) & 0xFF;
        if (j < alloc_len) decoded_data[j++] = (triple >> 8) & 0xFF;
        if (j < alloc_len) decoded_data[j++] = triple & 0xFF;
    }
    *output_length = alloc_len;
    return decoded_data;
}

// 测试
int main() {
    const char *text = "Hello RC6 AES Base64!";
    printf("原文: %s\n", text);

    size_t enc_len;
    char *encoded = base64_encode((const unsigned char *)text, strlen(text), &enc_len);
    printf("Base64编码: %s\n", encoded);

    size_t dec_len;
    unsigned char *decoded = base64_decode(encoded, enc_len, &dec_len);
    decoded[dec_len] = '\0'; // 确保当成字符串可以打印
    printf("Base64解码: %s\n", decoded);

    // 释放内存
    free(encoded);
    free(decoded);
    return 0;
}

```
# 祖冲之序列算法

# 哈希算法
**Hash**，一般翻译做“散列”，也有直接音译为“哈希”的，**就是把任意长度的输入（又叫做预映射， pre-image），通过散列算法，变换成固定长度的输出**
该输出就是散列值。这种转换是一种压缩映射，也就是，散列值的空间通常远小于输入的空间
**不同的输入可能会散列成相同的输出**，而不可能从散列值来唯一的确定输入值。
**简单的说就是一种将任意长度的消息压缩到某一固定长度的消息摘要的函数。**

常见哈希算法输出长度：

| 算法      | 输出长度         |
| ------- | ------------ |
| MD5     | 128 位（16字节）  |
| SHA-1   | 160 位（20字节）  |
| SHA-256 | 256 位（32字节）  |
| SHA-512 | 512 位（64字节）  |
| SM3     | 256 位 (32字节) |
## 国密SM3算法
推荐博客: [SM3算法流程 - 书书书书君 - 博客园](https://www.cnblogs.com/11sgXL/p/17006282.html)

SM3 密码杂凑算法的输入为长度为I（l～2）比特的消息m，经过填充、迭代压缩，生成杂凑值，杂
凑值输出长度为 256 比特。

大致流程:
1. 数据填充
2. 数据分组
3. CF函数 (消息扩散, 消息压缩)
4. 输出杂凑值
### 消息填充
假设消息 m 的长度为l比特,则首先将比特“1”添加到消息的末尾,再添加 k 个“0”, k 是满足 l+1+k≡448(mod512) 的最小的非负整数。然后再添加一个64位比特串,该比特串是长度 l 的二进制表示。填充后的消息 m 的比特长度为512的倍数。

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251211115949.png)
### 数据分组
![image.png|700](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251211120510.png)

### 函数CF
1. 消息扩散
2. 消息压缩
3. 输出最后的杂凑值

参考链接：
https://ctf-wiki.org/reverse/identify-encode-encryption/introduction/#base64
https://blog.csdn.net/Pioo_/article/details/110878905
https://www.cnblogs.com/zpchcbd/p/15974293.html