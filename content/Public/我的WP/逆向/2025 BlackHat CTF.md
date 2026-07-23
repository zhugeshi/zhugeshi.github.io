---
profileName: zhugeshi8@gmail.com
postId: "16"
postType: post
categories:
  - 1
---
# V1m
## 程序分析
```cpp
__pid_t sub_5555555552B1()
{
    _QWORD *v0; // rax
    __int64 v1; // rax
    __int64 v2; // rax
    __pid_t result; // eax
    char s_1[13]; // [rsp+3h] [rbp-18Dh] BYREF
    char s[8]; // [rsp+10h] [rbp-180h] BYREF
    unsigned __int64 v6; // [rsp+18h] [rbp-178h]
    unsigned __int64 v7; // [rsp+20h] [rbp-170h]
    _QWORD input[6]; // [rsp+30h] [rbp-160h] BYREF
    char v9; // [rsp+60h] [rbp-130h]
    _BYTE reg[48]; // [rsp+70h] [rbp-120h] BYREF
    __int64 v11; // [rsp+A0h] [rbp-F0h]
    __int64 v12; // [rsp+A8h] [rbp-E8h]
    __int64 v13; // [rsp+F0h] [rbp-A0h]
    int stat_loc; // [rsp+154h] [rbp-3Ch] BYREF
    void (__fastcall *v15)(_QWORD); // [rsp+158h] [rbp-38h]
    void (__fastcall *v16)(_QWORD); // [rsp+160h] [rbp-30h]
    unsigned __int64 v17; // [rsp+168h] [rbp-28h]
    __pid_t pid; // [rsp+174h] [rbp-1Ch]
    __int64 v19; // [rsp+178h] [rbp-18h]
    _QWORD *v20; // [rsp+180h] [rbp-10h]
    int j; // [rsp+188h] [rbp-8h]
    int i; // [rsp+18Ch] [rbp-4h]

    memset(input, 0, sizeof(input));
    v9 = 0;
    v20 = input;
    // enter the secret key
    *s = 0xF1EDB9EBFCEDF7DCLL;
    v6 = 0xEDFCEBFAFCEAB9FCLL;
    v7 = 0x99B9A3B9E0FCF2B9LL;
    for ( i = 0; i <= 23; ++i )
        s[i] ^= 0x99u;
    puts(s);
    __isoc23_scanf("%49s", input);

    // 这里应该是反调试
    v19 = seccomp_init(0x7FFF0000LL);
    // 如果有syscall 300,则触发异常,传回SIGSYS信号
    seccomp_rule_add(v19, 0x30000LL, 0x12CLL, 0LL);
    seccomp_load(v19);
    pid = fork();
    if ( !pid )
    {
        // 子进程
        // 分配了一段内存,用于存放shellcode
        v0 = mmap(0LL, 0xD50uLL, 7, 34, -1, 0LL);
        v16 = v0;
        *v0 = shellcode[0];
        v0[425] = shellcode[425];
        qmemcpy(
            ((v0 + 1) & 0xFFFFFFFFFFFFFFF8LL),
            (shellcode - (v0 - ((v0 + 1) & 0xFFFFFFFFFFFFFFF8LL))),
            8LL * (((v0 - ((v0 + 8) & 0xFFFFFFF8) + 3408) & 0xFFFFFFF8) >> 3));
        // 设置可以trace自身
        ptrace(PTRACE_TRACEME, 0LL, 0LL, 0LL);
        v15 = v16;
        // 调用程序,传入input参数
        v16(input);
        exit(0);
    }
    // 父进程,持续监测子进程状态
    while ( 1 )
    {
        result = waitpid(pid, &stat_loc, 0);    // 等待子进程传回信号
        if ( result == -1 )
            break;
        switch ( stat_loc >> 8 )
        {
            case 4:                             // 4：大概率是 SIGILL（非法指令）
                ptrace(PTRACE_GETREGS, pid, 0LL, reg);
                v1 = ptrace(PTRACE_PEEKTEXT, pid, v13, 0LL);
                LOWORD(v1) = 0;
                v17 = v1 | 0x9090;
                ptrace(PTRACE_POKETEXT, pid, v13, v1 | 0x9090);
                ptrace(PTRACE_GETREGS, pid, 0LL, reg);
                // a * b
                v11 = multiple(v11, v12);
                ptrace(PTRACE_SETREGS, pid, 0LL, reg);
                break;
            case 8:                             // 8：SIGFPE（算术异常）
                // 获取寄存器值
                ptrace(PTRACE_GETREGS, pid, 0LL, reg);
                // a ^ b
                v11 = xor(v11, v12);
                // 传回寄存器值
                ptrace(PTRACE_SETREGS, pid, 0LL, reg);
                v17 = ptrace(PTRACE_PEEKTEXT, pid, v13, 0LL) & 0xFFFFFFFFFF000000LL | 0x909090;
                ptrace(PTRACE_POKETEXT, pid, v13, v17);
                break;
            case 31:                            // 31：SIGSYS（非法系统调用）之类
                ptrace(PTRACE_GETREGS, pid, 0LL, reg);
                v2 = ptrace(PTRACE_PEEKTEXT, pid, v13, 0LL);
                LOWORD(v2) = 0;
                v17 = v2 | 0x9090;
                check_if_right(reg[16]);
            default:
                if ( (stat_loc & 0x7F) == 0 || stat_loc >> 8 == 17 )
                {
                    *s_1 = 0xCEB9EABEEDF8F1CDLL;
                    *&s_1[5] = 0x99FDEBF0FCCEB9EALL;
                    for ( j = 0; j <= 12; ++j )
                        s_1[j] ^= 0x99u;
                    puts(s_1);
                }
                break;
        }
        ptrace(PTRACE_CONT, pid, 0LL, 0LL);
    }
    return result;
}
```

追踪字符串我们可以找到这个函数,初步分析这就是一个父子进程调试执行shellcode的逻辑,父进程捕获了很多信号并进行处理,子进程中分配了一段数据,猜测是执行的程序,我们可以先将里面的数据dump出来进行分析.

![image.png|800](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251203184938.png)

分析一下这里的汇编代码,可以发现几个部分比较有意思.

```cpp
idiv rcx
...
...
ud2
```

我们先不急着下结论,先动调一下父进程来看一下

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251203185430.png)

单步跟踪会先进入case8中,这里有一个ptrace函数,通过查询可以知道这个函数会返回子进程当前的寄存器值

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251203185639.png)

跟踪一下reg返回的值.我们又可以知道这个函数返回的寄存器肯定是按照一个特定的顺序排列的.按照这个顺序(其实就是结构体),我们就可以恢复出每一个值对应的寄存器名称,然后我们再对应之前得到的shellcode就可以明白之前的shellcode在做什么了.

```cpp
struct user_regs_struct {
    unsigned long r15;
    unsigned long r14;
    unsigned long r13;
    unsigned long r12;
    unsigned long rbp;
    unsigned long rbx;
    unsigned long r11;
    unsigned long r10;
    unsigned long r9;
    unsigned long r8;
    unsigned long rax;
    unsigned long rcx;
    unsigned long rdx;
    unsigned long rsi;
    unsigned long rdi;
    unsigned long orig_rax;
    unsigned long rip;
    unsigned long cs;
    unsigned long eflags;
    unsigned long rsp;
    unsigned long ss;
    unsigned long fs_base;
    unsigned long gs_base;
    unsigned long ds;
    unsigned long es;
    unsigned long fs;
    unsigned long gs;
};
```

![image.png|600](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251203190155.png)

我这里只重点标注几个比较重要的寄存器,因为这几个寄存器在shellcode中运算比较重要.接下来再回来分析shellcode

```cpp
seg000:0000000000000000
seg000:0000000000000000                         sub_0           proc near
seg000:0000000000000000 49 89 F9                                mov     r9, rdi
seg000:0000000000000003 4D 31 E4                                xor     r12, r12
seg000:0000000000000006 4D 31 ED                                xor     r13, r13
seg000:0000000000000009 49 BC 1A 73 04 FE 00 00                 mov     r12, 0FE04731Ah
seg000:0000000000000009 00 00
seg000:0000000000000013 4D 31 DB                                xor     r11, r11
seg000:0000000000000016 45 8A 19                                mov     r11b, [r9]
seg000:0000000000000019 49 C7 C2 39 05 00 00                    mov     r10, 539h
seg000:0000000000000020 48 31 C0                                xor     rax, rax
seg000:0000000000000023 48 31 FF                                xor     rdi, rdi
seg000:0000000000000026 48 F7 F9                                idiv    rcx
seg000:0000000000000029 49 BA C5 9D 1C 81 00 00                 mov     r10, 811C9DC5h
seg000:0000000000000029 00 00
seg000:0000000000000033 48 31 C0                                xor     rax, rax
seg000:0000000000000036 48 31 FF                                xor     rdi, rdi
seg000:0000000000000039 48 F7 F9                                idiv    rcx
seg000:000000000000003C 49 C7 C2 93 01 00 01                    mov     r10, 1000193h
seg000:0000000000000043                         故意触发SIGILL
seg000:0000000000000043 0F 0B                                   ud2
seg000:0000000000000043                         sub_0           endp
seg000:0000000000000043
seg000:0000000000000045
seg000:0000000000000045                         ; =============== S U B R O U T I N E =======================================
seg000:0000000000000045
seg000:0000000000000045                         ; Attributes: noreturn
seg000:0000000000000045
seg000:0000000000000045                         BUG_w           proc near
seg000:0000000000000045 49 FF C1                                inc     r9                 ; 指针加1,取到下一个char
seg000:0000000000000048 4D 31 E3                                xor     r11, r12           ; 将r12常量和值异或
seg000:000000000000004B 4D 09 DD                                or      r13, r11           ; 将r12添加到最后
seg000:000000000000004E 49 BC 5C 63 04 F4 00 00                 mov     r12, 0F404635Ch
seg000:000000000000004E 00 00
seg000:0000000000000058 4D 31 DB                                xor     r11, r11
seg000:000000000000005B 45 8A 19                                mov     r11b, [r9]
seg000:000000000000005E 49 C7 C2 39 05 00 00                    mov     r10, 539h
seg000:0000000000000065 48 31 C0                                xor     rax, rax
seg000:0000000000000068 48 31 FF                                xor     rdi, rdi
seg000:000000000000006B 48 F7 F9                                idiv    rcx
seg000:000000000000006E 49 BA C5 9D 1C 81 00 00                 mov     r10, 811C9DC5h
seg000:000000000000006E 00 00
seg000:0000000000000078 48 31 C0                                xor     rax, rax
seg000:000000000000007B 48 31 FF                                xor     rdi, rdi
seg000:000000000000007E 48 F7 F9                                idiv    rcx
seg000:0000000000000081 49 C7 C2 93 01 00 01                    mov     r10, 1000193h
seg000:0000000000000088 0F 0B                                   ud2
```

idiv和ud2分别触发SIGFPE和SIGILL信号,将控制权递交給父进程,父进程分别处理这两个信号,修改r11d(input[i])寄存器的值.
具体的操作是将r11和r10通过自定义的算法计算,最后将结果和常量r12 xor后和r13的值or运算.

那么程序在哪里判断输入是否正确呢?我们回到主函数

```cpp
// 如果有syscall 300,则触发异常,传回SIGSYS信号
seccomp_rule_add(v19, 0x30000LL, 0x12CLL, 0LL);
seccomp_load(v19);
```

在程序的开头自己定义了一个规则,在syscall 300的时候,会触发一个SIGSYS信号.

```cpp
case 31:                            // 31：SIGSYS（非法系统调用）之类
	ptrace(PTRACE_GETREGS, pid, 0LL, reg);
	v2 = ptrace(PTRACE_PEEKTEXT, pid, v13, 0LL);
	LOWORD(v2) = 0;
	v17 = v2 | 0x9090;
	check_if_right(reg[16]);
```

```cpp
void __fastcall __noreturn check_if_right(int reg)
{
    char s_1[14]; // [rsp+1Bh] [rbp-25h] BYREF
    char s[15]; // [rsp+29h] [rbp-17h] BYREF
    int i; // [rsp+38h] [rbp-8h]
    int j; // [rsp+3Ch] [rbp-4h]

    if ( reg )
    {
        // worng key
        *s_1 = 0xFCD2B9FEF7F6EBCELL;
        *&s_1[6] = 0x99B9B1A3B9E0FCD2LL;
        for ( i = 0; i <= 13; ++i )
            s_1[i] ^= 0x99u;
        puts(s_1);
    }
    else
    {
        // right key
        *s = 0xB9EDFAFCEBEBF6DALL;
        *&s[7] = 0x99DDA3B9E0FCD2B9LL;
        for ( j = 0; j <= 14; ++j )
            s[j] ^= 0x99u;
        puts(s);
    }
    exit(0);
}
```

很明显了,这里就是最后的判断,只不过加密了log输出的信息.通过动调发现这里传入的r13的低两个字节.

综上,也就是说只有每一轮shellcode运行最后得到的结果xor立即数都是0,才能通过判断,所以我们就可以编写解密脚本了.
## 解密脚本
如果要计算的话我们需要计算乘法的逆元,我们直接采用爆破的方法

```python
targets = [
    0xfe04731a, 0xf404635c, 0xfa046cce, 0xd0042ab0, 
    0xdd043f27, 0xdb043c01, 0xe5044bbf, 0xc7041c85, 
    0xeb045531, 0xd90438db, 0xd0042ab0, 0xdf04424d, 
    0xd3042f69, 0xd1042c43, 0xd90438db, 0xe3044899, 
    0xc8041e18, 0xd3042f69, 0xe3044899, 0xc8041e18, 
    0xd40430fc, 0xd90438db, 0xe3044899, 0xd0042ab0, 
    0xdd043f27, 0xd2042dd6, 0xd8043748, 0xe3044899, 
    0xd3042f69, 0xda043a6e, 0xe3044899, 0xee0459ea, 
    0xd90438db, 0xca04213e, 0xd90438db, 0xce04278a, 
    0xcf04291d, 0xd90438db, 0xe3044899, 0xf9046b3b, 
    0xd2042dd6, 0xdb043c01, 0xd504328f, 0xd2042dd6, 
    0xd90438db, 0xd90438db, 0xce04278a, 0xcf04291d, 
    0xc1041313
]

def Fbyte(x: int) -> int:
    """
    对应 shellcode + ptrace 异常那套：
    - 32 位 h = x
    - h ^= 0x539
    - h ^= 0x811C9DC5
    - h *= 0x1000193
    返回最低 1 字节
    """
    h = x & 0xFFFFFFFF
    h ^= 0x539
    h ^= 0x811C9DC5
    h = (h * 0x1000193) & 0xFFFFFFFF  # 32-bit wrap
    return h & 0xFF

# 预计算 Fbyte 的逆映射：value -> 可能的原始字节（一般只有一个解）
inv_map = {}
for b in range(256):
    y = Fbyte(b)
    inv_map.setdefault(y, []).append(b)

# 逐位还原输入
res_bytes = []
for i, t in enumerate(targets):
    low = t & 0xFF               # 只看 r12 的最低字节
    candidates = inv_map.get(low, [])
    if not candidates:
        raise ValueError(f"Position {i}: no byte maps to {low:#x}")
    if len(candidates) > 1:
        print(f"[!] Position {i} 多解: {candidates}")
    res_bytes.append(candidates[0])

flag_bytes = bytes(res_bytes)
try:
    flag_str = flag_bytes.decode('utf-8')
except UnicodeDecodeError:
    flag_str = flag_bytes.decode('latin1')

print("bytes :", flag_bytes)
print("string:", flag_str)

# string: BHFlagY{Welcome_to_the_land_of_Reverse_Engineers}
```