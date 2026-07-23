---
profileName: zhugeshi8@gmail.com
postId: "32"
postType: post
categories:
  - 1
---
# hardtest
## 程序分析
开始的时候题目中存在检测,但是通过输入0可以通过检测

```cpp
    seed = time(0LL);
    srand(seed);
    v23 = rand() % 255 + 1;
    printf("input your number(1-255): ");
    if ( (unsigned int)__isoc99_scanf("%d", &v21) == 1 && v23 == v21 )
    {
        while ( getchar() != 10 )
            ;
```

接下来分析主逻辑,还原主体中的函数还原就可以分析出算法,进行解密即可.

## 解密脚本

```python
"""
Decryptor for the given scheme.

Fill SBOX (byte_555555556020) and TARGET (byte_555555556120) below.
- SBOX must be a list or bytes-like of 256 distinct values (0..255).
- TARGET is the byte sequence that the program compares against (same length as the flag).

Once filled, run:
    python3 decrypt_flag.py

If SBOX is a true permutation and TARGET was produced by the binary, you'll get the plaintext flag.
"""

from typing import List

# === Paste your tables here ===================================================
# Example format (replace with real data):
# SBOX = [0x00, 0x01, 0x02, ... 0xFF]  # <-- REPLACE with byte_555555556020
# TARGET = [0x12, 0x34, 0x56, ...]     # <-- REPLACE with byte_555555556120

SBOX: List[int] = [0x63, 0x7C, 0x77, 0x7B, 0xF2, 0x6B, 0x6F, 0xC5, 0x30, 0x1, 0x67, 0x2B, 0xFE, 0xD7, 0xAB, 0x76, 0xCA, 0x82, 0xC9, 0x7D, 0xFA, 0x59, 0x47, 0xF0, 0xAD, 0xD4, 0xA2, 0xAF, 0x9C, 0xA4, 0x72, 0xC0, 0xB7, 0xFD, 0x93, 0x26, 0x36, 0x3F, 0xF7, 0xCC, 0x34, 0xA5, 0xE5, 0xF1, 0x71, 0xD8, 0x31, 0x15, 0x4, 0xC7, 0x23, 0xC3, 0x18, 0x96, 0x5, 0x9A, 0x7, 0x12, 0x80, 0xE2, 0xEB, 0x27, 0xB2, 0x75, 0x9, 0x83, 0x2C, 0x1A, 0x1B, 0x6E, 0x5A, 0xA0, 0x52, 0x3B, 0xD6, 0xB3, 0x29, 0xE3, 0x2F, 0x84, 0x53, 0xD1, 0x0, 0xED, 0x20, 0xFC, 0xB1, 0x5B, 0x6A, 0xCB, 0xBE, 0x39, 0x4A, 0x4C, 0x58, 0xCF, 0xD0, 0xEF, 0xAA, 0xFB, 0x43, 0x4D, 0x33, 0x85, 0x45, 0xF9, 0x2, 0x7F, 0x50, 0x3C, 0x9F, 0xA8, 0x51, 0xA3, 0x40, 0x8F, 0x92, 0x9D, 0x38, 0xF5, 0xBC, 0xB6, 0xDA, 0x21, 0x10, 0xFF, 0xF3, 0xD2, 0xCD, 0xC, 0x13, 0xEC, 0x5F, 0x97, 0x44, 0x17, 0xC4, 0xA7, 0x7E, 0x3D, 0x64, 0x5D, 0x19, 0x73, 0x60, 0x81, 0x4F, 0xDC, 0x22, 0x2A, 0x90, 0x88, 0x46, 0xEE, 0xB8, 0x14, 0xDE, 0x5E, 0xB, 0xDB, 0xE0, 0x32, 0x3A, 0xA, 0x49, 0x6, 0x24, 0x5C, 0xC2, 0xD3, 0xAC, 0x62, 0x91, 0x95, 0xE4, 0x79, 0xE7, 0xC8, 0x37, 0x6D, 0x8D, 0xD5, 0x4E, 0xA9, 0x6C, 0x56, 0xF4, 0xEA, 0x65, 0x7A, 0xAE, 0x8, 0xBA, 0x78, 0x25, 0x2E, 0x1C, 0xA6, 0xB4, 0xC6, 0xE8, 0xDD, 0x74, 0x1F, 0x4B, 0xBD, 0x8B, 0x8A, 0x70, 0x3E, 0xB5, 0x66, 0x48, 0x3, 0xF6, 0xE, 0x61, 0x35, 0x57, 0xB9, 0x86, 0xC1, 0x1D, 0x9E, 0xE1, 0xF8, 0x98, 0x11, 0x69, 0xD9, 0x8E, 0x94, 0x9B, 0x1E, 0x87, 0xE9, 0xCE, 0x55, 0x28, 0xDF, 0x8C, 0xA1, 0x89, 0xD, 0xBF, 0xE6, 0x42, 0x68, 0x41, 0x99, 0x2D, 0xF, 0xB0, 0x54, 0xBB, 0x16]   # TODO: fill with 256 ints in 0..255

TARGET: List[int] = [0x97,0xD5,0x60,0x43,0xB4,0x10,0x43,0x73,0xF,0xDA,0x43,0xCD,0xD3,0xE8,0x73,0x4A,0x94,0xC3,0xCD,0x71,0xBD,0xDC,0x97,0x1A] # TODO: fill with the expected bytes (length = flag length)

# =============================================================================

def rol8(x: int, n: int) -> int:
    x &= 0xFF
    n &= 7
    return ((x << n) | (x >> (8 - n))) & 0xFF

def ror8(x: int, n: int) -> int:
    x &= 0xFF
    n &= 7
    return ((x >> n) | (x << (8 - n))) & 0xFF

def inv257(a: int) -> int:
    """Multiplicative inverse in Z_257 for a in [1..255], 0 -> 0; returns 0..255 (mod 257, truncated to 8 bits)."""
    a &= 0xFF
    if a == 0:
        return 0
    inv = pow(a, 255, 257)  # Fermat: a^255 ≡ a^{-1} (mod 257)
    return inv & 0xFF

def mulmod16(x: int, k: int) -> int:
    return (x * k) & 0xF

def encrypt_byte(x: int, j: int, sbox: List[int]) -> int:
    """One-byte forward transform (as in the binary)."""
    r = (j % 7) + 1
    y = rol8(x, r)
    z = rol8(y ^ 0x5A, 3)
    t = (mulmod16((z >> 4) & 0xF, 3) << 4) | mulmod16(z & 0xF, 5)
    u = inv257(t)
    w = ror8(u, 2)
    return sbox[w]

def decrypt_byte(e: int, j: int, sbox: List[int]) -> int:
    """Inverse transform to recover plaintext byte from expected byte e at position j."""
    # Invert SBOX: find index w s.t. sbox[w] == e
    # Prefer building once and reusing; do it inline here for clarity.
    # Create inverse mapping
    inv_sbox = [0] * 256
    seen = set()
    if len(sbox) != 256:
        raise ValueError("SBOX must have 256 entries.")
    for idx, val in enumerate(sbox):
        if not (0 <= val <= 255):
            raise ValueError("SBOX values must be 0..255.")
        if val in seen:
            raise ValueError("SBOX is not a permutation (duplicate value %d)." % val)
        seen.add(val)
        inv_sbox[val] = idx

    w = inv_sbox[e & 0xFF]
    u = rol8(w, 2)             # inverse of ror8(u,2)
    t = inv257(u)              # inverse of inv257(t) is itself
    # Invert nibble mapping: high uses *3 mod16 => inverse 11; low uses *5 mod16 => inverse 13
    z_hi = (11 * ((t >> 4) & 0xF)) & 0xF
    z_lo = (13 * (t & 0xF)) & 0xF
    z = (z_hi << 4) | z_lo
    y = ror8(z, 3) ^ 0x5A
    r = (j % 7) + 1
    x = ror8(y, r)
    return x & 0xFF

def build_inv_sbox(sbox: List[int]) -> List[int]:
    inv = [0] * 256
    seen = set()
    if len(sbox) != 256:
        raise ValueError("SBOX must have 256 entries.")
    for i, v in enumerate(sbox):
        if not (0 <= v <= 255):
            raise ValueError("SBOX values must be 0..255.")
        if v in seen:
            raise ValueError("SBOX is not a permutation (duplicate %d)" % v)
        seen.add(v)
        inv[v] = i
    return inv

def decrypt_all(target: List[int], sbox: List[int]) -> bytes:
    inv_sbox = build_inv_sbox(sbox)
    out = bytearray()
    for j, e in enumerate(target):
        w = inv_sbox[e & 0xFF]
        u = rol8(w, 2)
        t = inv257(u)
        z_hi = (11 * ((t >> 4) & 0xF)) & 0xF
        z_lo = (13 * (t & 0xF)) & 0xF
        z = (z_hi << 4) | z_lo
        y = ror8(z, 3) ^ 0x5A
        r = (j % 7) + 1
        x = ror8(y, r)
        out.append(x & 0xFF)
    return bytes(out)

def selftest():
    if not SBOX or not TARGET:
        print("[!] Please fill SBOX and TARGET first.")
        return
    # quick permutation check
    _ = build_inv_sbox(SBOX)
    # roundtrip check on a sample of bytes
    for j in range(64):
        for x in (0, 1, 2, 3, 0x10, 0x5A, 0x7F, 0x80, 0xFE, 0xFF):
            e = encrypt_byte(x, j, SBOX)
            xr = decrypt_byte(e, j, SBOX)
            assert xr == x, f"Roundtrip failed at j={j}, x=0x{x:02X}, got 0x{xr:02X}"
    print("[+] Roundtrip OK on sample set.")
    # try decrypt TARGET
    pt = decrypt_all(TARGET, SBOX)
    try:
        s = pt.decode('utf-8')
    except UnicodeDecodeError:
        s = pt.decode('latin-1')
    print("[+] Decrypted bytes:", pt)
    print("[+] As string:", s)

if __name__ == '__main__':
    selftest()

```

# minigame
## 程序分析
.wasm逆向题目,可以参考网上的一篇博客
.wat相关题目,可以使用wbat工具进行反编译

提示是微信小程序,用Unpakemin解密后观察里面的.wasm文件
拖入ida中分析,发现c,b两个函数,理解后发现就是简单的xor异或
dump出data解密即可

## 解密代码
```python
data = [
    0xFF, 0xF5, 0xF8, 0xFE, 0xE2, 0xFF, 0xF8, 0xFC, 0xA9,
    0xFB, 0xAB, 0xAE, 0xFA, 0xAD, 0xAC, 0xA8, 0xFA, 0xAE,
    0xAB, 0xA1, 0xA1, 0xAF, 0xAE, 0xF8, 0xAC, 0xAF, 0xAE,
    0xFC, 0xA1, 0xFA, 0xA8, 0xFB, 0xFB, 0xAD, 0xFC, 0xAC,
    0xAA, 0xE4
]

flag = ''.join(chr(b ^ 0x99) for b in data)
print(flag)
```