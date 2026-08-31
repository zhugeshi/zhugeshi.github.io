# 目标与最终架构

这次配置的目标，是购买一台海外 VPS，并将其作为个人服务器使用，似乎还有一些神秘的作用（大雾）。

最后采用了下面的配置：

* 服务端：Ubuntu VPS
* 代理核心：sing-box
* 协议：Shadowsocks 2022
* 客户端：Clash Verge / Mihomo
* 代理端口：TCP + UDP 443
* 分流模式：Rule
* 国内流量：DIRECT
* 指定国外服务：通过 VPS

最终网络结构大致如下：

```text
                    ┌──── 国内网站 / 普通流量
                    │
                    │         DIRECT
                    │            │
电脑 / Clash Verge ─┤            ▼
                    │         本地网络
                    │
                    │
                    └──── ChatGPT / Google / YouTube 等
                              │
                              ▼
                      Shadowsocks 2022
                              │
                              ▼
                        美国 VPS :443
                              │
                              ▼
                           Internet
```

这种方式最大的优点，是可以利用 Clash/Mihomo 的规则系统，只让真正需要代理的流量经过 VPS，从而减少 VPS 流量消耗（其实我也不是很懂）

# 选择你心仪的对象

其实我根本不懂什么参数，我只会问问 ai 大人，让他帮我全网检索相关信息。

ai 大人在深思熟虑之后给我提供了几个选项，然后就看中了现在的这款，每个月只需要 20-30 块钱，性能比较垃圾但好在够用。

付款部署完之后我们应该干啥呢？当然是继续询问 ai 大人... chat 给我列出了一系列的步骤，接下来试试跟着它干吧。

# 配置过程

在首次通过平台提供的密码登录后，首先进行系统更新

```bash
apt update
apt upgrade -y
```

为了方便以后连接服务器，选择配置密钥对进行登录。

刚开始查询的时候发现当前 vps 禁止 ssh 密钥对，修改一下配置为 yes 即可

```shell
root@VM-qGcZ14MraO:~/.ssh# sshd -T | grep -E 'pubkeyauthentication|authorizedkeysfile|permitrootlogin'
permitrootlogin yes
pubkeyauthentication no
authorizedkeysfile .ssh/authorized_keys .ssh/authorized_keys2
```

接下来就可以在主机上生成密钥对了

```shell
# -t 使用的算法
# -C 使用的名称
# -f 保存的路径
ssh-keygen -t ed25519 -C "my-vps" -f ~/.ssh/id_ed25519_myvps
```

接下来通过密码正常通过 ssh 进入 vps，创建相关目录。
把本地 `.pub` 文件中的完整公钥粘进去并保存。然后设置权限：

```shell
mkdir -p /root/.ssh
chmod 700 /root/.ssh
vim /root/.ssh/authorized_keys

# 复制你的公钥到 authorized_keys 中

chmod 600 /root/.ssh/authorized_keys 
chown -R root:root /root/.ssh
```

主机上验证，并配置 ssh config。

```shell
ssh -i "$HOME\.ssh\id_ed25519_myvps" root@YOUR_VPS_IP

C:\Users\你的用户名\.ssh\config

Host myvps 
	HostName YOUR_VPS_IP 
	User root 
	IdentityFile ~/.ssh/id_ed25519_myvps 
	IdentitiesOnly yes
```

# 安装 sing-box

接下来我们需要一个东西转发我们的流量，这里选择使用了 sing-box 监听转发我们主机发来的流量。
- 在 VPS 上监听端口，比如 443
- 接收 Clash Verge 发来的加密代理流量
- 解密后再由 VPS 访问目标网站，并把结果返回给客户端

安装 sing-box，并检查 443 是否已经被占用

```bash
curl -fsSL https://sing-box.app/install.sh | sh

ss -lntup | grep ':443 '
```

如果没有输出，就可以让 sing-box 使用 TCP/UDP 443。之后生成 Shadowsocks 密钥，建立目录：

```bash
mkdir -p /etc/sing-box
chmod 700 /etc/sing-box
```

生成 16 字节 Base64 密钥，并设置权限

```bash
sing-box generate rand --base64 16 \
  > /root/ss-password.txt
  
chmod 600 /root/ss-password.txt
```

读取密码：

```bash
SS_PASSWORD=$(cat /root/ss-password.txt)

vim /etc/sing-box/config.json

# 写入以下配置
{
  "log": {
    "level": "info",
    "timestamp": true
  },
  "inbounds": [
    {
      "type": "shadowsocks",
      "tag": "ss-in",
      "listen": "::",
      "listen_port": 443,
      "method": "2022-blake3-aes-128-gcm",
      "password": "YOUR_SS_PASSWORD"
    }
  ]
}

chmod 600 /etc/sing-box/config.json
```

- 设置开机启动：`systemctl enable sing-box`
- 启动或重启：`systemctl restart sing-box`
- 查看状态：`systemctl status sing-box --no-pager -l`

日志类似这个样子：

```text
INFO inbound/shadowsocks[ss-in]:
tcp server started at [::]:443

INFO inbound/shadowsocks[ss-in]:
udp server started at [::]:443

INFO sing-box started
```

到这里，VPS 服务端已经配置完成。

# 配置 Clash（基于 Mihomo 内核）

我们大概需要这些东西：

- 监听一个端口
- 允许局域网访问
- 按照规则分流

- 使用 ipv4 
- 指定服务地址、端口、协议、密钥用于连接
- 可能需要 TUN 模式

有了这些需求，让 ai 大人再帮我们搓一个配置应该不是什么难事吧（

# 还可以干些啥？

我的博客已经通过 Hugo 框架通过薅羊毛的方式部署在 cloudfare page 上面了，每个月能免费构建好几千次呢，远远超出了我的使用需求了。不过以后如果有需求的话把博客迁移到 vps 上也不是不可以。但是也没那个必要似乎。

或者留着以后拿来当测试机也不错，总之就先这样就好。