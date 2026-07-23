# 程序分析

ida载入有反调试

导入表搜索发现IsDebugPresent,跟踪到sub_140001800函数

```cpp
bool sub_140001800()
{
  HANDLE CurrentProcess; // rax
  BOOL pbDebuggerPresent; // [rsp+20h] [rbp-18h] BYREF

  if ( IsDebuggerPresent() )
    return 1;
  pbDebuggerPresent = 0;
  CurrentProcess = GetCurrentProcess();
  CheckRemoteDebuggerPresent(CurrentProcess, &pbDebuggerPresent);
  return pbDebuggerPresent;
}
```

回追进汇编nop掉if判断逻辑后可以正常调试

```cpp
__int64 __fastcall sub_140001860(CDialog *a1)
{
  CDialog::OnInitDialog(a1);
  sub_140002E30(a1, *((_QWORD *)a1 + 46), 1LL);
  sub_140002E30(a1, *((_QWORD *)a1 + 46), 0LL);
  if ( !sub_140001800() )
    return 1LL;
  CDialog::EndDialog(a1, 2);
  return 0LL;
}
```

运行发现输入错误的flag会在编辑框中显示key错误

在 `CWnd::SetWindowTextW`处下断点,跟踪到主要逻辑

```cpp
// Hidden C++ exception states: #wind=3
__int64 __fastcall sub_140001A60(__int64 a1)
{
  __int64 v1; // rax
  char *ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_; // rax
  const wchar_t *v3; // rax
  char v5; // [rsp+20h] [rbp-58h]
  __int64 (__fastcall *v6)(); // [rsp+28h] [rbp-50h]
  __int64 s[4]; // [rsp+30h] [rbp-48h] BYREF
  _BYTE v8[8]; // [rsp+50h] [rbp-28h] BYREF
  _BYTE v9[8]; // [rsp+58h] [rbp-20h] BYREF

  CWnd::UpdateData(a1, 1);
  v6 = off_1400100B8[2];
  v1 = ATL::CSimpleStringT<wchar_t,1>::operator wchar_t const *(a1 + 376);
  ATL::CStringT<char,StrTraitMFC_DLL<char,ATL::ChTraitsCRT<char>>>::CStringT<char,StrTraitMFC_DLL<char,ATL::ChTraitsCRT<char>>>(
    v9,
    v1);
  ATL::CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>::CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>(v8);
  ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_ = ATL::CSimpleStringT<char,1>::GetString(v9);
  sub_140001D20(s, ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_);
  v5 = (v6)(s);
  sub_140002C70(s);
  if ( v5 )
    ATL::CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>::LoadStringW(v8, 101LL);
  else
    ATL::CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>::LoadStringW(v8, 102LL);
  v3 = ATL::CSimpleStringT<wchar_t,1>::operator wchar_t const *(v8);
  CWnd::SetWindowTextW((a1 + 384), v3);
  ATL::CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>::~CStringT<wchar_t,StrTraitMFC_DLL<wchar_t,ATL::ChTraitsCRT<wchar_t>>>(v8);
  return ATL::CStringT<char,StrTraitMFC_DLL<char,ATL::ChTraitsCRT<char>>>::~CStringT<char,StrTraitMFC_DLL<char,ATL::ChTraitsCRT<char>>>(v9);
}
```

动调发现v6是一个指向主要验证逻辑的函数指针,跟踪查看逻辑

```cpp
// Hidden C++ exception states: #wind=3
__int64 __fastcall sub_1400040A0(__int64 input)
{
  _QWORD *s0_head; // rax
  _QWORD *head; // rax
  _QWORD *v3; // rax
  char v5; // [rsp+20h] [rbp-158h] BYREF
  unsigned __int8 v6; // [rsp+21h] [rbp-157h]
  _BYTE v7[6]; // [rsp+22h] [rbp-156h] BYREF
  __int64 v8; // [rsp+28h] [rbp-150h]
  _QWORD *s0_end; // [rsp+30h] [rbp-148h]
  __int64 v10; // [rsp+38h] [rbp-140h]
  _QWORD *end; // [rsp+40h] [rbp-138h]
  __int64 v12; // [rsp+48h] [rbp-130h]
  _QWORD *v13; // [rsp+50h] [rbp-128h]
  __int64 v14; // [rsp+58h] [rbp-120h] BYREF
  __int64 v15; // [rsp+60h] [rbp-118h] BYREF
  __int64 v16; // [rsp+68h] [rbp-110h] BYREF
  __int64 v17; // [rsp+70h] [rbp-108h] BYREF
  __int64 v18; // [rsp+78h] [rbp-100h] BYREF
  __int64 v19; // [rsp+80h] [rbp-F8h] BYREF
  __int64 buf_1[3]; // [rsp+88h] [rbp-F0h] BYREF
  _BYTE buf[24]; // [rsp+A0h] [rbp-D8h] BYREF
  __int64 buf_2_input[3]; // [rsp+B8h] [rbp-C0h] BYREF
  _BYTE buf_0[24]; // [rsp+D0h] [rbp-A8h] BYREF
  __int64 s_1[4]; // [rsp+E8h] [rbp-90h] BYREF
  __int64 s_0[4]; // [rsp+108h] [rbp-70h] BYREF
  char out[32]; // [rsp+128h] [rbp-50h] BYREF
  char s_2[32]; // [rsp+148h] [rbp-30h] BYREF

  sub_140003FB0(s_0, 201LL);
  sub_140003FB0(s_1, 202LL);
  sub_140003FB0(s_2, 203LL);
  MIFClmnDbl::__autoclassinit2_unsigned___int64_(buf_0, 0x18uLL);// 初始化缓冲区
  v8 = unknown_libname_154(v7);
  s0_end = get_end(s_0, &v14);
  s0_head = get_head(s_0, &v15);
  sub_140004750(buf_0, *s0_head, *s0_end, v8);
  MIFClmnDbl::__autoclassinit2_unsigned___int64_(buf_1, 0x18uLL);
  v10 = unknown_libname_154(&v7[1]);
  end = get_end(s_1, &v16);
  head = get_head(s_1, &v17);
  sub_140004750(buf_1, *head, *end, v10);
  if ( len(buf_1) != 16 )
  {
    v5 = 0;
    sub_140004BD0(buf_1, 16LL, &v5);
  }
  MIFClmnDbl::__autoclassinit2_unsigned___int64_(buf_2_input, 0x18uLL);
  v12 = unknown_libname_154(&v7[2]);
  v13 = sub_1400053C0(input, &v18);
  v3 = sub_140005480(input, &v19);
  sub_140004860(buf_2_input, *v3, *v13, v12);
  MIFClmnDbl::__autoclassinit2_unsigned___int64_(buf, 0x18uLL);
  sub_140005200(buf);
  RCB_CBC(buf_0, buf_1, buf_2_input, buf);
  base64(out, buf);
  v6 = strcmp(out, s_2);
  sub_140002C70(out);
  sub_140005150(buf);
  sub_140005150(buf_2_input);
  sub_140005150(buf_1);
  sub_140005150(buf_0);
  sub_140002C70(s_2);
  sub_140002C70(s_1);
  sub_140002C70(s_0);
  return v6;
}
```

主要验证逻辑

```cpp
RCB_CBC(buf_0, buf_1, buf_2_input, buf);
base64(out, buf);
v6 = strcmp(out, s_2);
```

动调发现buf_0, buf_1, buf_2_input 分别是key, iv, 和明文
在RCB_CBC中进行了加密后再base64编码后和s_2比较

# 解密代码
把s_2解除base64编码后解密即可

让ai跑一份rc6_cbc的解密函数

```cpp
/* rc6_cbc_decrypt.c : 纯 C 实现 RC6-CBC 解密
 * 编译:  gcc rc6_cbc_decrypt.c -o rc6_cbc_decrypt
 */
#include <stdint.h>
#include <stdlib.h>
#include <string.h>
#include <stdio.h>

/* ————— RC6 常量 ————— */
#define W   32                  /* 字长 */
#define R   20                  /* 轮数 */
#define P32 0xB7E15163u         /* e */
#define Q32 0x9E3779B9u         /* φ */

static inline uint32_t ROTL32(uint32_t x, uint32_t n)
{ return (x << (n & 31)) | (x >> (32 - (n & 31))); }

static inline uint32_t ROTR32(uint32_t x, uint32_t n)
{ return (x >> (n & 31)) | (x << (32 - (n & 31))); }

/* ——— 1. RC6 密钥扩展 (与加密相同) ——— */
static void rc6_key_schedule(const uint8_t *key, size_t keylen, uint32_t S[2 * (R + 2)])
{
    /* 1-1  PKCS#7 补齐到 16 / 24 / 32 字节 */
    uint8_t real[32] = {0};
    size_t legal = keylen <= 16 ? 16 : (keylen <= 24 ? 24 : 32);
    memcpy(real, key, keylen);
    uint8_t pad = (uint8_t)(legal - keylen);
    memset(real + keylen, pad, pad);

    /* 1-2  字节 → 小端 32-bit L[] */
    uint32_t L[8] = {0};
    size_t c = legal / 4;
    for (size_t i = 0; i < legal; ++i)
        L[i / 4] |= (uint32_t)real[i] << (8 * (i & 3));

    /* 1-3  初始化 S[] */
    size_t t = 2 * (R + 2);     /* 44 */
    S[0] = P32;
    for (size_t i = 1; i < t; ++i) S[i] = S[i - 1] + Q32;

    /* 1-4  三倍混合 */
    uint32_t A = 0, B = 0;
    size_t i = 0, j = 0, v = 3 * ((c > t) ? c : t);
    for (size_t k = 0; k < v; ++k) {
        A = S[i] = ROTL32(S[i] + A + B, 3);
        B = L[j] = ROTL32(L[j] + A + B, A + B);
        i = (i + 1) % t;
        j = (j + 1) % c;
    }
}

/* ——— 2. RC6 解密单块 (ECB) ——— */
static void rc6_decrypt_block(const uint8_t in[16], uint8_t out[16], const uint32_t S[44])
{
    uint32_t A = ((uint32_t*)in)[0];
    uint32_t B = ((uint32_t*)in)[1];
    uint32_t C = ((uint32_t*)in)[2];
    uint32_t D = ((uint32_t*)in)[3];

    /* 逆向最后的操作 */
    C -= S[43];
    A -= S[42];

    /* 逆向主轮循环 */
    for (uint32_t i = R; i >= 1; --i) {
        /* 逆向轮转寄存器 */
        uint32_t tmp = D;  D = C;  C = B;  B = A;  A = tmp;
        
        uint32_t u = ROTL32(D * (2 * D + 1), 5);
        uint32_t t = ROTL32(B * (2 * B + 1), 5);
        C = ROTR32(C - S[2 * i + 1], t) ^ u;
        A = ROTR32(A - S[2 * i], u) ^ t;
    }

    /* 逆向初始操作 */
    D -= S[1];
    B -= S[0];

    ((uint32_t*)out)[0] = A;
    ((uint32_t*)out)[1] = B;
    ((uint32_t*)out)[2] = C;
    ((uint32_t*)out)[3] = D;
}

/* ——— 3. 移除 PKCS#7 填充 ——— */
static size_t remove_pkcs7_padding(uint8_t *data, size_t len)
{
    if (len == 0) return 0;
    
    uint8_t pad = data[len - 1];
    if (pad == 0 || pad > 16) return len;  /* 无效填充 */
    
    /* 检验填充是否正确 */
    for (size_t i = len - pad; i < len; ++i) {
        if (data[i] != pad) return len;  /* 填充错误 */
    }
    
    return len - pad;
}

/* ——— 4. RC6-CBC 解密接口 ——— */
size_t rc6_cbc_decrypt(const uint8_t *key, size_t keylen,
                       const uint8_t iv[16],
                       const uint8_t *ciphertext, size_t ct_len,
                       uint8_t **plaintext)
{
    if (ct_len % 16 != 0) return 0;  /* 密文长度必须是16的倍数 */
    
    /* 4-1  分配解密缓冲区 */
    *plaintext = malloc(ct_len);
    if (*plaintext == NULL) return 0;

    /* 4-2  生成轮密钥 */
    uint32_t S[44];
    rc6_key_schedule(key, keylen, S);

    /* 4-3  CBC 解密迭代 */
    uint8_t prev[16];
    memcpy(prev, iv, 16);

    for (size_t off = 0; off < ct_len; off += 16) {
        uint8_t block[16];
        
        /* 解密当前块 */
        rc6_decrypt_block(ciphertext + off, block, S);
        
        /* 与前一个密文块异或 (CBC) */
        for (int i = 0; i < 16; ++i) {
            (*plaintext)[off + i] = block[i] ^ prev[i];
        }
        
        /* 更新prev为当前密文块 */
        memcpy(prev, ciphertext + off, 16);
    }

    /* 4-4  移除PKCS#7填充 */
    size_t real_len = remove_pkcs7_padding(*plaintext, ct_len);
    
    return real_len;
}

/* ——— 5. 十六进制字符串转字节数组 ——— */
static size_t hex_to_bytes(const char *hex_str, uint8_t **bytes)
{
    size_t len = strlen(hex_str);
    if (len % 2 != 0) return 0;  /* 长度必须为偶数 */
    
    size_t byte_len = len / 2;
    *bytes = malloc(byte_len);
    if (*bytes == NULL) return 0;
    
    for (size_t i = 0; i < byte_len; ++i) {
        int high = (hex_str[2*i] >= '0' && hex_str[2*i] <= '9') ? hex_str[2*i] - '0' : 
                   (hex_str[2*i] >= 'A' && hex_str[2*i] <= 'F') ? hex_str[2*i] - 'A' + 10 :
                   (hex_str[2*i] >= 'a' && hex_str[2*i] <= 'f') ? hex_str[2*i] - 'a' + 10 : -1;
        int low = (hex_str[2*i+1] >= '0' && hex_str[2*i+1] <= '9') ? hex_str[2*i+1] - '0' : 
                  (hex_str[2*i+1] >= 'A' && hex_str[2*i+1] <= 'F') ? hex_str[2*i+1] - 'A' + 10 :
                  (hex_str[2*i+1] >= 'a' && hex_str[2*i+1] <= 'f') ? hex_str[2*i+1] - 'a' + 10 : -1;
        
        if (high == -1 || low == -1) {
            free(*bytes);
            return 0;
        }
        
        (*bytes)[i] = (uint8_t)((high << 4) | low);
    }
    
    return byte_len;
}

/* ——— 6. 示例 main ——— */
int main(void)
{
    const uint8_t key[] = "FSZ36f3vU8s5";          /* 12 字节原始密钥 */
    const uint8_t iv[16] = "WcE4Bbm4kHYQsAcX";     /* 16 字节初始向量 */
    
    /* 你提供的密文十六进制字符串 */
    const char *cipher_hex = "44A0936B3F9FB72D49DAAB33E0323AB7D6E63222C1C6A16BA48EF47D4E0831E99CCC894CFB3D48A154286C8B7531B5C5";
    
    /* 将十六进制字符串转换为字节数组 */
    uint8_t *ciphertext = NULL;
    size_t ct_len = hex_to_bytes(cipher_hex, &ciphertext);
    
    if (ct_len == 0) {
        printf("错误: 无法解析十六进制密文\n");
        return 1;
    }
    
    printf("密文长度: %zu 字节\n", ct_len);
    
    /* 解密 */
    uint8_t *plaintext = NULL;
    size_t pt_len = rc6_cbc_decrypt(key, sizeof(key) - 1, iv, 
                                    ciphertext, ct_len, &plaintext);
    
    if (pt_len == 0) {
        printf("解密失败\n");
        free(ciphertext);
        return 1;
    }
    
    printf("解密结果: ");
    for (size_t i = 0; i < pt_len; ++i) {
        if (plaintext[i] >= 32 && plaintext[i] <= 126) {
            putchar(plaintext[i]);  /* 可打印字符 */
        } else {
            printf("\\x%02X", plaintext[i]);  /* 不可打印字符用十六进制显示 */
        }
    }
    printf("\n");
    
    /* 清理内存 */
    free(ciphertext);
    free(plaintext);
    return 0;
}
```

flag{68f25cc8-1a9f-40e8-ac3b-a85982a52f8f}