# EZmac

```cpp
IDA_100004022 = [0x7D, 0x7B, 0x68, 0x7F, 0x69, 0x78, 0x44, 0x78, 0x72, 0x21, 0x74, 0x76, 0x75, 0x22, 0x26, 0x7B, 0x7C, 0x7E, 0x78, 0x7A, 0x2E, 0x2D, 0x7F, 0x2D]

flag = []

j = 57

for i in range(len(IDA_100004022)):
    print(chr(IDA_100004022[i] ^ j), end='')
    j += 1
 
# DASCTF{83c720da35436cc0}
```

虽然是mac,但是流程很简单,用不上动调

# Androidfile

明文字符串都通过w.i混淆。混淆逻辑是对两个字符串先base64解密之后异或得到值。

这里看到对输入的处理就是调用了C 。C是AES-CBC str2和str是随机生成的，但是通过a_p放在了最后的回显前缀上，所以可以根据题目给的flag数据包进行复原。但是这里str2和str都经过了一次RSA也就是D函数。RSA的密钥也给我了 所以只需要根据以上信息获取str2和str也就是key和iv 之后AES就可以了。

最后的回显会加上前缀a_p和<-encryptinput-> 最后是密文的base64形式。去看a_p的逻辑

a_p是一个rc4(Base64(input)) key是REVERSE硬编码。据此还原得到的flag数据包如下

```
enkey_QMz2qirA80LJiOs30Efl00JsrIv+ZdrM9iB74P/nCWOrzEemEOaq2lN1/V5/rOAoTgBanJO/Acpo
okhVIOVdsA==
eniv_hKH/M/v8zwVICeWlc652BZk2eA/c2g0cLpBwvWBVlphiwBBasdn9HPWk7sb/IaRh8eppZrToUwz6
f1eomFJkEQ=
<-encryptinput->UBUSWb+1P3Z/aokV67e5xQ7eaHoEj3JAeC0XA1RckTWdWZYCB/+D7qC3Hao74goX
```

这里要注意iv的长度其实不够 需要再添加一个=长度才对。这样就可以写脚本解密了。

```python
import base64
from binascii import hexlify
from Crypto.Cipher import AES
from Crypto.PublicKey import RSA
from Crypto.Util.Padding import unpad

ENKEY_B64 = (
    "QMz2qirA80LJiOs30Efl00JsrIv+ZdrM9iB74P/nCWOrzEemEOaq2lN1/V5/rOAoTgBanJO/AcpookhVIOVdsA=="
)

ENIV_B64 = (
    "hKH/M/v8zwVICeWlc652BZk2eA/c2g0cLpBwvWBVlphiwBBasdn9HPWk7sb/IaRh8eppZrToUwz6f1eomFJkEQ=="
)


C2_B64 = "UBUSWb+1P3Z/aokV67e5xQ7eaHoEj3JAeC0XA1RckTWdWZYCB/+D7qC3Hao74goX"

PRIVATE_KEY_B64 = (
    "MIIBVQIBADANBgkqhkiG9w0BAQEFAASCAT8wggE7AgEAAkEAncB8BH4egqfyJBoVPzGNIuQl/64e5fl1If+CwtICWoiRV4AMfHuiREB+XlTawJ7QD/ZJj2wO6sY4sdNhyYcC4QIDAQABAkEAh81Gdg+kcFHoD9AsbkRX/atuUtcwXkYL4gK2LMThpdEFHIO7Scr+SYfwqmm/LMtkbojEGEnNoIfmoLvGfhXaAQIhANDWo8OSMSQFnvh129cFiVfYKlS4ec24ixvFD8fUD4SRAiEAwWBuZ3kox1n21AsTAxom+E3z5KUUOSUjPXvG6tZBgVECIDOP2y0tSi6/qIll6BqFxmxG9eSnC4PMfaQkmonXBOHRAiBmJUPsUGmj8/eXxknCp7vSCYs9SZ3HGcDlp05Jmed8IQIhAJnE1PNe9lC5OazgRYhSG6bGCTbfFHT6OuwCVIxRSx4P"
)
def load_private_key() -> RSA.RsaKey:
    der_bytes = base64.b64decode(PRIVATE_KEY_B64)
    priv_key = RSA.import_key(der_bytes)
    return priv_key

def rsa_decrypt_raw_get_last16(cipher_b64: str, label: str, priv_key: RSA.RsaKey) -> bytes:
    
    cipher_bytes = base64.b64decode(cipher_b64)
    
    n = priv_key.n
    d = priv_key.d
    key_size = (n.bit_length() + 7) // 8  

    c_int = int.from_bytes(cipher_bytes, byteorder="big")
    m_int = pow(c_int, d, n)
    m_bytes = m_int.to_bytes(key_size, byteorder="big")
    last16 = m_bytes[-16:]
    return last16
def aes_cbc_decrypt_b64(cipher_b64: str, key: bytes, iv: bytes) -> str:
   
    ct = base64.b64decode(cipher_b64)
    if len(key) != 16 or len(iv) != 16:
        raise ValueError(f"AES key/iv 长度错误: key={len(key)}, iv={len(iv)}, 期望都是16字节")

    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt_padded = cipher.decrypt(ct)
    pt = unpad(pt_padded, AES.block_size)
    return pt.decode("utf-8")
def main():
    
    priv_key = load_private_key()
    key1_bytes = rsa_decrypt_raw_get_last16(ENKEY_B64, "ENKEY", priv_key)
    key2_bytes = rsa_decrypt_raw_get_last16(ENIV_B64, "ENIV", priv_key)
    plaintext = aes_cbc_decrypt_b64(C2_B64, key1_bytes, key2_bytes)
    print("\n[+] 解密成功，明文为：", repr(plaintext))
   
if __name__ == "__main__":
   main()
#[+] 解密成功，明文为： 'DASCTF{android_encrypto_file_and_plains}'
```

# Androidfff

blutter一下，直接丢反汇编给gemini3pro，ai脚本没写就出了DASCTF{flutter_is_so_easy}

不过就是一个异或也简单

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251209144249.png)

# Login

客户端和服务端通过两层RC4密钥拓展的RC4加密通信  
RSA的私钥硬编码在服务端里面了

标准 PKCS#7 填充 cbc aes128
rsa解密出key和iv然后解密passwd即可

![image.png](https://cloud-map-bed-1351541725.cos.ap-nanjing.myqcloud.com/pic/20251209144334.png)