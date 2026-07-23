---
profileName: zhugeshi8@gmail.com
postId: "38"
postType: post
categories:
  - 1
---
# TemporalParadox
根据ida的报错 patch掉花指令之后还原代码爆破即可
可惜当时做的时候没有看出花指令,然后想通过Frida Hook函数爆破,然后就没写出来呜呜(┭┮﹏┭┮)

(事实证明Frida爆破也是一种可行的方式,需要hook time64() 函数,并通过多进程的方式爆破)

`main.cpp`

```cpp
#include <iostream>
#include <string>
#include <Windows.h>
#include <cmath>
#include <sstream>
#include "md5.h"

using namespace std;

unsigned int time0 = 0;

unsigned int arr[] = {
	0xCC, 0xB4, 0xFFFFFF94, 0xFFFFFF86, 0xFFFFFF9A, 0xFFFFFF8A, 0xFFFFFF9A, 0xFFFFFF8E, 0xFFE7AC2D, 
	0xA2,0xFFFFFF9A, 0xAE, 0xFFB70487, 0xD2, 0xCC, 0xDE, 0xFFFFFF96, 0xCC, 0xCC, 0xFFFFE65F, 0xFFF7E40F, 
	0xFFFFFF86, 0xB4, 0xFFFFE65F, 0xFFFF1957, 0xFFFFFF94, 0xFFFFFF8C, 0xFFFFFF88, 0xC6, 0xFFFFFF98, 
	0xFFFFFF92, 0xFFFD4C05
};

// ========== 全局查表表（根据实际值初始化） ==========
uint8_t SBox[16] = { 0xE,0x4,0xD,0x1,0x2,0xF,0xB,0x8,0x3,0xA,0x6,0xC,0x5,0x9,0x0,0x7 };        // dword_7FF6ABB6C020
uint8_t Perm[16] = { 0x1,0x5,0x9,0xD,0x2,0x6,0xA,0xE,0x3,0x7,0xB,0xF,0x4,0x8,0xC,0x10 };         // dword_7FF6ABB6C0A0

int encode_0(int index, int random) {
    return (random << (4 * (index - 1))) >> 16;
}

int scramble(int val) {
    for (int i = 0; i < 4; ++i) {
        int high_nibble = (val >> 12) & 0xF;
        val = (val << 4) | SBox[high_nibble];
    }
    return val;
}

int permute_bits(int val) {
    int result = 0;
    for (int i = 0; i < 16; ++i) {
        int src_bit = (val >> (Perm[i] - 1)) & 1;
        result |= (src_bit << i);
    }
    return result;
}

int mix_round(int input) {
    int mixed = scramble(input);
    return permute_bits(mixed);
}

uint32_t generate_cipher(uint32_t time, int random) {
    uint32_t val = time;

    // 3轮扰动
    for (int i = 1; i <= 3; ++i) {
        val ^= encode_0(i, random);
        val = mix_round(val);
    }

    // 第4轮单独扰动
    val ^= encode_0(4, random);
    val = scramble(val);

    // 最终 XOR
    val ^= encode_0(5, random);
    return val;
}


string init_salt() {
	std::stringstream ss;
	for (int i = 0; i <= 31; i++) {
		int v = arr[i];
		int c;

        if (v >= 0)
        {
            c = v / 3 + '0';
        }
        else if (v >= -728)
        {
            c = ~v;
        }
        else
        {
            double f = log(static_cast<double>(-v)); // 假设 sub_7FF6ABB631D0 是 log()
            c = static_cast<int>(f / 1.09861228866811 - 6.0 + 48.0);
        }

        ss << static_cast<char>(c);
    }
    return ss.str();
}

void init_time0(__time64_t current_time) {
	if (!current_time) {
		time0 = 1;
	}
	else {
		time0 = current_time;
	}
}

int encode() {
	unsigned int tmp;

	tmp = (((time0 << 13) ^ time0) >> 17) ^ (time0 << 13) ^ time0;
	time0 = (tmp << 5) ^ tmp;

	return time0 & 0x7FFFFFFF;
}

void bruteforce() {
	const std::string target_md5 = "8a2fc1e9e2830c37f8a7f51572a640aa";
	string salt_str = init_salt();

	for (__time64_t current_time = 0x686D4081; current_time <= 0x686E3153; ++current_time) {
		init_time0(current_time);

		unsigned int key[4] = { 0 };
		for (int i = 0; i < encode(); i++) {
			key[0] = encode();
			key[1] = encode();
			key[2] = encode();
			key[3] = encode();
		}

		unsigned int random_val = encode();
		double val_a = 0x61;
		double val_b = val_a * pow((key[0] | key[2]), 2.0);
		double val_c = 0xb;

		std::stringstream ss;

		if (val_b == pow((key[1] | key[3]), 2.0) * val_c) {
			uint32_t cipher = generate_cipher(current_time, random_val);

			ss << "salt=" << salt_str
			   << "&t=" << current_time
			   << "&r=" << random_val
			   << "&cipher" << cipher;
		} else {
			ss << "salt=" << salt_str
			   << "&t=" << current_time
			   << "&r=" << random_val
			   << "&a=" << key[0]
			   << "&b=" << key[1]
			   << "&x=" << key[2]
			   << "&y=" << key[3];
		}

		std::string full = ss.str();
		std::string hash = md5(full);

		if (hash == target_md5) {
			cout << "[*] Match found!" << endl;
			cout << "Time: " << current_time << " (0x" << std::hex << current_time << ")" << endl;
			cout << "Raw string: " << full << endl;
			cout << "MD5: " << hash << endl;
			return;
		}
	}
	cout << "[*] No match found in given time range." << endl;
}

int main() {
	bruteforce();
	return 0;
}
```

其中md5的实现就不贴上来了,从网上抄一份就行,或者直接ai生成.

# 终焉之门
这道题目是和opengl相关的,比赛的时候完全不知道着色器函数逻辑,就没做出来(┭┮﹏┭┮)

![](https://pic1.imgdb.cn/item/687e434858cb8da5c8ca0d52.png)

问了一下GPT,这个应该就是着色器函数启动的地方了,然后从别人的WP上看到了这里就是最后着色器内部代码解密出来的地方

```cpp
__int64 __fastcall sub_7FF63580E700(__int64 a1, unsigned int a2)
{
  __int64 v3; // rbx
  unsigned int v4; // esi
  char *v5; // rdi
  __int64 v6; // rcx
  int v8; // [rsp+24h] [rbp-24h] BYREF
  int v9; // [rsp+28h] [rbp-20h] BYREF
  int v10[7]; // [rsp+2Ch] [rbp-1Ch] BYREF
  __int64 v11; // [rsp+50h] [rbp+8h] BYREF

  v11 = a1;
  v3 = qword_7FF6358F1B70(a2);
  qword_7FF6358F09A0(v3, 1i64, &v11, 0i64);
  v8 = 0;
  qword_7FF6358F1CA8(v3);
  qword_7FF6358F13B0(v3, 35713i64, &v8);
  if ( !v8 )
  {
    switch ( a2 )
    {
      case 0x8B31u:
        sub_7FF63588D460(4i64, "SHADER: [ID %i] Failed to compile vertex shader code", v3);
        break;
      case 0x91B9u:
        sub_7FF63588D460(4i64, "SHADER: [ID %i] Failed to compile compute shader code", v3);
        break;
      case 0x8B30u:
        sub_7FF63588D460(4i64, "SHADER: [ID %i] Failed to compile fragment shader code", v3);
        break;
    }
    v9 = 0;
    qword_7FF6358F13B0(v3, 35716i64, &v9);
    v4 = v9;
    if ( v9 > 0 )
    {
      v10[0] = 0;
      v5 = calloc(v9, 1ui64);
      qword_7FF6358F13D0(v3, v4, v10, v5);
      sub_7FF63588D460(4i64, "SHADER: [ID %i] Compile error: %s", v3, v5);
      free(v5);
    }
    v6 = v3;
    LODWORD(v3) = 0;
    qword_7FF6358F1A98(v6);
    return v3;
  }
  switch ( a2 )
  {
    case 0x8B31u:
      sub_7FF63588D460(3i64, "SHADER: [ID %i] Vertex shader compiled successfully", v3);
      return v3;
    case 0x91B9u:
      sub_7FF63588D460(3i64, "SHADER: [ID %i] Compute shader compiled successfully", v3);
      return v3;
    case 0x8B30u:
      sub_7FF63588D460(3i64, "SHADER: [ID %i] Fragment shader compiled successfully", v3);
      return v3;
    default:
      return v3;
  }
}
```

跟踪进去可以看到一大串数据,转化成数组后dump出来

![](https://pic1.imgdb.cn/item/687e441758cb8da5c8ca0dad.png)

```cpp
#version 430 core

layout(local_size_x = 1, local_size_y = 1, local_size_z = 1) in;
layout(std430, binding = 0) buffer OpCodes  { int opcodes[]; };
layout(std430, binding = 2) buffer CoConsts { int co_consts[]; };
layout(std430, binding = 3) buffer Cipher   { int cipher[16]; };
layout(std430, binding = 4) buffer Stack    { int stack_data[256]; };
layout(std430, binding = 5) buffer Out      { int verdict;         };

const int MaxInstructionCount = 1000;


void main()
{
    if (gl_GlobalInvocationID.x > 0) return;

    uint ip = 0u;
    int sp = 0;
    verdict = -233;

    while (ip < uint(MaxInstructionCount))
    {
        int opcode = opcodes[int(ip)];
        int arg    = opcodes[int(ip)+1];

        switch (opcode)
        {
            case 2:
                stack_data[sp++] = co_consts[arg];
                break;
            case 7:
            {
                int b = stack_data[--sp];
                int a = stack_data[--sp];
                stack_data[sp++] = a + b;
                break;
            }
            case 8:
            {
                int a = stack_data[--sp];
                int b = stack_data[--sp];
                stack_data[sp++] = a - b;
                break;
            }
            case 14:
            {
                int b = stack_data[--sp];
                int a = stack_data[--sp];
                stack_data[sp++] = a ^ b;
                break;
            }

            case 15:
            {
                int b = stack_data[--sp];
                int a = stack_data[--sp];
                stack_data[sp++] = int(a == b);
                break;
            }

            case 16:
            {
                bool ok = true;
                for (int i = 0; i < 16; i++)
                {
                    if (stack_data[i] != (cipher[i] - 20))
                    { 
                        ok = false; 
                        break; 
                    }
                }
                verdict = ok ? 1 : -1;
                return;
            }

            case 18:
            {
                int c = stack_data[--sp];
                if (c == 0) ip = uint(arg);
                break;
            }

            default:
                verdict = 500;
                return;
        }

        ip+=2;
    }
    verdict = 501;
}

```

观察这里的数据,结合里边的binding值,在代码中标记出变量

```cpp
layout(local_size_x = 1, local_size_y = 1, local_size_z = 1) in;
layout(std430, binding = 0) buffer OpCodes  { int opcodes[]; };
layout(std430, binding = 2) buffer CoConsts { int co_consts[]; };
layout(std430, binding = 3) buffer Cipher   { int cipher[16]; };
layout(std430, binding = 4) buffer Stack    { int stack_data[256]; };
layout(std430, binding = 5) buffer Out      { int verdict;         }; 
```

![](https://pic1.imgdb.cn/item/687e44e658cb8da5c8ca0e01.png)

![](https://pic1.imgdb.cn/item/687e451e58cb8da5c8ca0e14.png)

跟踪进去把里面的值dump出来,再根据原来的逻辑还原代码,是一个简单的虚拟机

```cpp
#include <stdio.h>
#include <stdlib.h>

#define STACK_SIZE 256
#define MAX_INSTRUCTIONS 1000

unsigned char opcodes[] = {
    0x2, 0x0, 0x2, 0x1, 0x2, 0x0, 0xE, 0x0, 0x2, 0x10, 0x8, 0x0, 0x2, 0x2, 0x2, 0x1, 0xE, 0x0, 0x2, 0x11,
    0x8, 0x0, 0x2, 0x3, 0x2, 0x2, 0xE, 0x0, 0x2, 0x12, 0x7, 0x0, 0x2, 0x4, 0x2, 0x3, 0xE, 0x0, 0x2, 0x13,
    0x7, 0x0, 0x2, 0x5, 0x2, 0x4, 0xE, 0x0, 0x2, 0x14, 0x8, 0x0, 0x2, 0x6, 0x2, 0x5, 0xE, 0x0, 0x2, 0x15,
    0x7, 0x0, 0x2, 0x7, 0x2, 0x6, 0xE, 0x0, 0x2, 0x16, 0x7, 0x0, 0x2, 0x8, 0x2, 0x7, 0xE, 0x0, 0x2, 0x17,
    0x7, 0x0, 0x2, 0x9, 0x2, 0x8, 0xE, 0x0, 0x2, 0x18, 0x7, 0x0, 0x2, 0xA, 0x2, 0x9, 0xE, 0x0, 0x2, 0x19,
    0x7, 0x0, 0x2, 0xB, 0x2, 0xA, 0xE, 0x0, 0x2, 0x1A, 0x7, 0x0, 0x2, 0xC, 0x2, 0xB, 0xE, 0x0, 0x2, 0x1B,
    0x8, 0x0, 0x2, 0xD, 0x2, 0xC, 0xE, 0x0, 0x2, 0x1C, 0x8, 0x0, 0x2, 0xE, 0x2, 0xD, 0xE, 0x0, 0x2, 0x1D,
    0x7, 0x0, 0x2, 0xF, 0x2, 0xE, 0xE, 0x0, 0x2, 0x1E, 0x8, 0x0, 0x10, 0x0, 0x2, 0x10, 0x2, 0x11, 0xF, 0x0,
    0x12, 0x54, 0x2, 0x1F, 0x1, 0x0, 0x3, 0x1
};

unsigned char co_consts[] = {
    0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0,
    0xB0, 0xC8, 0xFA, 0x86, 0x6E, 0x8F, 0xAF, 0xBF, 0xC9, 0x64, 0xD7, 0xC3, 0xE3, 0xEF, 0x87, 0x0
};

unsigned char cipher[] = {
    0xF3, 0x82, 0x6, 0x1FD, 0x150, 0x38, 0xB2, 0xDE, 0x15A, 0x197, 0x9C, 0x1D7, 0x6E, 0x28, 0x146, 0x97
};

int stack[STACK_SIZE];
int verdict = -233;

int main() {
    unsigned int ip = 0;
    int sp = 0;

    while (ip < MAX_INSTRUCTIONS) {
        int opcode = opcodes[ip];
        int arg = opcodes[ip + 1];

        printf("ip=%03d: ", ip); // 输出指令地址

        switch (opcode) {
            case 2:  // PUSH
                stack[sp++] = co_consts[arg];
                printf("PUSH co_consts[%d] = %d\n", arg, co_consts[arg]);
                break;

            case 7:  // ADD
            {
                int b = stack[--sp];
                int a = stack[--sp];
                stack[sp++] = a + b;
                printf("ADD => %d + %d = %d\n", a, b, a + b);
                break;
            }

            case 8:  // SUB
            {
                int a = stack[--sp];
                int b = stack[--sp];
                stack[sp++] = a - b;
                printf("SUB => %d - %d = %d\n", a, b, a - b);
                break;
            }

            case 14: // XOR
            {
                int b = stack[--sp];
                int a = stack[--sp];
                stack[sp++] = a ^ b;
                printf("XOR => %d ^ %d = %d\n", a, b, a ^ b);
                break;
            }

            case 15: // CMP_EQ
            {
                int b = stack[--sp];
                int a = stack[--sp];
                int eq = (a == b) ? 1 : 0;
                stack[sp++] = eq;
                printf("CMP_EQ => %d == %d => %d\n", a, b, eq);
                break;
            }

            case 16: // CHECK
            {
                int ok = 1;
                for (int i = 0; i < 16; ++i) {
                    if (stack[i] != (cipher[i] - 20)) {
                        ok = 0;
                        break;
                    }
                }
                verdict = ok ? 1 : -1;
                printf("CHECK => %s\n", ok ? "SUCCESS" : "FAIL");
                goto end;
            }

            case 18: // JUMP_IF_ZERO
            {
                int c = stack[--sp];
                if (c == 0) {
                    printf("JUMP_IF_ZERO to %d (taken)\n", arg);
                    ip = arg;
                    continue;
                } else {
                    printf("JUMP_IF_ZERO to %d (skipped)\n", arg);
                }
                break;
            }

            default:
                verdict = 500;
                printf("INVALID OPCODE %d at ip=%d\n", opcode, ip);
                goto end;
        }

        ip += 2;
    }

    verdict = 501;

end:
    printf("Verdict: %d\n", verdict);
    if (verdict == 1) {
        printf("Final stack[0..15]:\n");
        for (int i = 0; i < 16; ++i) {
            printf("%d ", stack[i]);
        }
        printf("\n");
    }

    return 0;
}

```

co_consts的前16个字符是空的,结合前面我们输入的32个字符的数据,和代码将两个字符合并的逻辑,逆向出能使这里的代码通过检测的input

L3HCTF{df6ef2e93c249eca468388c35a143283}

# easyvm
主函数很简单,最重要的就是这三个函数

![](https://pic1.imgdb.cn/item/6885aaae58cb8da5c8e36ef8.png)

由于VM函数内部体积庞大,程序处理流程也很复杂难以跟踪,我们选择跟踪运算符的执行流程,查看相关的数据处理过程,从而推断出加密算法.

具体操作见[L3HCTF WP | Liv's blog](https://tkazer.github.io/2025/07/14/L3HCTF/index.html)师傅的博客

要补充的是下条件断点的时候注意取消这个选项,这样运行时不会停下,方便我们查看调试信息

![](https://pic1.imgdb.cn/item/6885acff58cb8da5c8e3707d.png)

这里截取一段output出的数据

```cpp
91919190 = 32323232 << 3;
// input[1] << 3
36FD3D5D = 91919190 + A56BABCD;
// (input[1] << 3) + A56BABCD
32323232 = 32323232 + 0;
// tmp1 = input[1] + sum
32323232 = 32323232 + 0;
// tmp2 = tmp1 + 0
4CF0F6F = 32323232 ^ 36FD3D5D;
// ((input[1] << 3) + A56BABCD) ^ (input[1] + sum + 0) 
3232323 = 32323232 >> 4;
// input[1] >> 4
3232322 = 3232323 + FFFFFFFF;
// (input[1] >> 4) + FFFFFFFF
7EC2C4D = 4CF0F6F ^ 3232322;
// ((input[1] << 3) + A56BABCD) ^ (input[1] + sum + 0) ^ ((input[1] >> 4) + FFFFFFFF)
391D5D7E = 7EC2C4D + 31313131;
// v0 += ((input[1] << 3) + A56BABCD) ^ (input[1] + sum + 0) ^ ((input[1] >> 4) + FFFFFFFF)
11223344 = 0 + 11223344;
// sum = 0 + 11223344  
E47575F8 = 391D5D7E << 2;
// v0 << 2
E47575F7 = E47575F8 + FFFFFFFF;
// (v0 << 2) + FFFFFFFF
4A3F90C2 = 391D5D7E + 11223344;
// v0 + sum
F60D7FC3 = 4A3F90C2 + ABCDEF01;
// v0 + sum + ABCDEF01
12780A34 = F60D7FC3 ^ E47575F7;
// ((v0 << 2) + FFFFFFFF) ^ (v0 + sum + ABCDEF01)
1C8EAEB = 391D5D7E >> 5;
// v0 >> 5
A73496B8 = 1C8EAEB + A56BABCD;
// (v0 >> 5) + A56BABCD
B54C9C8C = 12780A34 ^ A73496B8;
// ((v0 << 2) + FFFFFFFF) ^ (v0 + sum + ABCDEF01) ^ (v0 >> 5) + A56BABCD)
E77ECEBE = B54C9C8C + 32323232;
// v1 += ((v0 << 2) + FFFFFFFF) ^ (v0 + sum + ABCDEF01) ^ ((v0 >> 5) + A56BABCD)
3F = 40 - 1; // 轮数减1
```

标准的TEA加密算法

```cpp
void encrypt (uint32_t* v, uint32_t* k) {

    uint32_t v0=v[0], v1=v[1], sum=0, i;           /* set up */
    uint32_t delta=0x9e3779b9;                
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */

    for (i=0; i < 32; i++) {                       /* basic cycle start */
        sum += delta;
        v0 += ((v1<<4) + k0) ^ (v1 + sum) ^ ((v1>>5) + k1);
        v1 += ((v0<<4) + k2) ^ (v0 + sum) ^ ((v0>>5) + k3);
    }                                              /* end cycle */
    v[0]=v0; v[1]=v1;
}
```

根据运算分析出来的加密算法

```cpp
unsigned int key[] = {0, 0xA56BABCD, 0xFFFFFFFF, 0xABCDEF01}

void encrypt_easy_vm (uint32_t* v, uint32_t* k) {
	uint32_t v0=v[0], v1=v[1], sum=0, i;           /* set up */
    uint33_t delta=0x11223344;                
    uint32_t k0=k[0], k1=k[1], k2=k[2], k3=k[3];   /* cache key */

    for (i=0; i < 40; i++) {                       /* basic cycle start */
        v0 += ((v1<<3) + k1) ^ (v1 + sum + k0) ^ ((v1>>4) + k2);
        sum += delta;
        v1 += ((v0<<2) + k2) ^ (v0 + sum + k3) ^ ((v0>>5) + k1);
    }                                              /* end cycle */
    v[0]=v0; 
    v[1]=v1;
}
```

可以分析出这是经过修改后的tea算法,从cmp_with_cipher函数中dump出密文编写脚本即可解密
注意的是delta是全局变量,用于每一次cipher,所以我们逆序编写脚本

```cpp
#include <iostream>
#include <Windows.h>

const uint32_t delta = 0x11223344;
DWORD sum = delta * 0x40 * 4;

void decrypt_easy_vm(uint32_t *v, uint32_t *k)
{
    uint32_t v0 = v[0], v1 = v[1];

    uint32_t k0 = k[0], k1 = k[1], k2 = k[2], k3 = k[3];

    printf("sum: %X\n", sum);
    for (uint32_t i = 0; i < 0x40; i++)             /* 反向循环 40 次 */
    {
        v1 -= ((v0 << 2) + k2) ^ (v0 + sum + k3) ^ ((v0 >> 5) + k1);

        sum -= delta;

        v0 -= ((v1 << 3) + k1) ^ (v1 + sum + k0) ^ ((v1 >> 4) + k2);
    }

    v[0] = v0;
    v[1] = v1;
    printf("v0 : %X\nv1 : %X\n", v0, v1);
}

int main() {

    unsigned int key[] = { 0, 0xA56BABCD, 0xFFFFFFFF, 0xABCDEF01 };

    unsigned int v8[8];    
    v8[0] = 0x877A62A6;
    v8[1] = 0x6A55F1F3;
    v8[2] = 0xAE194847;
    v8[3] = 0xB1E643E7;
    v8[4] = 0xA94FE881;
    v8[5] = 0x9BC8A28A;
    v8[6] = 0xC4CFAA9F;
    v8[7] = 0xF1A00CA1;

    for (int i = 6; i >= 0; i -= 2) {
        decrypt_easy_vm(&v8[i], key);
    }
    
    printf("L3HCTF{%.32s}", v8);

    return 0;
}
```

![](https://pic1.imgdb.cn/item/6886287758cb8da5c8e5035c.png)

L3HCTF{9c50d10ba864bedfb37d7efa4e110bf2}

# ez_android
java层有很严重的混淆,直接观察lib

筛选ez_android_lib可以找到这些函数,一个个观察可以发现这个函数有加密的逻辑
![](https://pic1.imgdb.cn/item/688747ff58cb8da5c8e8c345.png)

丢给gpt分析加密的逻辑,直接一把梭了

```python
# -*- coding: utf-8 -*-

K = b"dGhpc2lzYWtleQ"   # 14 字节密钥表（ASCII），非 base64 解码后的内容

TARGET_HEX = "0c1525a06396400a5c1665402906e11f90722c0e4c0a02fc4f322a"
TARGET = bytes.fromhex(TARGET_HEX)

def rol8(x, r):
    return ((x << r) | (x >> (8 - r))) & 0xFF

def ror8(x, r):
    return ((x >> r) | ((x << (8 - r)) & 0xFF)) & 0xFF

def idx_odd(i: int) -> int:
    # 生成序列 1,3,5,7,9,11,13,1,3,5,...
    x = 2 * i + 1
    k = (147 * x) >> 11
    return x - 14 * k

def encrypt27(buf: bytes) -> bytes:
    assert len(buf) == 27
    out = bytearray(27)
    for i in range(27):
        i1 = i % 14
        odd = idx_odd(i)
        t = (K[odd] + (buf[i] ^ K[i1])) & 0xFF
        r = K[(i + 3) % 14] & 7
        out[i] = K[(i + 4) % 14] ^ rol8(t, r)
    return bytes(out)

def decrypt27(ct: bytes) -> bytes:
    assert len(ct) == 27
    out = bytearray(27)
    for i in range(27):
        odd = idx_odd(i)
        r = K[(i + 3) % 14] & 7
        t = ct[i] ^ K[(i + 4) % 14]
        z = ror8(t, r)
        x = ((z - K[odd]) & 0xFF) ^ K[i % 14]
        out[i] = x
    return bytes(out)

def main():
    # 1) 由目标密文反推原始明文（正确输入）
    plain = decrypt27(TARGET)
    print("明文：", plain.decode(errors="ignore"))
    print("明文hex：", plain.hex())

    # 2) 验证：再次加密应回到目标
    enc = encrypt27(plain)
    print("回加密是否匹配目标：", enc == TARGET)

    # 3) 也可自行测试任意输入
    candidate = b"L3HCTF{ez_rust_reverse_lol}"
    print("测试候选是否正确：", encrypt27(candidate) == TARGET)

if __name__ == "__main__":
    main()

```

L3HCTF{ez_rust_reverse_lol}

# Obfuscated
超绝混淆题目,用了一大堆函数把栈帧混乱了,并且直接跳过程序还会直接结束.

汇编层单步跟踪可以找到一个ptrace反调试,nop后可以继续调试,往下继续调试一大段可以找到scanf和cmp,从中可以推断出flag的长度是32个字节

然后观察函数表,排除了一大段用于控制流混淆的函数,可以找到加密函数

![](https://pic1.imgdb.cn/item/688754f458cb8da5c8e9061a.png)

由于我用了htrng和d810两个去混淆插件,所以看起来还是比较清晰的,但是动态调试的时候就会出错,所以要跟着汇编观察一下变量

识别出这是魔改了的RC5加密函数

标准RC5加密

```cpp
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
```

复原的修改后的加密函数,轮数是12轮

```cpp
void RC5_Encrypt(WORD *pt, WORD *ct) {
    WORD A = pt[0] + S[0];
    WORD B = pt[1] + S[1];
    for (int i = 1; i <= r; i++) {
        A = ROTL(A ^ B, B) + S[2 * i];
        B = ROTL(B ^ A, A) + S[2 * i + 1];

		A ^= B;
    }
    ct[0] = A;
    ct[1] = B;
}
```

RC5函数解密需要SBOX,可以从sub_55CD39CEB250这个函数中dump出来,这个是KSA密钥拓展函数

```cpp
unsigned int Sbox[26] = {  
       0x122F2C9C, 0xE3BCCAE7, 0xD0FFC0F2, 0xD9A12544, 0x8A27992F, 0x55B1B935, 0x9110B161, 0x92811564,  
       0x5CE9B359, 0x77C79A51, 0x4265527A, 0x8AB57C4B, 0x11529FA4, 0x9D9F63FF, 0xA970B936, 0xC8EABA0D,  
       0x9A0EB4AA, 0xB0BC6E7F, 0x9784B100, 0x70DCD3AE, 0x6057A44E, 0x89187658, 0xE00098A8, 0x45773540,  
       0xF9374F1A, 0x913FA548  
    };
```

密文则可以从这个函数中的v3中dump出来,这个是密文比较函数

![](https://pic1.imgdb.cn/item/688756e558cb8da5c8e90cad.png)

解密魔改后的RC5函数即可 L3HCTF{5fd277be39046905ef6348ba89131922}