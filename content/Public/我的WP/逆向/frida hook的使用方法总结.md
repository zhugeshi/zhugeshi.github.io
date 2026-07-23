---
profileName: zhugeshi8@gmail.com
postId: "22"
postType: post
categories:
  - 1
---
# 前言
最近刚好在学习安卓逆向,又碰巧在学习frida的使用方法,做到一道攻防世界上面的题目,想着是否能够借助这次机会来学习一下Frida的使用方法
# Frida Hook使用方法
一些参考链接: todo
# 例题讲解
## Phonix
### Step1
首先是运行一下看看它的实现方式,发现是input加验证的方式

![|600](https://pic1.imgdb.cn/item/6838703c58cb8da5c81ae771.png)

我们接着反汇编它的代码

```java
package com.ph0en1x.android_crackme;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;
import java.io.UnsupportedEncodingException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

/* loaded from: classes.dex */
public class MainActivity extends AppCompatActivity {
    EditText etFlag;

    public native String encrypt(String str);

    public native String getFlag();

    static {
        System.loadLibrary("phcm");
    }

    /* JADX INFO: Access modifiers changed from: protected */
    @Override // android.support.v7.app.AppCompatActivity, android.support.v4.app.FragmentActivity, android.app.Activity
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        this.etFlag = (EditText) findViewById(R.id.flag_edit);
    }

    public void onGoClick(View v) {
        String sInput = this.etFlag.getText().toString();
        if (getSecret(getFlag()).equals(getSecret(encrypt(sInput)))) {
            Toast.makeText(this, "Success", 1).show();
        } else {
            Toast.makeText(this, "Failed", 1).show();
        }
    }

    public String getSecret(String string) {
        try {
            byte[] hash = MessageDigest.getInstance(encrypt("KE3TLNE6M43EK4GM34LKMLETG").substring(5, 8)).digest(string.getBytes("UTF-8"));
            if (hash != null) {
                StringBuilder hex = new StringBuilder(hash.length * 2);
                for (byte b : hash) {
                    if ((b & 255) < 16) {
                        hex.append("0");
                    }
                    hex.append(Integer.toHexString(b & 255));
                }
                return hex.toString();
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e2) {
            e2.printStackTrace();
        }
        return null;
    }
}
```

我们可以看到两个关键的地方,一个是OnGoClick函数,另一个是getSecret函数

```java
public void onGoClick(View v) {
        String sInput = this.etFlag.getText().toString();
        if (getSecret(getFlag()).equals(getSecret(encrypt(sInput)))) {
            Toast.makeText(this, "Success", 1).show();
        } else {
            Toast.makeText(this, "Failed", 1).show();
        }
    }

    public String getSecret(String string) {
        try {
            byte[] hash = MessageDigest.getInstance(encrypt("KE3TLNE6M43EK4GM34LKMLETG").substring(5, 8)).digest(string.getBytes("UTF-8"));
            if (hash != null) {
                StringBuilder hex = new StringBuilder(hash.length * 2);
                for (byte b : hash) {
                    if ((b & 255) < 16) {
                        hex.append("0");
                    }
                    hex.append(Integer.toHexString(b & 255));
                }
                return hex.toString();
            }
        } catch (UnsupportedEncodingException e) {
            e.printStackTrace();
        } catch (NoSuchAlgorithmException e2) {
            e2.printStackTrace();
        }
        return null;
    }
```

但是我们仔细分析一下这段代码

```java
if (getSecret(getFlag()).equals(getSecret(encrypt(sInput)))) {
            Toast.makeText(this, "Success", 1).show();
        } else {
            Toast.makeText(this, "Failed", 1).show();
        }
```

可以发现,程序将我们的由于两边都有getSecret函数,所以我们只需要进行getflag()和encrypt(sInput)的比较就可以了.
### Step2
通过分析so文件,我们可以得知encrypt()函数就是简单的把sInput的每一个ascll码加上了1,所以现在我们只需要得到getflag()的返回值就好了.

我们接下来可以尝试使用frida来hook这个函数.

```java
function firethehome(){
    Java.perform(function(){
        var MainAct = Java.use("com.ph0en1x.android_crackme.MainActivity");

        MainAct.getFlag.implementation = function(){
            var result = this.getFlag();
            console.log("[*] getFlag() called. Original return: " + result);

            // 修改每个字符：ASCII + 1
            var modified = "";
            for (var i = 0; i < result.length; i++) {
                var c = result.charCodeAt(i);      // 获取 ASCII 码
                modified += String.fromCharCode(c + 1);  // 转成新字符
            }

            console.log("[*] Modified return: " + modified);
            return modified;
        };
    });
}

setImmediate(firethehome);
```

最后就可以成功得到flag了

`[*] Modified return: flag{Ar3_y0u_go1nG_70_scarborough_Fair}`